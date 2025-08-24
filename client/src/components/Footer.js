import React from 'react';
import { FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Project Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Diet Plan Calculator</h3>
            <p className="text-gray-300 text-sm">
              A comprehensive web-based nutrition calculator designed for HNF 122 Laboratory Requirements. 
              Calculate BMI, BMR, TDEE, and create personalized meal plans.
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>• BMI & BMR Calculations</li>
              <li>• Total Daily Energy Expenditure (TDEE)</li>
              <li>• Macronutrient Distribution</li>
              <li>• Personalized Meal Planning</li>
              <li>• Water Intake Recommendations</li>
              <li>• Ideal Weight Range Analysis</li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Technology Stack</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>• React.js Frontend</li>
              <li>• Tailwind CSS Styling</li>
              <li>• Node.js & Express Backend</li>
              <li>• RESTful API Architecture</li>
              <li>• Responsive Design</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-gray-300">Made with</span>
              <FaHeart className="text-red-500" />
              <span className="text-gray-300">by Jet Timothy Cerezo</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">
                © 2025 Diet Plan Calculator. Educational Project.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-gray-400 text-xs text-center">
            <strong>Disclaimer:</strong> This calculator is for educational purposes only. 
            Consult with healthcare professionals before making significant dietary changes. 
            The calculations are based on standard formulas and may not be suitable for everyone.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
