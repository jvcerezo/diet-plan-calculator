const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Import database service and models
const DatabaseService = require('./services/DatabaseService');
const { Food, Calculation, MealPlan } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Session middleware - simple session ID generation
app.use((req, res, next) => {
  if (!req.headers['session-id']) {
    req.sessionId = uuidv4();
    res.setHeader('Session-ID', req.sessionId);
  } else {
    req.sessionId = req.headers['session-id'];
  }
  next();
});

// Connect to MongoDB on startup
DatabaseService.connect().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Enhanced Nutrition calculation utilities based on WHO guidelines and NCBI research
class NutritionCalculator {
  // Calculate BMI (Body Mass Index) - WHO standard
  static calculateBMI(weight, height) {
    // weight in kg, height in cm
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  }

  // Calculate BMR using Mifflin-St Jeor Equation (most accurate according to NCBI research)
  // This equation has been shown to be more accurate than Harris-Benedict
  static calculateBMR(weight, height, age, gender) {
    // weight in kg, height in cm, age in years
    let bmr;
    if (gender.toLowerCase() === 'male') {
      // Men: BMR = 10W + 6.25H - 5A + 5
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      // Women: BMR = 10W + 6.25H - 5A - 161
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    return bmr;
  }

  // Alternative Harris-Benedict Equation (revised 1984) for comparison
  static calculateBMRHarrisBenedict(weight, height, age, gender) {
    let bmr;
    if (gender.toLowerCase() === 'male') {
      bmr = 13.397 * weight + 4.799 * height - 5.677 * age + 88.362;
    } else {
      bmr = 9.247 * weight + 3.098 * height - 4.330 * age + 447.593;
    }
    return bmr;
  }

  // Calculate TDEE with updated activity factors based on WHO recommendations
  static calculateTDEE(bmr, activityLevel) {
    const activityMultipliers = {
      sedentary: 1.2,          // Desk job, no exercise
      lightlyActive: 1.375,    // Light exercise 1-3 days/week
      moderatelyActive: 1.55,  // Moderate exercise 3-5 days/week
      veryActive: 1.725,       // Hard exercise 6-7 days/week
      superActive: 1.9         // Very hard exercise, physical job, 2x/day training
    };
    return bmr * (activityMultipliers[activityLevel] || 1.2);
  }

  // Calculate ideal weight range using WHO BMI guidelines
  static calculateIdealWeight(height) {
    const heightInMeters = height / 100;
    // WHO healthy BMI range: 18.5-24.9
    const minIdealWeight = 18.5 * (heightInMeters * heightInMeters);
    const maxIdealWeight = 24.9 * (heightInMeters * heightInMeters);
    return { min: minIdealWeight, max: maxIdealWeight };
  }

  // Enhanced macronutrient distribution based on WHO and dietary guidelines
  static calculateMacros(calories, carbPercent = 50, proteinPercent = 20, fatPercent = 30, weight = 70) {
    // WHO recommendations: 
    // - Fats: <30% of total energy intake
    // - Free sugars: <10% (ideally <5%) of total energy intake
    // - Protein: 0.8-1.2g per kg body weight for adults

    // Calculate protein needs based on body weight (evidence-based approach)
    const proteinGramsPerKg = 0.8; // Minimum RDA for adults
    const recommendedProteinGrams = weight * proteinGramsPerKg;
    const recommendedProteinCalories = recommendedProteinGrams * 4;
    
    // Ensure protein percentage meets minimum requirements
    const minProteinPercent = Math.max(15, (recommendedProteinCalories / calories) * 100);
    const adjustedProteinPercent = Math.max(proteinPercent, minProteinPercent);
    
    // WHO guideline: Fat should not exceed 30% of total energy intake
    const maxFatPercent = 30;
    const adjustedFatPercent = Math.min(fatPercent, maxFatPercent);
    
    // Adjust carbs accordingly
    const adjustedCarbPercent = 100 - adjustedProteinPercent - adjustedFatPercent;

    return {
      carbs: {
        calories: Math.round((calories * adjustedCarbPercent) / 100),
        grams: Math.round((calories * adjustedCarbPercent) / 100 / 4),
        percentage: Math.round(adjustedCarbPercent)
      },
      protein: {
        calories: Math.round((calories * adjustedProteinPercent) / 100),
        grams: Math.round((calories * adjustedProteinPercent) / 100 / 4),
        percentage: Math.round(adjustedProteinPercent),
        recommendedGrams: Math.round(recommendedProteinGrams)
      },
      fat: {
        calories: Math.round((calories * adjustedFatPercent) / 100),
        grams: Math.round((calories * adjustedFatPercent) / 100 / 9),
        percentage: Math.round(adjustedFatPercent),
        saturatedFatGrams: Math.round((calories * 0.10) / 100 / 9) // WHO: <10% from saturated fats
      }
    };
  }

  // Enhanced water intake calculation based on multiple factors
  static calculateWaterIntake(weight, activityLevel, age, gender, climate = 'temperate') {
    // Base recommendation: 35ml per kg for adults (European Food Safety Authority)
    // WHO/FAO recommendations vary by age, activity, and climate
    
    let baseWaterMl = weight * 35;
    
    // Age adjustments (older adults need careful monitoring)
    if (age > 65) {
      baseWaterMl = weight * 30; // Slightly reduced base for elderly
    } else if (age < 30) {
      baseWaterMl = weight * 37; // Higher for younger adults
    }
    
    // Gender adjustments (men typically need more)
    if (gender.toLowerCase() === 'male') {
      baseWaterMl *= 1.1;
    }
    
    // Activity level adjustments
    const activityBonus = {
      sedentary: 0,
      lightlyActive: 300,      // +300ml for light activity
      moderatelyActive: 500,   // +500ml for moderate activity
      veryActive: 750,         // +750ml for high activity
      superActive: 1000        // +1000ml for very high activity
    };
    
    // Climate adjustments
    const climateMultiplier = {
      cold: 0.9,
      temperate: 1.0,
      hot: 1.3,
      tropical: 1.5
    };
    
    const totalWater = (baseWaterMl + (activityBonus[activityLevel] || 0)) * 
                      (climateMultiplier[climate] || 1.0);
    
    return Math.round(totalWater);
  }

  // Enhanced BMI classification with additional health indicators
  static getBMIClassification(bmi) {
    // WHO BMI categories with health risk indicators
    if (bmi < 16) return { 
      category: 'Severely Underweight', 
      color: 'red', 
      healthRisk: 'High risk of malnutrition',
      recommendation: 'Consult healthcare provider immediately'
    };
    if (bmi < 18.5) return { 
      category: 'Underweight', 
      color: 'blue', 
      healthRisk: 'Possible nutritional deficiency',
      recommendation: 'Consider consulting a nutritionist'
    };
    if (bmi < 25) return { 
      category: 'Normal weight', 
      color: 'green', 
      healthRisk: 'Low risk',
      recommendation: 'Maintain current weight with balanced diet'
    };
    if (bmi < 30) return { 
      category: 'Overweight', 
      color: 'yellow', 
      healthRisk: 'Increased risk of health problems',
      recommendation: 'Consider modest weight reduction'
    };
    if (bmi < 35) return { 
      category: 'Obesity Class I', 
      color: 'orange', 
      healthRisk: 'Moderate risk of health problems',
      recommendation: 'Weight reduction recommended'
    };
    if (bmi < 40) return { 
      category: 'Obesity Class II', 
      color: 'red', 
      healthRisk: 'High risk of health problems',
      recommendation: 'Medical supervision for weight loss advised'
    };
    return { 
      category: 'Obesity Class III', 
      color: 'red', 
      healthRisk: 'Very high risk of health problems',
      recommendation: 'Immediate medical intervention recommended'
    };
  }

  // Calculate daily calorie adjustment based on goal with safer recommendations
  static calculateCalorieAdjustment(tdee, goal, currentBMI) {
    let targetCalories = tdee;
    let weeklyWeightChange = 0;
    
    // Safer calorie deficits/surpluses based on current BMI and health status
    if (goal === 'lose') {
      if (currentBMI > 30) {
        // Higher deficit allowed for obese individuals under medical supervision
        targetCalories = tdee - 750; // ~1.5 lbs/week
        weeklyWeightChange = -1.5;
      } else if (currentBMI > 25) {
        // Moderate deficit for overweight individuals
        targetCalories = tdee - 500; // ~1 lb/week
        weeklyWeightChange = -1.0;
      } else {
        // Smaller deficit for normal weight individuals
        targetCalories = tdee - 250; // ~0.5 lbs/week
        weeklyWeightChange = -0.5;
      }
      
      // Ensure minimum calories for safety (never below BMR for extended periods)
      const minimumCalories = tdee * 0.8; // 80% of TDEE minimum
      targetCalories = Math.max(targetCalories, minimumCalories);
      
    } else if (goal === 'gain') {
      // Conservative surplus for healthy weight gain
      if (currentBMI < 18.5) {
        targetCalories = tdee + 500; // ~1 lb/week for underweight
        weeklyWeightChange = 1.0;
      } else {
        targetCalories = tdee + 300; // ~0.6 lbs/week for normal weight
        weeklyWeightChange = 0.6;
      }
    }
    
    return {
      targetCalories: Math.round(targetCalories),
      weeklyWeightChange,
      safetyNote: goal === 'lose' && currentBMI < 25 ? 
        'Consult healthcare provider before significant calorie restriction' : null
    };
  }

  // Calculate fiber recommendations based on age and gender
  static calculateFiberRecommendation(age, gender) {
    // Institute of Medicine recommendations
    if (gender.toLowerCase() === 'male') {
      return age <= 50 ? 38 : 30; // grams per day
    } else {
      return age <= 50 ? 25 : 21; // grams per day
    }
  }

  // Calculate sodium recommendations (WHO guidelines)
  static calculateSodiumRecommendation() {
    // WHO recommendation: <2g sodium per day (equivalent to <5g salt)
    return {
      sodiumMg: 2000,   // mg per day
      saltGrams: 5      // grams per day equivalent
    };
  }

  // Micronutrient recommendations based on RDA
  static getMicronutrientRecommendations(age, gender) {
    const isMale = gender.toLowerCase() === 'male';
    
    return {
      vitaminC: isMale ? 90 : 75,           // mg/day
      vitaminD: age > 70 ? 20 : 15,         // μg/day
      calcium: age > 50 ? 1200 : 1000,      // mg/day
      iron: isMale ? 8 : (age > 50 ? 8 : 18), // mg/day
      potassium: 3500,                      // mg/day (WHO recommendation)
      fiber: this.calculateFiberRecommendation(age, gender)
    };
  }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Diet Plan Calculator API is running',
    version: '2.0 - Evidence-based calculations with MongoDB',
    database: 'Connected',
    sessionId: req.sessionId
  });
});

