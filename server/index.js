const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Nutrition calculation utilities
class NutritionCalculator {
  // Calculate BMI (Body Mass Index)
  static calculateBMI(weight, height) {
    // weight in kg, height in cm
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  }

  // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
  static calculateBMR(weight, height, age, gender) {
    // weight in kg, height in cm, age in years
    let bmr;
    if (gender.toLowerCase() === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    return bmr;
  }

  // Calculate TDEE (Total Daily Energy Expenditure)
  static calculateTDEE(bmr, activityLevel) {
    const activityMultipliers = {
      sedentary: 1.2,
      lightlyActive: 1.375,
      moderatelyActive: 1.55,
      veryActive: 1.725,
      superActive: 1.9
    };
    return bmr * (activityMultipliers[activityLevel] || 1.2);
  }

  // Calculate ideal weight range using BMI
  static calculateIdealWeight(height) {
    // height in cm
    const heightInMeters = height / 100;
    const minIdealWeight = 18.5 * (heightInMeters * heightInMeters);
    const maxIdealWeight = 24.9 * (heightInMeters * heightInMeters);
    return { min: minIdealWeight, max: maxIdealWeight };
  }

  // Calculate macronutrient distribution
  static calculateMacros(calories, carbPercent = 50, proteinPercent = 20, fatPercent = 30) {
    return {
      carbs: {
        calories: (calories * carbPercent) / 100,
        grams: (calories * carbPercent) / 100 / 4
      },
      protein: {
        calories: (calories * proteinPercent) / 100,
        grams: (calories * proteinPercent) / 100 / 4
      },
      fat: {
        calories: (calories * fatPercent) / 100,
        grams: (calories * fatPercent) / 100 / 9
      }
    };
  }

  // Calculate water intake recommendation
  static calculateWaterIntake(weight, activityLevel) {
    // Base: 35ml per kg of body weight
    let baseWater = weight * 35;
    
    // Add extra for activity level
    const activityBonus = {
      sedentary: 0,
      lightlyActive: 200,
      moderatelyActive: 400,
      veryActive: 600,
      superActive: 800
    };
    
    return baseWater + (activityBonus[activityLevel] || 0);
  }

  // Get BMI classification
  static getBMIClassification(bmi) {
    if (bmi < 18.5) return { category: 'Underweight', color: 'blue' };
    if (bmi < 25) return { category: 'Normal weight', color: 'green' };
    if (bmi < 30) return { category: 'Overweight', color: 'yellow' };
    return { category: 'Obese', color: 'red' };
  }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Diet Plan Calculator API is running' });
});

// Calculate comprehensive nutrition profile
app.post('/api/calculate', (req, res) => {
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
      fatPercent
    } = req.body;

    // Validate required fields
    if (!weight || !height || !age || !gender || !activityLevel) {
      return res.status(400).json({
        error: 'Missing required fields: weight, height, age, gender, activityLevel'
      });
    }

    // Calculate basic metrics
    const bmi = NutritionCalculator.calculateBMI(weight, height);
    const bmiClassification = NutritionCalculator.getBMIClassification(bmi);
    const bmr = NutritionCalculator.calculateBMR(weight, height, age, gender);
    const tdee = NutritionCalculator.calculateTDEE(bmr, activityLevel);
    const idealWeight = NutritionCalculator.calculateIdealWeight(height);
    const waterIntake = NutritionCalculator.calculateWaterIntake(weight, activityLevel);

    // Adjust calories based on goal
    let targetCalories = tdee;
    if (goal === 'lose') {
      targetCalories = tdee - 500; // 500 calorie deficit for ~1lb/week loss
    } else if (goal === 'gain') {
      targetCalories = tdee + 500; // 500 calorie surplus for ~1lb/week gain
    }

    // Calculate macronutrients
    const macros = NutritionCalculator.calculateMacros(
      targetCalories,
      carbPercent || 50,
      proteinPercent || 20,
      fatPercent || 30
    );

    const response = {
      personalInfo: {
        weight,
        height,
        age,
        gender,
        activityLevel,
        goal
      },
      metrics: {
        bmi: Math.round(bmi * 10) / 10,
        bmiClassification,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories: Math.round(targetCalories),
        idealWeight: {
          min: Math.round(idealWeight.min * 10) / 10,
          max: Math.round(idealWeight.max * 10) / 10
        },
        waterIntake: Math.round(waterIntake)
      },
      macronutrients: {
        carbs: {
          calories: Math.round(macros.carbs.calories),
          grams: Math.round(macros.carbs.grams)
        },
        protein: {
          calories: Math.round(macros.protein.calories),
          grams: Math.round(macros.protein.grams)
        },
        fat: {
          calories: Math.round(macros.fat.calories),
          grams: Math.round(macros.fat.grams)
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({ error: 'Internal server error during calculation' });
  }
});

// Get food database (mock data - replace with actual database later)
app.get('/api/foods', (req, res) => {
  const mockFoods = [
    {
      id: 1,
      name: 'Brown Rice',
      category: 'Grains',
      calories: 112,
      carbs: 23,
      protein: 2.6,
      fat: 0.9,
      fiber: 1.8,
      servingSize: '100g'
    },
    {
      id: 2,
      name: 'Chicken Breast',
      category: 'Protein',
      calories: 165,
      carbs: 0,
      protein: 31,
      fat: 3.6,
      fiber: 0,
      servingSize: '100g'
    },
    {
      id: 3,
      name: 'Broccoli',
      category: 'Vegetables',
      calories: 34,
      carbs: 7,
      protein: 2.8,
      fat: 0.4,
      fiber: 2.6,
      servingSize: '100g'
    },
    {
      id: 4,
      name: 'Sweet Potato',
      category: 'Vegetables',
      calories: 86,
      carbs: 20,
      protein: 1.6,
      fat: 0.1,
      fiber: 3,
      servingSize: '100g'
    },
    {
      id: 5,
      name: 'Salmon',
      category: 'Protein',
      calories: 208,
      carbs: 0,
      protein: 20,
      fat: 13,
      fiber: 0,
      servingSize: '100g'
    }
  ];

  res.json(mockFoods);
});

// Create meal plan
app.post('/api/meal-plan', (req, res) => {
  try {
    const { targetCalories, meals } = req.body;
    
    // Simple meal distribution (can be customized)
    const mealDistribution = {
      breakfast: 0.25,
      lunch: 0.35,
      dinner: 0.30,
      snacks: 0.10
    };

    const mealPlan = Object.keys(mealDistribution).map(meal => ({
      meal,
      targetCalories: Math.round(targetCalories * mealDistribution[meal]),
      foods: [] // Will be populated with selected foods
    }));

    res.json({ mealPlan, totalCalories: targetCalories });
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

app.listen(PORT, () => {
  console.log(`🚀 Diet Plan Calculator server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
});
