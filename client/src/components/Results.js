import React from 'react';
import { FaUser, FaWeight, FaFire, FaTint, FaChartPie, FaUtensils, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const Results = ({ results, onCreateMealPlan }) => {
  const { personalInfo, metrics, macronutrients, micronutrients, recommendations } = results;

  const getBMIColor = (classification) => {
    switch (classification.color) {
      case 'blue': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'green': return 'text-green-600 bg-green-50 border-green-200';
      case 'yellow': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'orange': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'red': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Evidence-Based Nutrition Profile</h2>
        <p className="text-gray-600">
          Based on WHO guidelines and peer-reviewed research, here are your calculated nutritional needs and recommendations.
        </p>
        {metrics.safetyNote && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
            <FaExclamationTriangle className="text-yellow-600 mr-2 mt-0.5" />
            <p className="text-yellow-800 text-sm">{metrics.safetyNote}</p>
          </div>
        )}
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

      {/* Enhanced BMI Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <FaWeight className="mr-2 text-primary-600" />
          Body Mass Index Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-primary-600 mb-2">{metrics.bmi}</div>
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getBMIColor(metrics.bmiClassification)}`}>
                {metrics.bmiClassification.category}
              </div>
            </div>
            <div className="text-sm text-gray-600 text-center">
              <p className="mb-2"><strong>Health Risk:</strong> {metrics.bmiClassification.healthRisk}</p>
              <p><strong>Recommendation:</strong> {metrics.bmiClassification.recommendation}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Ideal Weight Range</h4>
            <div className="text-center bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {metrics.idealWeight.min} - {metrics.idealWeight.max} kg
              </div>
              <div className="text-sm text-gray-600">Based on WHO healthy BMI range (18.5-24.9)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metabolic Calculations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* BMR */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">BMR</h3>
            <FaFire className="text-orange-500 text-xl" />
          </div>
          <div className="text-3xl font-bold text-orange-500 mb-2">{metrics.bmr}</div>
          <div className="text-sm text-gray-600">calories/day</div>
          <div className="text-xs text-gray-500 mt-1">Mifflin-St Jeor equation</div>
          {metrics.bmrHarrisBenedict && (
            <div className="text-xs text-gray-400 mt-1">
              Harris-Benedict: {metrics.bmrHarrisBenedict}
            </div>
          )}
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
          {metrics.weeklyWeightChange && (
            <div className="text-xs text-gray-400 mt-1">
              {metrics.weeklyWeightChange > 0 ? '+' : ''}{metrics.weeklyWeightChange} lbs/week
            </div>
          )}
        </div>

        {/* Water Intake */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Water</h3>
            <FaTint className="text-blue-500 text-xl" />
          </div>
          <div className="text-3xl font-bold text-blue-500 mb-2">{metrics.waterIntake}</div>
          <div className="text-sm text-gray-600">ml/day</div>
          <div className="text-xs text-gray-500 mt-1">
            ≈ {metrics.waterGlasses} glasses (250ml each)
          </div>
        </div>
      </div>

      {/* Enhanced Macronutrients */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <FaChartPie className="mr-2 text-primary-600" />
          Daily Macronutrient Targets (Evidence-Based)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Carbohydrates */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="text-2xl font-bold text-blue-600">{macronutrients.carbs.percentage}%</div>
            </div>
            <h4 className="text-lg font-semibold text-blue-600 mb-2">Carbohydrates</h4>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-800">{macronutrients.carbs.grams}g</div>
              <div className="text-sm text-gray-600">{macronutrients.carbs.calories} calories</div>
              <div className="text-xs text-gray-500 mt-2">
                Focus on whole grains, fruits, and vegetables
              </div>
            </div>
          </div>

          {/* Protein */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <div className="text-2xl font-bold text-red-600">{macronutrients.protein.percentage}%</div>
            </div>
            <h4 className="text-lg font-semibold text-red-600 mb-2">Protein</h4>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-800">{macronutrients.protein.grams}g</div>
              <div className="text-sm text-gray-600">{macronutrients.protein.calories}</div>
              <div className="text-xs text-gray-500 mt-2">
                Minimum: {macronutrients.protein.recommendedGrams}g (0.8g/kg body weight)
              </div>
            </div>
          </div>

          {/* Fat */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
              <div className="text-2xl font-bold text-yellow-600">{macronutrients.fat.percentage}%</div>
            </div>
            <h4 className="text-lg font-semibold text-yellow-600 mb-2">Fat</h4>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-800">{macronutrients.fat.grams}g</div>
              <div className="text-sm text-gray-600">{macronutrients.fat.calories}</div>
              <div className="text-xs text-gray-500 mt-2">
                WHO: &lt;30% total, &lt;{macronutrients.fat.saturatedFatLimit}g saturated
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <FaInfoCircle className="inline mr-1" />
            {macronutrients.fat.note}
          </p>
        </div>
      </div>

      {/* Micronutrients & Additional Recommendations */}
      {micronutrients && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Micronutrients */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Daily Micronutrient Targets</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Fiber</span>
                <span className="font-semibold">{micronutrients.fiber}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sodium (max)</span>
                <span className="font-semibold">{micronutrients.sodium.sodiumMg}mg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Potassium</span>
                <span className="font-semibold">{micronutrients.minerals.potassium}mg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vitamin C</span>
                <span className="font-semibold">{micronutrients.vitamins.vitaminC}mg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Calcium</span>
                <span className="font-semibold">{micronutrients.minerals.calcium}mg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Iron</span>
                <span className="font-semibold">{micronutrients.minerals.iron}mg</span>
              </div>
            </div>
          </div>

          {/* WHO Recommendations */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">WHO Guidelines</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>{recommendations.dailyFruitVeg}</span>
              </div>
              <div className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>{recommendations.freeSugars}</span>
              </div>
              <div className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Salt intake: &lt;{micronutrients.sodium.saltGrams}g per day</span>
              </div>
              <div className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>{recommendations.physicalActivity}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Ready to Create Your Evidence-Based Meal Plan?</h3>
        <p className="text-gray-600 mb-6">
          Use these WHO-guideline calculations to create a scientifically-backed meal plan that meets your nutritional goals.
        </p>
        <button
          onClick={onCreateMealPlan}
          className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center mx-auto"
        >
          <FaUtensils className="mr-2" />
          Create Evidence-Based Meal Plan
        </button>
        
        <div className="mt-4 text-xs text-gray-500">
          {recommendations.note}
        </div>
      </div>
    </div>
  );
};

export default Results;
