import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUtensils, FaPlus, FaTrash, FaSearch } from 'react-icons/fa';

const MealPlanner = ({ targetCalories }) => {
  const [foods, setFoods] = useState([]);
  const [mealPlan, setMealPlan] = useState({
    breakfast: { foods: [], targetCalories: Math.round(targetCalories * 0.25) },
    lunch: { foods: [], targetCalories: Math.round(targetCalories * 0.35) },
    dinner: { foods: [], targetCalories: Math.round(targetCalories * 0.30) },
    snacks: { foods: [], targetCalories: Math.round(targetCalories * 0.10) }
  });
  const [selectedFood, setSelectedFood] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [servingSize, setServingSize] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/foods');
      setFoods(response.data);
    } catch (error) {
      console.error('Error fetching foods:', error);
    }
  };

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addFoodToMeal = () => {
    if (!selectedFood || servingSize <= 0) return;

    const food = foods.find(f => f.id === parseInt(selectedFood));
    if (!food) return;

    const foodItem = {
      ...food,
      servingSize: servingSize,
      totalCalories: Math.round(food.calories * servingSize),
      totalCarbs: Math.round(food.carbs * servingSize * 10) / 10,
      totalProtein: Math.round(food.protein * servingSize * 10) / 10,
      totalFat: Math.round(food.fat * servingSize * 10) / 10,
      totalFiber: Math.round(food.fiber * servingSize * 10) / 10,
      id: Date.now() // Unique ID for the meal item
    };

    setMealPlan(prev => ({
      ...prev,
      [selectedMeal]: {
        ...prev[selectedMeal],
        foods: [...prev[selectedMeal].foods, foodItem]
      }
    }));

    setSelectedFood('');
    setServingSize(1);
  };

  const removeFoodFromMeal = (mealType, foodId) => {
    setMealPlan(prev => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        foods: prev[mealType].foods.filter(food => food.id !== foodId)
      }
    }));
  };

  const calculateMealTotals = (meal) => {
    return meal.foods.reduce((totals, food) => ({
      calories: totals.calories + food.totalCalories,
      carbs: totals.carbs + food.totalCarbs,
      protein: totals.protein + food.totalProtein,
      fat: totals.fat + food.totalFat,
      fiber: totals.fiber + food.totalFiber
    }), { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 });
  };

  const calculateDayTotals = () => {
    return Object.values(mealPlan).reduce((dayTotals, meal) => {
      const mealTotals = calculateMealTotals(meal);
      return {
        calories: dayTotals.calories + mealTotals.calories,
        carbs: dayTotals.carbs + mealTotals.carbs,
        protein: dayTotals.protein + mealTotals.protein,
        fat: dayTotals.fat + mealTotals.fat,
        fiber: dayTotals.fiber + mealTotals.fiber
      };
    }, { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 });
  };

  const dayTotals = calculateDayTotals();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
          <FaUtensils className="mr-3 text-primary-600" />
          Meal Planner
        </h2>
        <p className="text-gray-600">
          Create your daily meal plan with a target of {targetCalories} calories.
        </p>
      </div>

      {/* Add Food Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Food to Meal</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meal</label>
            <select
              value={selectedMeal}
              onChange={(e) => setSelectedMeal(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snacks">Snacks</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaSearch className="inline mr-1" />
              Search Foods
            </label>
            <input
              type="text"
              placeholder="Search foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Food</label>
            <select
              value={selectedFood}
              onChange={(e) => setSelectedFood(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a food</option>
              {filteredFoods.map(food => (
                <option key={food.id} value={food.id}>
                  {food.name} ({food.category}) - {food.calories} cal/{food.servingSize}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Servings</label>
            <div className="flex">
              <input
                type="number"
                value={servingSize}
                onChange={(e) => setServingSize(parseFloat(e.target.value) || 0)}
                step="0.1"
                min="0.1"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                onClick={addFoodToMeal}
                disabled={!selectedFood || servingSize <= 0}
                className="bg-primary-600 text-white px-4 py-2 rounded-r-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <FaPlus />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Daily Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{Math.round(dayTotals.calories)}</div>
            <div className="text-sm text-gray-600">Calories</div>
            <div className="text-xs text-gray-500">Target: {targetCalories}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{Math.round(dayTotals.carbs * 10) / 10}g</div>
            <div className="text-sm text-gray-600">Carbs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{Math.round(dayTotals.protein * 10) / 10}g</div>
            <div className="text-sm text-gray-600">Protein</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{Math.round(dayTotals.fat * 10) / 10}g</div>
            <div className="text-sm text-gray-600">Fat</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{Math.round(dayTotals.fiber * 10) / 10}g</div>
            <div className="text-sm text-gray-600">Fiber</div>
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(mealPlan).map(([mealType, meal]) => {
          const mealTotals = calculateMealTotals(meal);
          const progressPercentage = (mealTotals.calories / meal.targetCalories) * 100;
          
          return (
            <div key={mealType} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 capitalize">{mealType}</h3>
                <div className="text-sm text-gray-600">
                  {Math.round(mealTotals.calories)} / {meal.targetCalories} cal
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progressPercentage > 110 ? 'bg-red-500' : 
                    progressPercentage > 90 ? 'bg-green-500' : 'bg-primary-500'
                  }`}
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>

              {/* Foods List */}
              <div className="space-y-3">
                {meal.foods.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No foods added yet</p>
                ) : (
                  meal.foods.map(food => (
                    <div key={food.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{food.name}</div>
                        <div className="text-sm text-gray-600">
                          {food.servingSize} serving(s) • {food.totalCalories} cal
                        </div>
                        <div className="text-xs text-gray-500">
                          C: {food.totalCarbs}g • P: {food.totalProtein}g • F: {food.totalFat}g
                        </div>
                      </div>
                      <button
                        onClick={() => removeFoodFromMeal(mealType, food.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Meal Totals */}
              {meal.foods.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-sm font-medium text-blue-600">{Math.round(mealTotals.carbs * 10) / 10}g</div>
                      <div className="text-xs text-gray-500">Carbs</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-red-600">{Math.round(mealTotals.protein * 10) / 10}g</div>
                      <div className="text-xs text-gray-500">Protein</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-yellow-600">{Math.round(mealTotals.fat * 10) / 10}g</div>
                      <div className="text-xs text-gray-500">Fat</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-green-600">{Math.round(mealTotals.fiber * 10) / 10}g</div>
                      <div className="text-xs text-gray-500">Fiber</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MealPlanner;
