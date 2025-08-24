import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Calculator from './components/Calculator';
import Results from './components/Results';
import MealPlanner from './components/MealPlanner';
import Footer from './components/Footer';

function App() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [calculationResults, setCalculationResults] = useState(null);

  const handleCalculationComplete = (results) => {
    setCalculationResults(results);
    setActiveTab('results');
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'calculator':
        return <Calculator onCalculationComplete={handleCalculationComplete} />;
      case 'results':
        return calculationResults ? (
          <Results 
            results={calculationResults} 
            onCreateMealPlan={() => setActiveTab('meal-planner')}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No calculation results available. Please use the calculator first.</p>
            <button 
              onClick={() => setActiveTab('calculator')}
              className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              Go to Calculator
            </button>
          </div>
        );
      case 'meal-planner':
        return calculationResults ? (
          <MealPlanner targetCalories={calculationResults.metrics.targetCalories} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Please calculate your nutrition profile first.</p>
            <button 
              onClick={() => setActiveTab('calculator')}
              className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              Go to Calculator
            </button>
          </div>
        );
      default:
        return <Calculator onCalculationComplete={handleCalculationComplete} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 container mx-auto px-4 py-8">
        {renderActiveComponent()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
