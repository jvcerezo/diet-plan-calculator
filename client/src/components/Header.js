import React from 'react';
import { FaCalculator, FaChartLine, FaUtensils } from 'react-icons/fa';

const Header = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'calculator', label: 'Calculator', icon: FaCalculator },
    { id: 'results', label: 'Results', icon: FaChartLine },
    { id: 'meal-planner', label: 'Meal Planner', icon: FaUtensils },
  ];

  return (
    <header className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            <FaCalculator className="text-primary-600 text-2xl" />
            <h1 className="text-2xl font-bold text-gray-800">
              Diet Plan Calculator
            </h1>
          </div>
          <p className="text-gray-600 hidden md:block">
            HNF 122 Laboratory Requirements
          </p>
        </div>
        
        <nav className="border-t border-gray-200">
          <div className="flex space-x-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'text-primary-600 border-primary-600 bg-primary-50'
                      : 'text-gray-600 border-transparent hover:text-primary-600 hover:border-primary-300'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
