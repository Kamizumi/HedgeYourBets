// frontend/components/BettingForm.jsx
'use client';

import React, { useState, useEffect } from "react";
import PredictionResults from "./PredictionResults";
import SignInButton from "./SignInButton";

export default function BettingForm({ session }) {
  const [formData, setFormData] = useState({
    sport: "football",
    team: "",
    player: "",
    betType: "",
    action: "",
    actionAmount: "",
    betAmount: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  
  // Dynamic data state
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState({
    teams: false,
    players: false,
    actions: false
  });

  // Load teams on component mount
  useEffect(() => {
    loadTeams();
  }, []);

  // Load players when team changes
  useEffect(() => {
    if (formData.team) {
      loadPlayers(formData.team);
    } else {
      setPlayers([]);
      setFormData(prev => ({ ...prev, player: "", action: "" }));
    }
  }, [formData.team]);

  // Load actions when player changes
  useEffect(() => {
    if (formData.player) {
      const selectedPlayer = players.find(p => p.name === formData.player);
      if (selectedPlayer) {
        loadActions(selectedPlayer.position);
      }
    } else {
      setActions([]);
      setFormData(prev => ({ ...prev, action: "" }));
    }
  }, [formData.player, players]);

  const loadTeams = async () => {
    setLoading(prev => ({ ...prev, teams: true }));
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      console.log('Loading teams from:', `${apiUrl}/api/teams/`);
      
      const response = await fetch(`${apiUrl}/api/teams/`);
      console.log('Teams response status:', response.status);
      
      const data = await response.json();
      console.log('Teams response data:', data);
      
      if (data.success) {
        setTeams(data.teams);
        console.log('Teams loaded successfully:', data.teams.length);
      } else {
        console.error('Teams API returned error:', data.error);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(prev => ({ ...prev, teams: false }));
    }
  };

  const loadPlayers = async (team) => {
    setLoading(prev => ({ ...prev, players: true }));
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      console.log('Loading players for team:', team, 'from:', `${apiUrl}/api/players/?team=${team}`);
      
      const response = await fetch(`${apiUrl}/api/players/?team=${team}`);
      console.log('Players response status:', response.status);
      
      const data = await response.json();
      console.log('Players response data:', data);
      
      if (data.success) {
        setPlayers(data.players);
        console.log('Players loaded successfully:', data.players.length);
      } else {
        console.error('Players API returned error:', data.error);
      }
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setLoading(prev => ({ ...prev, players: false }));
    }
  };

  const loadActions = async (position) => {
    setLoading(prev => ({ ...prev, actions: true }));
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      console.log('Loading actions for position:', position, 'from:', `${apiUrl}/api/actions/?position=${position}`);
      
      const response = await fetch(`${apiUrl}/api/actions/?position=${position}`);
      console.log('Actions response status:', response.status);
      
      const data = await response.json();
      console.log('Actions response data:', data);
      
      if (data.success) {
        setActions(data.actions);
        console.log('Actions loaded successfully:', data.actions.length);
      } else {
        console.error('Actions API returned error:', data.error);
      }
    } catch (error) {
      console.error('Error loading actions:', error);
    } finally {
      setLoading(prev => ({ ...prev, actions: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle cascading dropdowns
    if (name === "team") {
      setFormData((prev) => ({
        ...prev,
        team: value,
        player: "", // Reset player when team changes
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/predict-bet/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player: formData.player,
          action: formData.action,
          bet_type: formData.betType,
          action_amount: parseFloat(formData.actionAmount),
          bet_amount: parseFloat(formData.betAmount) || 0,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Save bet to DynamoDB after successful prediction
        try {
          // Extract recommendation and confidence from the analysis object
          const recommendation = result.analysis?.recommendation || "N/A";
          const confidence = result.analysis?.confidence_level || "N/A";
          const aiPredictionText = `Recommendation: ${recommendation}, Confidence: ${confidence}`;
          
          await fetch('/api/place-bet', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sport: formData.sport,
              team: formData.team,
              player: formData.player,
              betType: formData.betType,
              metric: formData.action,
              line: parseFloat(formData.actionAmount),
              wager: parseFloat(formData.betAmount),
              aiPrediction: aiPredictionText
            }),
          });
        } catch (dbError) {
          console.error("Failed to save bet to database:", dbError);
          // Don't block the user if DB save fails
        }

        setSubmissionResult({
          success: true,
          message: "Prediction generated successfully!",
          predictionData: result,
        });
      } else {
        setSubmissionResult({
          success: false,
          message: result.error || "Error generating prediction. Please try again.",
          suggestions: result.suggestions || null,
        });
      }
    } catch (error) {
      setSubmissionResult({
        success: false,
        message: "Network error. Please check that the backend is running on port 8000.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If no session, show sign-in component
  if (!session) {
    return <SignInButton />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-4">
      {/* Main Card with Glassmorphism */}
      <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        {/* Header Section with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white">
              Create Betting Scenario
            </h2>
          </div>
          <p className="text-blue-100 text-lg">
            Configure your bet details and let our AI analyze the potential value
          </p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sport - Fixed to Football */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                Sport
              </label>
              <div className="relative">
                <div className="w-full px-5 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl text-gray-700 font-medium flex items-center gap-2">
                  Football
                </div>
              </div>
            </div>

            {/* Team Selection */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Team <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="team"
                  value={formData.team}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300 text-gray-700 font-medium"
                  required
                  disabled={loading.teams}
                >
                  <option value="">
                    {loading.teams ? "🔄 Loading teams..." : "Select a team"}
                  </option>
                  {teams.map((team) => (
                    <option key={team.abbreviation} value={team.abbreviation}>
                      {team.full_name} ({team.abbreviation})
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Player Selection - conditional with animation */}
            {formData.team && (
              <div className="group animate-fadeIn">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Player <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="player"
                    value={formData.player}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300 text-gray-700 font-medium"
                    required
                    disabled={loading.players}
                  >
                    <option value="">
                      {loading.players ? "🔄 Loading players..." : "Select a player"}
                    </option>
                    {players.map((player) => (
                      <option key={player.name} value={player.name}>
                        {player.name} ({player.position})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Bet Type and Action Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bet Type */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                  Bet Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="betType"
                    value={formData.betType}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300 text-gray-700 font-medium"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="over">Over</option>
                    <option value="under">Under</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Action <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="action"
                    value={formData.action}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300 text-gray-700 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                    required
                    disabled={loading.actions || !formData.player}
                  >
                    <option value="">
                      {loading.actions ? "🔄 Loading..." : !formData.player ? "Select player first" : "Select action"}
                    </option>
                    {actions.map((action) => (
                      <option key={action.value} value={action.value}>
                        {action.value}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Amount Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Action Amount */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  Action Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="actionAmount"
                    value={formData.actionAmount}
                    onChange={handleInputChange}
                    placeholder="250"
                    min="0"
                    step="0.1"
                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 hover:border-gray-300 text-gray-700 font-medium placeholder:text-gray-400"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 ml-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Threshold for the selected action
                </p>
              </div>

              {/* Bet Amount */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Bet Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    $
                  </div>
                  <input
                    type="number"
                    name="betAmount"
                    value={formData.betAmount}
                    onChange={handleInputChange}
                    placeholder="100"
                    min="1"
                    step="0.01"
                    className="w-full pl-10 pr-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all duration-200 hover:border-gray-300 text-gray-700 font-medium placeholder:text-gray-400"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 ml-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Amount you want to wager
                </p>
              </div>
            </div>

            {/* Submit Button with Enhanced Design */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`group relative w-full py-5 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform overflow-hidden ${
                  isSubmitting
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 hover:scale-[1.02] shadow-xl hover:shadow-2xl active:scale-[0.98]"
                } text-white`}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing Your Bet...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Analyze My Bet
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
                {!isSubmitting && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                )}
              </button>
            </div>
          </form>

          {/* Results Section with Enhanced Styling */}
          {submissionResult && (
            <div className="mt-8 animate-fadeIn">
              {submissionResult.success && submissionResult.predictionData ? (
                <PredictionResults predictionData={submissionResult.predictionData} />
              ) : (
                <div
                  className={`p-6 rounded-xl border-2 ${
                    submissionResult.success
                      ? "bg-green-50 border-green-300 text-green-900"
                      : "bg-red-50 border-red-300 text-red-900"
                  } shadow-lg`}
                >
                  <div className="flex items-start gap-3">
                    {submissionResult.success ? (
                      <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{submissionResult.message}</p>
                      {submissionResult.suggestions && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Did you mean:</p>
                          <ul className="space-y-1">
                            {submissionResult.suggestions.map((suggestion, index) => (
                              <li key={index} className="text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add custom CSS for fade-in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}