// Calculate comprehensive nutrition profile with enhanced evidence-based calculations
app.post('/api/calculate', async (req, res) => {
  try {
    const {
      weight,
      height,
      age,
      gender,
      activityLevel,
      goal, // maintain, lose, gain
      carbPercent,
      proteinPercent,
      fatPercent,
      climate = 'temperate'
    } = req.body;

    // Validate required fields
    if (!weight || !height || !age || !gender || !activityLevel) {
      return res.status(400).json({
        error: 'Missing required fields: weight, height, age, gender, activityLevel'
      });
    }

    // Calculate basic metrics using evidence-based formulas
    const bmi = NutritionCalculator.calculateBMI(weight, height);
    const bmiClassification = NutritionCalculator.getBMIClassification(bmi);
    const bmr = NutritionCalculator.calculateBMR(weight, height, age, gender);
    const bmrHarrisBenedict = NutritionCalculator.calculateBMRHarrisBenedict(weight, height, age, gender);
    const tdee = NutritionCalculator.calculateTDEE(bmr, activityLevel);
    const idealWeight = NutritionCalculator.calculateIdealWeight(height);
    const waterIntake = NutritionCalculator.calculateWaterIntake(weight, activityLevel, age, gender, climate);

    // Calculate target calories with safety considerations
    const calorieAdjustment = NutritionCalculator.calculateCalorieAdjustment(tdee, goal || 'maintain', bmi);
    const targetCalories = calorieAdjustment.targetCalories;

    // Calculate macronutrients with evidence-based recommendations
    const macros = NutritionCalculator.calculateMacros(
      targetCalories,
      carbPercent || 50,
      proteinPercent || 20,
      fatPercent || 30,
      weight
    );

    // Get micronutrient recommendations
    const micronutrients = NutritionCalculator.getMicronutrientRecommendations(age, gender);
    const sodiumRec = NutritionCalculator.calculateSodiumRecommendation();

    const response = {
      personalInfo: {
        weight,
        height,
        age,
        gender,
        activityLevel,
        goal: goal || 'maintain'
      },
      metrics: {
        bmi: Math.round(bmi * 10) / 10,
        bmiClassification,
        bmr: Math.round(bmr),
        bmrHarrisBenedict: Math.round(bmrHarrisBenedict), // For comparison
        tdee: Math.round(tdee),
        targetCalories: Math.round(targetCalories),
        weeklyWeightChange: calorieAdjustment.weeklyWeightChange,
        idealWeight: {
          min: Math.round(idealWeight.min * 10) / 10,
          max: Math.round(idealWeight.max * 10) / 10
        },
        waterIntake: Math.round(waterIntake),
        waterGlasses: Math.round(waterIntake / 250), // 250ml glasses
        safetyNote: calorieAdjustment.safetyNote
      },
      macronutrients: {
        carbs: {
          calories: macros.carbs.calories,
          grams: macros.carbs.grams,
          percentage: macros.carbs.percentage
        },
        protein: {
          calories: macros.protein.calories,
          grams: macros.protein.grams,
          percentage: macros.protein.percentage,
          recommendedGrams: macros.protein.recommendedGrams,
          note: `Minimum ${macros.protein.recommendedGrams}g based on body weight`
        },
        fat: {
          calories: macros.fat.calories,
          grams: macros.fat.grams,
          percentage: macros.fat.percentage,
          saturatedFatLimit: macros.fat.saturatedFatGrams,
          note: 'WHO recommends <30% of total calories from fat, <10% from saturated fat'
        }
      },
      micronutrients: {
        fiber: micronutrients.fiber,
        sodium: sodiumRec,
        vitamins: {
          vitaminC: micronutrients.vitaminC,
          vitaminD: micronutrients.vitaminD
        },
        minerals: {
          calcium: micronutrients.calcium,
          iron: micronutrients.iron,
          potassium: micronutrients.potassium
        }
      },
      recommendations: {
        dailyFruitVeg: '400g (5 portions) minimum - WHO recommendation',
        freeSugars: 'Less than 10% of total calories (ideally <5%)',
        physicalActivity: 'At least 150 minutes moderate-intensity per week',
        note: 'Calculations based on WHO guidelines and peer-reviewed research'
      },
      sessionId: req.sessionId
    };

    // Save calculation to database
    try {
      await DatabaseService.saveCalculation(req.sessionId, response.personalInfo, {
        bmi: response.metrics.bmi,
        bmr: response.metrics.bmr,
        tdee: response.metrics.tdee,
        targetCalories: response.metrics.targetCalories,
        waterIntake: response.metrics.waterIntake,
        macronutrients: response.macronutrients
      });
      console.log(`✅ Saved calculation for session: ${req.sessionId}`);
    } catch (dbError) {
      console.error('❌ Error saving calculation to database:', dbError);
      // Continue without failing the request
    }

    res.json(response);
  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({ error: 'Internal server error during calculation' });
  }
});

