const mongoose = require('mongoose');
const { Food } = require('../models');

class DatabaseService {
  static async connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        // Removed deprecated options and added SSL configuration
        ssl: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ Connected to MongoDB successfully');
      
      // Seed database with initial food data if empty
      await this.seedDatabase();
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  static async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ MongoDB disconnection error:', error);
    }
  }

  static async seedDatabase() {
    try {
      const foodCount = await Food.countDocuments();
      
      if (foodCount === 0) {
        console.log('📦 Seeding database with initial food data...');
        
        const initialFoods = [
          {
            name: 'Brown Rice (cooked)',
            category: 'Whole Grains',
            calories: 111,
            macronutrients: {
              carbs: 23,
              protein: 2.6,
              fat: 0.9,
              fiber: 1.8
            },
            micronutrients: {
              sodium: 5,
              potassium: 43,
              calcium: 10,
              iron: 0.4
            },
            servingSize: '100g',
            notes: 'Good source of complex carbohydrates and fiber'
          },
          {
            name: 'Chicken Breast (skinless, cooked)',
            category: 'Lean Protein',
            calories: 165,
            macronutrients: {
              carbs: 0,
              protein: 31,
              fat: 3.6,
              fiber: 0
            },
            micronutrients: {
              sodium: 74,
              potassium: 256,
              calcium: 15,
              iron: 1.0
            },
            servingSize: '100g',
            notes: 'Excellent source of complete protein'
          },
          {
            name: 'Broccoli (cooked)',
            category: 'Vegetables',
            calories: 35,
            macronutrients: {
              carbs: 7,
              protein: 2.4,
              fat: 0.4,
              fiber: 3.3
            },
            micronutrients: {
              sodium: 41,
              potassium: 293,
              calcium: 40,
              iron: 0.7,
              vitaminC: 65
            },
            servingSize: '100g',
            notes: 'High in vitamin C, fiber, and antioxidants'
          },
          {
            name: 'Sweet Potato (baked)',
            category: 'Starchy Vegetables',
            calories: 90,
            macronutrients: {
              carbs: 21,
              protein: 2,
              fat: 0.1,
              fiber: 3.3
            },
            micronutrients: {
              sodium: 6,
              potassium: 475,
              calcium: 38,
              iron: 0.7,
              vitaminA: 961
            },
            servingSize: '100g',
            notes: 'Rich in beta-carotene and potassium'
          },
          {
            name: 'Salmon (Atlantic, cooked)',
            category: 'Fatty Fish',
            calories: 206,
            macronutrients: {
              carbs: 0,
              protein: 22,
              fat: 12,
              fiber: 0
            },
            micronutrients: {
              sodium: 59,
              potassium: 363,
              calcium: 13,
              iron: 0.8,
              omega3: 1.8
            },
            servingSize: '100g',
            notes: 'Excellent source of omega-3 fatty acids'
          },
          {
            name: 'Quinoa (cooked)',
            category: 'Whole Grains',
            calories: 120,
            macronutrients: {
              carbs: 22,
              protein: 4.4,
              fat: 1.9,
              fiber: 2.8
            },
            micronutrients: {
              sodium: 7,
              potassium: 172,
              calcium: 17,
              iron: 1.5
            },
            servingSize: '100g',
            notes: 'Complete protein grain, gluten-free'
          },
          {
            name: 'Greek Yogurt (plain, non-fat)',
            category: 'Dairy',
            calories: 59,
            macronutrients: {
              carbs: 3.6,
              protein: 10,
              fat: 0.4,
              fiber: 0
            },
            micronutrients: {
              sodium: 36,
              potassium: 141,
              calcium: 110,
              iron: 0.1
            },
            servingSize: '100g',
            notes: 'High protein, probiotic benefits'
          },
          {
            name: 'Avocado',
            category: 'Healthy Fats',
            calories: 160,
            macronutrients: {
              carbs: 9,
              protein: 2,
              fat: 15,
              fiber: 7
            },
            micronutrients: {
              sodium: 7,
              potassium: 485,
              calcium: 12,
              iron: 0.6,
              vitaminC: 10
            },
            servingSize: '100g',
            notes: 'Rich in monounsaturated fats and fiber'
          },
          {
            name: 'Spinach (fresh)',
            category: 'Leafy Greens',
            calories: 23,
            macronutrients: {
              carbs: 3.6,
              protein: 2.9,
              fat: 0.4,
              fiber: 2.2
            },
            micronutrients: {
              sodium: 79,
              potassium: 558,
              calcium: 99,
              iron: 2.7,
              vitaminC: 28,
              vitaminA: 469
            },
            servingSize: '100g',
            notes: 'High in iron, folate, and antioxidants'
          },
          {
            name: 'Lentils (cooked)',
            category: 'Legumes',
            calories: 116,
            macronutrients: {
              carbs: 20,
              protein: 9,
              fat: 0.4,
              fiber: 7.9
            },
            micronutrients: {
              sodium: 238,
              potassium: 369,
              calcium: 19,
              iron: 3.3
            },
            servingSize: '100g',
            notes: 'High protein legume, excellent fiber source'
          },
          {
            name: 'Apple (medium)',
            category: 'Fruits',
            calories: 52,
            macronutrients: {
              carbs: 14,
              protein: 0.3,
              fat: 0.2,
              fiber: 2.4
            },
            micronutrients: {
              sodium: 1,
              potassium: 107,
              calcium: 6,
              iron: 0.1,
              vitaminC: 5
            },
            servingSize: '100g',
            notes: 'Good source of fiber and natural sugars'
          },
          {
            name: 'Almonds (raw)',
            category: 'Healthy Fats',
            calories: 579,
            macronutrients: {
              carbs: 22,
              protein: 21,
              fat: 50,
              fiber: 12
            },
            micronutrients: {
              sodium: 1,
              potassium: 733,
              calcium: 269,
              iron: 3.7,
              vitaminC: 0
            },
            servingSize: '100g',
            notes: 'High in healthy fats, protein, and vitamin E'
          }
        ];

        await Food.insertMany(initialFoods);
        console.log(`✅ Successfully seeded ${initialFoods.length} food items`);
      } else {
        console.log(`📊 Database already contains ${foodCount} food items`);
      }
    } catch (error) {
      console.error('❌ Error seeding database:', error);
    }
  }

  static async getFoods(filter = {}, options = {}) {
    try {
      const { search, category, limit = 50, skip = 0 } = options;
      let query = { isActive: true, ...filter };

      if (search) {
        query.$text = { $search: search };
      }

      if (category) {
        query.category = category;
      }

      const foods = await Food.find(query)
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort({ name: 1 });

      return foods;
    } catch (error) {
      console.error('❌ Error fetching foods:', error);
      throw error;
    }
  }

  static async saveCalculation(sessionId, personalInfo, results) {
    try {
      const calculation = new (require('../models').Calculation)({
        sessionId,
        personalInfo,
        results
      });

      await calculation.save();
      return calculation;
    } catch (error) {
      console.error('❌ Error saving calculation:', error);
      throw error;
    }
  }

  static async saveMealPlan(sessionId, mealPlanData) {
    try {
      const mealPlan = new (require('../models').MealPlan)({
        sessionId,
        ...mealPlanData
      });

      await mealPlan.save();
      return mealPlan;
    } catch (error) {
      console.error('❌ Error saving meal plan:', error);
      throw error;
    }
  }

  static async getCalculationHistory(sessionId, limit = 10) {
    try {
      const calculations = await (require('../models').Calculation)
        .find({ sessionId })
        .sort({ createdAt: -1 })
        .limit(limit);

      return calculations;
    } catch (error) {
      console.error('❌ Error fetching calculation history:', error);
      throw error;
    }
  }
}

module.exports = DatabaseService;