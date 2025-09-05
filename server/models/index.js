const mongoose = require('mongoose');

// Food Item Schema
const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Whole Grains', 'Lean Protein', 'Vegetables', 'Starchy Vegetables', 'Fatty Fish', 'Dairy', 'Healthy Fats', 'Leafy Greens', 'Legumes', 'Fruits']
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  macronutrients: {
    carbs: { type: Number, required: true, min: 0 },
    protein: { type: Number, required: true, min: 0 },
    fat: { type: Number, required: true, min: 0 },
    fiber: { type: Number, default: 0, min: 0 }
  },
  micronutrients: {
    sodium: { type: Number, default: 0, min: 0 }, // mg
    potassium: { type: Number, default: 0, min: 0 }, // mg
    calcium: { type: Number, default: 0, min: 0 }, // mg
    iron: { type: Number, default: 0, min: 0 }, // mg
    vitaminC: { type: Number, default: 0, min: 0 }, // mg
    vitaminA: { type: Number, default: 0, min: 0 }, // μg
    omega3: { type: Number, default: 0, min: 0 } // g
  },
  servingSize: {
    type: String,
    required: true,
    default: '100g'
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// User Calculation History Schema
const calculationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  personalInfo: {
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true, enum: ['male', 'female'] },
    activityLevel: { 
      type: String, 
      required: true,
      enum: ['sedentary', 'lightlyActive', 'moderatelyActive', 'veryActive', 'superActive']
    },
    goal: { 
      type: String, 
      required: true,
      enum: ['lose', 'maintain', 'gain']
    }
  },
  results: {
    bmi: Number,
    bmr: Number,
    tdee: Number,
    targetCalories: Number,
    waterIntake: Number,
    macronutrients: {
      carbs: {
        calories: Number,
        grams: Number,
        percentage: Number
      },
      protein: {
        calories: Number,
        grams: Number,
        percentage: Number,
        recommendedGrams: Number
      },
      fat: {
        calories: Number,
        grams: Number,
        percentage: Number
      }
    }
  },
  calculationMethod: {
    type: String,
    default: 'Mifflin-St Jeor + WHO Guidelines'
  }
}, {
  timestamps: true
});

// Meal Plan Schema
const mealPlanSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  targetCalories: {
    type: Number,
    required: true
  },
  meals: {
    breakfast: [{
      foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
      servingSize: Number,
      calories: Number
    }],
    lunch: [{
      foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
      servingSize: Number,
      calories: Number
    }],
    dinner: [{
      foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
      servingSize: Number,
      calories: Number
    }],
    snacks: [{
      foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
      servingSize: Number,
      calories: Number
    }]
  },
  totalCalories: Number,
  totalMacros: {
    carbs: Number,
    protein: Number,
    fat: Number,
    fiber: Number
  }
}, {
  timestamps: true
});

// Create indexes for better performance
foodSchema.index({ name: 'text', category: 'text' });
calculationSchema.index({ sessionId: 1, createdAt: -1 });
mealPlanSchema.index({ sessionId: 1, createdAt: -1 });

module.exports = {
  Food: mongoose.model('Food', foodSchema),
  Calculation: mongoose.model('Calculation', calculationSchema),
  MealPlan: mongoose.model('MealPlan', mealPlanSchema)
};