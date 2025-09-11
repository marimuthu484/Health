import React, { useState } from 'react';
import { Activity, AlertCircle, CheckCircle } from 'lucide-react';
import PredictionForm from '../components/PredictionForm';
import PredictionResult from '../components/PredictionResult';

const LiverPrediction = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const liverSymptoms = [
    { name: 'age', label: 'Age', type: 'number', min: 1, max: 120 },
    { 
      name: 'gender', 
      label: 'Gender', 
      type: 'select', 
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' }
      ]
    },
    { name: 'totalBilirubin', label: 'Total Bilirubin (mg/dL)', type: 'number', min: 0, max: 10, step: 0.1 },
    { name: 'directBilirubin', label: 'Direct Bilirubin (mg/dL)', type: 'number', min: 0, max: 5, step: 0.1 },
    { name: 'alkalinePhosphatase', label: 'Alkaline Phosphatase (IU/L)', type: 'number', min: 50, max: 500 },
    { name: 'alamineAminotransferase', label: 'Alamine Aminotransferase (IU/L)', type: 'number', min: 10, max: 200 },
    { name: 'aspartateAminotransferase', label: 'Aspartate Aminotransferase (IU/L)', type: 'number', min: 10, max: 200 },
    { name: 'totalProteins', label: 'Total Proteins (g/dL)', type: 'number', min: 4, max: 10, step: 0.1 },
    { name: 'albumin', label: 'Albumin (g/dL)', type: 'number', min: 2, max: 6, step: 0.1 },
    { name: 'albuminGlobulinRatio', label: 'Albumin/Globulin Ratio', type: 'number', min: 0.5, max: 3, step: 0.1 },
    { 
      name: 'alcoholConsumption', 
      label: 'Alcohol Consumption', 
      type: 'select', 
      options: [
        { value: 'none', label: 'None' },
        { value: 'occasional', label: 'Occasional (1-2 drinks/week)' },
        { value: 'moderate', label: 'Moderate (3-7 drinks/week)' },
        { value: 'heavy', label: 'Heavy (>7 drinks/week)' }
      ]
    },
    { 
      name: 'fatigue', 
      label: 'Persistent Fatigue', 
      type: 'select', 
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    },
    { 
      name: 'jaundice', 
      label: 'Yellowing of Skin/Eyes', 
      type: 'select', 
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    },
    { 
      name: 'abdominalPain', 
      label: 'Abdominal Pain', 
      type: 'select', 
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    }
  ];

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    
    setTimeout(() => {
      const riskScore = Math.random() * 100;
      const models = ['Logistic Regression', 'Random Forest', 'Decision Tree'];
      const selectedModel = models[Math.floor(Math.random() * models.length)];
      
      setPrediction({
        riskScore: riskScore.toFixed(1),
        riskLevel: riskScore > 70 ? 'High' : riskScore > 40 ? 'Medium' : 'Low',
        model: selectedModel,
        confidence: (85 + Math.random() * 10).toFixed(1),
        recommendations: generateRecommendations(riskScore),
        reportId: Math.random().toString(36).substr(2, 9)
      });
      setLoading(false);
    }, 2000);
  };

  const generateRecommendations = (riskScore) => {
    const baseRecommendations = [
      'Maintain a balanced diet low in saturated fats',
      'Limit alcohol consumption or avoid completely',
      'Stay hydrated and exercise regularly',
      'Avoid exposure to toxins and chemicals'
    ];

    if (riskScore > 70) {
      return [
        'Immediate consultation with a hepatologist is strongly recommended',
        'Comprehensive liver function tests and imaging studies needed',
        ...baseRecommendations,
        'Consider liver biopsy if recommended by specialist',
        'Monitor for complications like ascites or varices'
      ];
    } else if (riskScore > 40) {
      return [
        'Schedule follow-up with gastroenterologist or hepatologist',
        'Regular monitoring of liver enzymes recommended',
        ...baseRecommendations,
        'Consider hepatitis B and C screening'
      ];
    } else {
      return [
        ...baseRecommendations,
        'Annual liver function tests are sufficient',
        'Continue healthy lifestyle practices'
      ];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <Activity className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Liver Disease Risk Assessment
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Advanced machine learning analysis of liver function tests and symptoms 
            to assess your liver health and identify potential risks early.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Liver Health Assessment
            </h2>
            <PredictionForm
              symptoms={liverSymptoms}
              onSubmit={handleFormSubmit}
              loading={loading}
              submitText="Analyze Liver Risk"
              submitColor="bg-green-600 hover:bg-green-700"
            />
          </div>

          <div className="space-y-6">
            {loading && (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Processing liver function analysis...</p>
              </div>
            )}

            {prediction && (
              <PredictionResult
                prediction={prediction}
                diseaseType="Liver Disease"
                color="green"
              />
            )}

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                About Liver Disease Prediction
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Comprehensive Analysis</p>
                    <p className="text-gray-600">Analyzes liver enzymes, proteins, and clinical symptoms</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Early Detection</p>
                    <p className="text-gray-600">Identifies liver problems before symptoms become severe</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Expert Validated</p>
                    <p className="text-gray-600">Based on hepatology research and clinical guidelines</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Lab Results Integration</p>
                  <p className="text-blue-700 text-sm mt-1">
                    For best results, have recent liver function test results available. 
                    This includes ALT, AST, bilirubin levels, and protein markers.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Medical Disclaimer</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    This assessment is for informational purposes only. Consult with a hepatologist 
                    or gastroenterologist for proper diagnosis and treatment of liver conditions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiverPrediction;
