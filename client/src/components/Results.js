import React from 'react';
import { FaUser, FaWeight, FaFire, FaTint, FaChartPie, FaUtensils } from 'react-icons/fa';

const Results = ({ results, onCreateMealPlan }) => {
  const { personalInfo, metrics, macronutrients } = results;

  const getBMIColor = (classification) => {
    switch (classification.color) {
      case 'blue': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'green': return 'text-green-600 bg-green-50 border-green-200';
      case 'yellow': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'red': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Nutrition Profile</h2>
        <p className="text-gray-600">
          Based on your personal information, here are your calculated nutritional needs and recommendations.
        </p>
      </div>

      {/* Personal Info Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <FaUser className="mr-2 text-primary-600" />
          Personal Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{personalInfo.weight} kg</div>
            <div className="text-sm text-gray-600">Weight</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{personalInfo.height} cm</div>
            <div className="text-sm text-gray-600">Height</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{personalInfo.age} years</div>
            <div className="text-sm text-gray-600">Age</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 capitalize">{personalInfo.gender}</div>
            <div className="text-sm text-gray-600">Gender</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* BMI */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">BMI</h3>
            <FaWeight className="text-primary-600 text-xl" />
          </div>
          <div className="text-3xl font-bold text-primary-600 mb-2">{metrics.bmi}</div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getBMIColor(metrics.bmiClassification)}`}>
            {metrics.bmiClassification.category}
          </div>
        </div>

        {/* BMR */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">BMR</h3>
            <FaFire className="text-orange-500 text-xl" />
          </div>
          <div className="text-3xl font-bold text-orange-500 mb-2">{metrics.bmr}</div>
          <div className="text-sm text-gray-600">calories/day</div>
          <div className="text-xs text-gray-500 mt-1">Base metabolic rate</div>
        </div>

        {/* TDEE */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">TDEE</h3>
            <FaFire className="text-red-500 text-xl" />
          </div>
          <div className="text-3xl font-bold text-red-500 mb-2">{metrics.tdee}</div>
          <div className="text-sm text-gray-600">calories/day</div>
          <div className="text-xs text-gray-500 mt-1">Total daily expenditure</div>
        </div>

        {/* Target Calories */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Target</h3>
            <FaFire className="text-green-500 text-xl" />
          </div>
          <div className="text-3xl font-bold text-green-500 mb-2">{metrics.targetCalories}</div>
          <div className="text-sm text-gray-600">calories/day</div>
          <div className="text-xs text-gray-500 mt-1 capitalize">For {personalInfo.goal} goal</div>
        </div>
      </div>

      {/* Macronutrients */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <FaChartPie className="mr-2 text-primary-600" />
          Daily Macronutrient Targets
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Carbohydrates */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round((macronutrients.carbs.calories / metrics.targetCalories) * 100)}%</div>
            </div>
            <h4 className="text-lg font-semibold text-blue-600 mb-2">Carbohydrates</h4>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-800">{macronutrients.carbs.grams}g</div>
              <div className="text-sm text-gray-600">{macronutrients.carbs.calories} calories</div>
            </div>
          </div>

          {/* Protein */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <div className="text-2xl font-bold text-red-600">{Math.round((macronutrients.protein.calories / metrics.targetCalories) * 100)}%</div>
            </div>
            <h4 className="text-lg font-semibold text-red-600 mb-2">Protein</h4>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-800">{macronutrients.protein.grams}g</div>
              <div className="text-sm text-gray-600">{macronutrients.protein.calories} calories</div>
            </div>
          </div>

          {/* Fat */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
              <div className="text-2xl font-bold text-yellow-600">{Math.round((macronutrients.fat.calories / metrics.targetCalories) * 100)}%</div>
            </div>
            <h4 className="text-lg font-semibold text-yellow-600 mb-2">Fat</h4>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-800">{macronutrients.fat.grams}g</div>
              <div className="text-sm text-gray-600">{macronutrients.fat.calories} calories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ideal Weight Range */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaWeight className="mr-2 text-primary-600" />
            Ideal Weight Range
          </h3>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-2">
              {metrics.idealWeight.min} - {metrics.idealWeight.max} kg
            </div>
            <div className="text-sm text-gray-600">Based on healthy BMI range (18.5-24.9)</div>
          </div>
        </div>

        {/* Water Intake */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaTint className="mr-2 text-blue-500" />
            Daily Water Intake
          </h3>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500 mb-2">{metrics.waterIntake} ml</div>
            <div className="text-sm text-gray-600">
              ≈ {Math.round(metrics.waterIntake / 250)} glasses (250ml each)
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Ready to Create Your Meal Plan?</h3>
        <p className="text-gray-600 mb-6">
          Use these calculations to create a personalized meal plan that meets your nutritional goals.
        </p>
        <button
          onClick={onCreateMealPlan}
          className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center mx-auto"
        >
          <FaUtensils className="mr-2" />
          Create Meal Plan
        </button>
      </div>
    </div>
  );
};

export default Results;
