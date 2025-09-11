import React, { useState } from 'react';
import { Send } from 'lucide-react';

const PredictionForm = ({
  symptoms,
  onSubmit,
  loading,
  submitText,
  submitColor
}) => {
  const [formData, setFormData] = useState({});

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = () => {
    return symptoms.every(
      symptom => formData[symptom.name] !== undefined && formData[symptom.name] !== ''
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {symptoms.map((symptom) => (
        <div key={symptom.name} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {symptom.label}
          </label>
          
          {symptom.type === 'number' && (
            <input
              type="number"
              min={symptom.min}
              max={symptom.max}
              step={symptom.step || 1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={formData[symptom.name] || ''}
              onChange={(e) => handleInputChange(symptom.name, parseFloat(e.target.value))}
              placeholder={`Enter ${symptom.label.toLowerCase()}`}
            />
          )}
          
          {symptom.type === 'select' && (
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={formData[symptom.name] || ''}
              onChange={(e) => handleInputChange(symptom.name, e.target.value)}
            >
              <option value="">Select {symptom.label.toLowerCase()}</option>
              {symptom.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          
          {symptom.type === 'text' && (
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={formData[symptom.name] || ''}
              onChange={(e) => handleInputChange(symptom.name, e.target.value)}
              placeholder={`Enter ${symptom.label.toLowerCase()}`}
            />
          )}
        </div>
      ))}
      
      <button
        type="submit"
        disabled={!isFormValid() || loading}
        className={`w-full ${submitColor} text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <>
            <Send className="h-5 w-5" />
            <span>{submitText}</span>
          </>
        )}
      </button>
    </form>
  );
};

export default PredictionForm;
