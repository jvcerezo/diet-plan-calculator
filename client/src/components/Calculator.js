import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaRuler, FaWeight, FaBirthdayCake, FaRunning, FaBullseye } from 'react-icons/fa';

const Calculator = ({ onCalculationComplete }) => {
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: '',
    activityLevel: '',
    goal: '',
    carbPercent: 50,
    proteinPercent: 20,
    fatPercent: 30
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMacroChange = (macro, value) => {
    const numValue = parseInt(value);
    let newFormData = { ...formData, [macro]: numValue };
    
    // Ensure macros add up to 100%
    const others = Object.keys(newFormData)
      .filter(key => key.includes('Percent') && key !== macro)
      .map(key => newFormData[key]);
    
    const otherSum = others.reduce((sum, val) => sum + val, 0);
    const remaining = 100 - numValue;
    
    if (otherSum > remaining) {
      // Proportionally adjust other macros
      const adjustment = remaining / otherSum;
      if (macro !== 'carbPercent') newFormData.carbPercent = Math.round(newFormData.carbPercent * adjustment);
      if (macro !== 'proteinPercent') newFormData.proteinPercent = Math.round(newFormData.proteinPercent * adjustment);
      if (macro !== 'fatPercent') newFormData.fatPercent = Math.round(newFormData.fatPercent * adjustment);
    }
    
    setFormData(newFormData);
  };

  const validateForm = () => {
    const { weight, height, age, gender, activityLevel, goal } = formData;
    
    if (!weight || !height || !age || !gender || !activityLevel || !goal) {
      setError('Please fill in all required fields');
      return false;
    }
    
    if (weight <= 0 || height <= 0 || age <= 0) {
      setError('Please enter valid positive numbers for weight, height, and age');
      return false;
    }
    
    if (age < 10 || age > 120) {
      setError('Please enter a valid age between 10 and 120');
      return false;
    }
    
    const macroSum = formData.carbPercent + formData.proteinPercent + formData.fatPercent;
    if (macroSum !== 100) {
      setError('Macronutrient percentages must add up to 100%');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/calculate`, formData);
      onCalculationComplete(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during calculation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Nutrition Calculator</h2>
          <p className="text-gray-600">
            Enter your personal information to calculate your nutritional needs and create a personalized diet plan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-danger-50 border border-danger-300 text-danger-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaUser className="mr-2 text-primary-600" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaWeight className="inline mr-2" />
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 70"
                  step="0.1"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaRuler className="inline mr-2" />
                  Height (cm) *
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 170"
                  step="0.1"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBirthdayCake className="inline mr-2" />
                  Age (years) *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 25"
                  min="10"
                  max="120"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* Activity Level */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaRunning className="mr-2 text-primary-600" />
              Activity Level *
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { value: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
                { value: 'lightlyActive', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
                { value: 'moderatelyActive', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
                { value: 'veryActive', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
                { value: 'superActive', label: 'Super Active', desc: 'Very hard exercise, physical job' }
              ].map((activity) => (
                <label key={activity.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="activityLevel"
                    value={activity.value}
                    checked={formData.activityLevel === activity.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg transition-colors ${
                    formData.activityLevel === activity.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-white hover:border-primary-300'
                  }`}>
                    <div className="font-medium">{activity.label}</div>
                    <div className="text-sm text-gray-600">{activity.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaBullseye className="mr-2 text-primary-600" />
              Goal *
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'lose', label: 'Lose Weight', desc: '500 cal deficit/day' },
                { value: 'maintain', label: 'Maintain Weight', desc: 'Maintain current weight' },
                { value: 'gain', label: 'Gain Weight', desc: '500 cal surplus/day' }
              ].map((goal) => (
                <label key={goal.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="goal"
                    value={goal.value}
                    checked={formData.goal === goal.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg transition-colors ${
                    formData.goal === goal.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-white hover:border-primary-300'
                  }`}>
                    <div className="font-medium">{goal.label}</div>
                    <div className="text-sm text-gray-600">{goal.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Macronutrient Distribution */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Macronutrient Distribution (Optional)
            </h3>
            <p className="text-gray-600 mb-4">Adjust the percentage of calories from each macronutrient. Total must equal 100%.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carbohydrates: {formData.carbPercent}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={formData.carbPercent}
                  onChange={(e) => handleMacroChange('carbPercent', e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Protein: {formData.proteinPercent}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="40"
                  value={formData.proteinPercent}
                  onChange={(e) => handleMacroChange('proteinPercent', e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fat: {formData.fatPercent}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={formData.fatPercent}
                  onChange={(e) => handleMacroChange('fatPercent', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="mt-2 text-sm text-gray-600">
              Total: {formData.carbPercent + formData.proteinPercent + formData.fatPercent}%
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Calculating...' : 'Calculate Nutrition Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Calculator;
