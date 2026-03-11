'use client';

export default function PredictionResults({ predictionData }) {
  if (!predictionData) return null;

  const { player, bet, prediction, analysis, details } = predictionData;

  // Helper function to get color based on recommendation
  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'Good Bet':
        return 'border-green-500 bg-green-50';
      case 'Fair Bet':
        return 'border-yellow-500 bg-yellow-50';
      case 'Risky Bet':
        return 'border-orange-500 bg-orange-50';
      case 'Poor Bet':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  // Helper function to get confidence color
  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'High':
        return 'text-green-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Helper function to get icon based on recommendation
  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case 'Good Bet':
        return {
          bg: 'bg-green-500',
          svg: (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'Fair Bet':
        return {
          bg: 'bg-yellow-500',
          svg: (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'Risky Bet':
        return {
          bg: 'bg-orange-500',
          svg: (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'Poor Bet':
        return {
          bg: 'bg-red-500',
          svg: (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )
        };
      default:
        return {
          bg: 'bg-gray-500',
          svg: (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
    }
  };

  // Helper function to get probability bar colors
  const getProbabilityBarColor = (recommendation) => {
    switch (recommendation) {
      case 'Good Bet':
        return { text: 'text-green-600', bar: 'bg-green-500' };
      case 'Fair Bet':
        return { text: 'text-yellow-600', bar: 'bg-yellow-500' };
      case 'Risky Bet':
        return { text: 'text-orange-600', bar: 'bg-orange-500' };
      case 'Poor Bet':
        return { text: 'text-red-600', bar: 'bg-red-500' };
      default:
        return { text: 'text-gray-600', bar: 'bg-gray-500' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Prediction Results</h2>
          <p className="text-lg opacity-90">AI-Powered Betting Analysis</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Bet Details Section */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Bet Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Player:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {player.name} ({player.position})
                </span>
              </div>
              <div>
                <span className="text-gray-600">Team:</span>
                <span className="ml-2 font-semibold text-gray-900">{player.team}</span>
              </div>
              <div>
                <span className="text-gray-600">Stat:</span>
                <span className="ml-2 font-semibold text-gray-900">{bet.action}</span>
              </div>
              <div>
                <span className="text-gray-600">Bet:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {bet.type.toUpperCase()} {bet.threshold}
                </span>
              </div>
            </div>
          </div>

          {/* Predicted Performance Section */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Predicted Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pessimistic Card */}
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                <div className="text-red-600 font-bold text-sm mb-2">PESSIMISTIC</div>
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {prediction.q10?.toFixed(1)}
                </div>
                <div className="text-red-500 text-sm">10th Percentile</div>
              </div>

              {/* Most Likely Card */}
              <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4 text-center">
                <div className="text-blue-600 font-bold text-sm mb-2">MOST LIKELY</div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {prediction.q50?.toFixed(1)}
                </div>
                <div className="text-blue-500 text-sm">50th Percentile</div>
              </div>

              {/* Optimistic Card */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                <div className="text-green-600 font-bold text-sm mb-2">OPTIMISTIC</div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {prediction.q90?.toFixed(1)}
                </div>
                <div className="text-green-500 text-sm">90th Percentile</div>
              </div>
            </div>
          </div>

          {/* Win Probability Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-gray-900">Win Probability</h3>
              <span className={`text-2xl font-bold ${getProbabilityBarColor(analysis.recommendation).text}`}>
                {(analysis.win_probability * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`${getProbabilityBarColor(analysis.recommendation).bar} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${analysis.win_probability * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Recommendation Section */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recommendation</h3>
            <div className={`border-2 rounded-lg p-6 ${getRecommendationColor(analysis.recommendation)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {analysis.recommendation}
                  </div>
                  <div className="text-gray-600 mb-1">
                    Confidence: <span className={getConfidenceColor(analysis.confidence_level)}>
                      {analysis.confidence_level}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    Probability Edge: {analysis.expected_value?.toFixed(3)}
                  </div>
                </div>
                <div className={`w-12 h-12 ${getRecommendationIcon(analysis.recommendation).bg} rounded-lg flex items-center justify-center`}>
                  {getRecommendationIcon(analysis.recommendation).svg}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t pt-4 text-sm text-gray-500">
            <div>Analysis based on {details.games_analyzed} recent games</div>
            <div>Prediction for Week {details.current_week}, {details.current_season}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
