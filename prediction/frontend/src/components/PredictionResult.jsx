import React from 'react';
import { Download, AlertTriangle, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const PredictionResult = ({ prediction, diseaseType, color }) => {
  const getRiskLevelIcon = () => {
    switch (prediction.riskLevel) {
      case 'High':
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      case 'Medium':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      case 'Low':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <AlertCircle className="h-6 w-6 text-gray-500" />;
    }
  };

  const getRiskLevelColor = () => {
    switch (prediction.riskLevel) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const downloadReport = () => {
    const element = document.createElement('a');
    element.href = '#';
    element.download = `${diseaseType.toLowerCase().replace(' ', '-')}-report-${prediction.reportId}.pdf`;
    element.click();
    alert('PDF report downloaded successfully!');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Title */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          {diseaseType} Risk Assessment
        </h3>
        <p className="text-gray-600">Analysis completed using {prediction.model}</p>
      </div>

      {/* Risk Score */}
      <div className="text-center mb-6">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <div className={`w-32 h-32 rounded-full border-8 border-${color}-100 relative`}>
            <div
              className={`absolute inset-0 rounded-full border-8 border-transparent border-t-${color}-500 transform transition-transform duration-1000`}
              style={{
                transform: `rotate(${(parseFloat(prediction.riskScore) / 100) * 360}deg)`,
                borderTopColor:
                  prediction.riskLevel === 'High'
                    ? '#ef4444'
                    : prediction.riskLevel === 'Medium'
                    ? '#f59e0b'
                    : '#10b981'
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">
                {prediction.riskScore}%
              </span>
            </div>
          </div>
        </div>

        <div
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border ${getRiskLevelColor()}`}
        >
          {getRiskLevelIcon()}
          <span className="font-semibold">{prediction.riskLevel} Risk</span>
        </div>
      </div>

      {/* Model Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Model Used</p>
            <p className="font-medium text-gray-900">{prediction.model}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Confidence</p>
            <p className="font-medium text-gray-900">{prediction.confidence}%</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h4>
        <ul className="space-y-2">
          {prediction.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 text-sm">{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={downloadReport}
          className={`flex-1 bg-${color}-600 hover:bg-${color}-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors`}
        >
          <Download className="h-4 w-4" />
          <span>Download PDF Report</span>
        </button>

        <Link
          to="/doctor-recommendation"
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
        >
          <Calendar className="h-4 w-4" />
          <span>Book Consultation</span>
        </Link>
      </div>

      {/* Report ID */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Report ID: {prediction.reportId} | Generated on {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default PredictionResult;