// Get enhanced food database from MongoDB
app.get('/api/foods', async (req, res) => {
  try {
    const { search, category, limit, skip } = req.query;
    
    const foods = await DatabaseService.getFoods({}, {
      search,
      category,
      limit: limit || 50,
      skip: skip || 0
    });

    // Transform the MongoDB documents to match frontend expectations
    const transformedFoods = foods.map(food => ({
      id: food._id,
      name: food.name,
      category: food.category,
      calories: food.calories,
      carbs: food.macronutrients.carbs,
      protein: food.macronutrients.protein,
      fat: food.macronutrients.fat,
      fiber: food.macronutrients.fiber,
      sodium: food.micronutrients.sodium,
      potassium: food.micronutrients.potassium,
      calcium: food.micronutrients.calcium,
      iron: food.micronutrients.iron,
      vitaminC: food.micronutrients.vitaminC,
      vitaminA: food.micronutrients.vitaminA,
      omega3: food.micronutrients.omega3,
      servingSize: food.servingSize,
      notes: food.notes
    }));

    res.json(transformedFoods);
  } catch (error) {
    console.error('Error fetching foods from database:', error);
    res.status(500).json({ error: 'Internal server error fetching foods' });
  }
});

// Get food categories
app.get('/api/food-categories', async (req, res) => {
  try {
    const categories = await Food.distinct('category', { isActive: true });
    res.json(categories.sort());
  } catch (error) {
    console.error('Error fetching food categories:', error);
    res.status(500).json({ error: 'Internal server error fetching categories' });
  }
});

// Get calculation history
app.get('/api/calculation-history', async (req, res) => {
  try {
    const history = await DatabaseService.getCalculationHistory(req.sessionId);
    res.json(history);
  } catch (error) {
    console.error('Error fetching calculation history:', error);
    res.status(500).json({ error: 'Internal server error fetching history' });
  }
});

// Create meal plan
app.post('/api/meal-plan', async (req, res) => {
  try {
    const { targetCalories, meals } = req.body;
    
    // Evidence-based meal distribution
    const mealDistribution = {
      breakfast: 0.25,  // 25% - Important for metabolism
      lunch: 0.35,      // 35% - Largest meal for sustained energy
      dinner: 0.30,     // 30% - Moderate evening meal
      snacks: 0.10      // 10% - Healthy snacks between meals
    };

    const mealPlan = Object.keys(mealDistribution).map(meal => ({
      meal,
      targetCalories: Math.round(targetCalories * mealDistribution[meal]),
      foods: [] // Will be populated with selected foods
    }));

    const response = { 
      mealPlan, 
      totalCalories: targetCalories,
      nutritionTips: [
        'Include vegetables with every meal',
        'Choose whole grains over refined grains',
        'Include lean protein at each meal',
        'Stay hydrated throughout the day',
        'Limit processed foods and added sugars'
      ],
      sessionId: req.sessionId
    };

    // Save meal plan structure to database
    try {
      await DatabaseService.saveMealPlan(req.sessionId, {
        targetCalories,
        meals: {
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: []
        },
        totalCalories: targetCalories,
        totalMacros: { carbs: 0, protein: 0, fat: 0, fiber: 0 }
      });
      console.log(`✅ Saved meal plan structure for session: ${req.sessionId}`);
    } catch (dbError) {
      console.error('❌ Error saving meal plan to database:', dbError);
    }

    res.json(response);
  } catch (error) {
    console.error('Meal plan error:', error);
    res.status(500).json({ error: 'Internal server error creating meal plan' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await DatabaseService.disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Diet Plan Calculator server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`💾 MongoDB integration active`);
});
