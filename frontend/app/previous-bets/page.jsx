'use client';

import { useState, useEffect } from "react";
import PreviousBet from "@/components/PreviousBet";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function PreviousBetsPage() {
	const [bets, setBets] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showROI, setShowROI] = useState(false);

	// Fetch bets from DynamoDB on component mount
	useEffect(() => {
		const fetchBets = async () => {
			try {
				setLoading(true);
				const response = await fetch('/api/get-bets');
				const data = await response.json();

				if (data.success) {
					// Transform DynamoDB data to match component format
					const transformedBets = data.bets.map((bet, index) => ({
						id: bet.createdAt, // Use timestamp as unique ID
						player: bet.player,
						team: bet.team,
						action: bet.metric,
						betType: bet.betType.toLowerCase(),
						actionAmount: bet.line,
						betAmount: bet.wager,
						prediction: bet.aiPrediction,
						result: bet.result || null,
						date: new Date(bet.createdAt).toLocaleDateString('en-US', { 
							month: 'short', 
							day: 'numeric', 
							year: 'numeric' 
						}),
						status: bet.status.toLowerCase()
					}));
					setBets(transformedBets);
				} else {
					setError(data.error || "Failed to load bets");
				}
			} catch (err) {
				console.error("Error fetching bets:", err);
				setError("Failed to load bets. Please try again later.");
			} finally {
				setLoading(false);
			}
		};

		fetchBets();
	}, []);

	// Handle status changes
	const handleStatusChange = async (betId, newStatus) => {
		// Handle delete action
		if (newStatus === 'delete') {
			// Optimistically remove from UI
			setBets(prevBets => prevBets.filter(bet => bet.id !== betId));

			try {
				const response = await fetch('/api/delete-bets', {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						createdAt: betId, // betId is the createdAt timestamp
					}),
				});

				const data = await response.json();

				if (!data.success) {
					console.error('Failed to delete bet:', data.error);
					// Restore bet on failure
					if (typeof window !== 'undefined') {
						window.location.reload(); // Simple way to restore state
					}
				}
			} catch (error) {
				console.error('Error deleting bet:', error);
				if (typeof window !== 'undefined') {
					window.location.reload(); // Restore state on error
				}
			}
			return;
		}

		// Handle status update (won/lost/pending)
		// Optimistically update UI
		setBets(prevBets =>
			prevBets.map(bet =>
				bet.id === betId ? { ...bet, status: newStatus } : bet
			)
		);
		
		// Update DynamoDB
		try {
			const response = await fetch('/api/update-bet', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					betId: betId, // This is the createdAt timestamp
					status: newStatus,
				}),
			});

			const data = await response.json();
			
			if (!data.success) {
				console.error('Failed to update bet status:', data.error);
				// Revert optimistic update on failure
				setBets(prevBets =>
					prevBets.map(bet =>
						bet.id === betId ? { ...bet, status: bet.status } : bet
					)
				);
			}
		} catch (error) {
			console.error('Error updating bet status:', error);
			// Could add a toast notification here to inform user of failure
		}
	};

	// Calculate statistics
	const stats = {
		total: bets.length,
		won: bets.filter(bet => bet.status === 'won').length,
		lost: bets.filter(bet => bet.status === 'lost').length,
		pending: bets.filter(bet => bet.status === 'pending').length,
	};
	
	const winRate = stats.total > 0 && (stats.won + stats.lost) > 0 
		? ((stats.won / (stats.won + stats.lost)) * 100).toFixed(1) 
		: 0;

	// Calculate ROI data for chart (only when shown)
	const calculateROI = () => {
		let cumulativeInvested = 0;
		let cumulativeReturns = 0;
		const roiData = [];

		// Sort bets by date (oldest first)
		const sortedBets = [...bets].sort((a, b) => 
			new Date(a.id) - new Date(b.id)
		);

		sortedBets.forEach((bet, index) => {
			cumulativeInvested += bet.betAmount;
			
			if (bet.status === 'won') {
				// Assuming standard -110 odds (risk $110 to win $100)
				// Payout = wager + (wager / 1.1)
				cumulativeReturns += bet.betAmount + (bet.betAmount / 1.1);
			} else if (bet.status === 'lost') {
				// Lost bets contribute nothing to returns
				cumulativeReturns += 0;
			}
			// Pending bets don't affect ROI yet

			const roi = cumulativeInvested > 0 
				? ((cumulativeReturns - cumulativeInvested) / cumulativeInvested) * 100 
				: 0;

			roiData.push({
				betNumber: index + 1,
				date: bet.date,
				roi: roi,
				invested: cumulativeInvested,
				returns: cumulativeReturns,
				profit: cumulativeReturns - cumulativeInvested
			});
		});

		return roiData;
	};

	const roiData = showROI ? calculateROI() : [];

	return (
		<>
			{/* Hero Section */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				<div className="text-center">
					<h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
						Your Betting History
					</h1>
					<p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto">
						Track your performance and analyze your betting patterns
					</p>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-8">
					<div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
						<div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
						<div className="text-blue-100 text-sm font-medium">Total Bets</div>
					</div>
					<div className="bg-green-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-300/30">
						<div className="text-3xl font-bold text-white mb-1">{stats.won}</div>
						<div className="text-green-100 text-sm font-medium">Won</div>
					</div>
					<div className="bg-red-500/20 backdrop-blur-lg rounded-2xl p-6 border border-red-300/30">
						<div className="text-3xl font-bold text-white mb-1">{stats.lost}</div>
						<div className="text-red-100 text-sm font-medium">Lost</div>
					</div>
					<div className="bg-purple-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-300/30">
						<div className="text-3xl font-bold text-white mb-1">{winRate}%</div>
						<div className="text-purple-100 text-sm font-medium">Win Rate</div>
					</div>
				</div>

				{/* ROI Chart */}
				{!loading && !error && bets.length > 0 && (
					<div className="max-w-5xl mx-auto mb-8">
						<div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
							<button
								onClick={() => setShowROI(!showROI)}
								className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
							>
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
										<svg className="w-6 h-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
										</svg>
									</div>
									<h2 className="text-2xl font-bold text-white">ROI Over Time</h2>
								</div>
								<svg 
									className={`w-6 h-6 text-black transition-transform duration-300 ${showROI ? 'rotate-180' : ''}`} 
									fill="none" 
									viewBox="0 0 24 24" 
									stroke="currentColor"
								>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</button>

							{showROI && roiData.length > 0 && (
								<div className="px-6 pb-6">
									<div className="bg-white/100 rounded-xl p-4">
										<ResponsiveContainer width="100%" height={300}>
									<LineChart data={roiData}>
										<CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
										<XAxis 
											dataKey="betNumber" 
											stroke="#1f2937"
											tick={{ fill: '#1f2937' }}
											label={{ value: 'Bet Number', position: 'insideBottom', offset: -5, fill: '#1f2937' }}
										/>
										<YAxis 
											stroke="#1f2937"
											tick={{ fill: '#1f2937' }}
											label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft', fill: '#1f2937' }}
										/>
										<Tooltip 
											contentStyle={{ 
												backgroundColor: 'rgba(31, 41, 55, 0.95)', 
												border: '1px solid rgba(156, 163, 175, 0.3)',
												borderRadius: '8px',
												color: 'white'
											}}
											formatter={(value, name) => {
												if (name === 'roi') return [`${value.toFixed(2)}%`, 'ROI'];
												if (name === 'profit') return [`$${value.toFixed(2)}`, 'Profit'];
												return [value, name];
											}}
										/>
										<ReferenceLine y={0} stroke="rgba(0,0,0,0.3)" strokeDasharray="3 3" />
										<Line 
											type="monotone" 
											dataKey="roi" 
											stroke={roiData[roiData.length - 1]?.roi >= 0 ? "#10b981" : "#ef4444"}
											strokeWidth={3}
											dot={{ fill: roiData[roiData.length - 1]?.roi >= 0 ? "#10b981" : "#ef4444", r: 4 }}
											activeDot={{ r: 6 }}
										/>
										</LineChart>
										</ResponsiveContainer>
										
										{/* Summary Stats */}
										<div className="flex justify-between text-sm text-gray-800 mt-4 px-4">
											<div>
												<span className="text-gray-600">Current ROI: </span>
												<span className={`font-bold ${roiData[roiData.length - 1]?.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
													{roiData[roiData.length - 1]?.roi.toFixed(1)}%
												</span>
											</div>
											<div>
												<span className="text-gray-600">Profit/Loss: </span>
												<span className={`font-bold ${roiData[roiData.length - 1]?.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
													${roiData[roiData.length - 1]?.profit.toFixed(2)}
												</span>
											</div>
											<div>
												<span className="text-gray-600">Total Invested: </span>
												<span className="font-bold text-gray-900">
													${roiData[roiData.length - 1]?.invested.toFixed(2)}
												</span>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Bets List */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
				{/* Loading State */}
				{loading && (
					<div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
						<div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
						<p className="text-gray-600">Loading your bets...</p>
					</div>
				)}

				{/* Error State */}
				{error && (
					<div className="bg-red-50 border-2 border-red-300 rounded-3xl shadow-2xl p-12 text-center">
						<div className="text-6xl mb-4">⚠️</div>
						<h2 className="text-2xl font-bold text-red-900 mb-2">
							Error Loading Bets
						</h2>
						<p className="text-red-700 mb-6">{error}</p>
						<button 
							onClick={() => typeof window !== 'undefined' && window.location.reload()}
							className="inline-block bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-3 px-8 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
						>
							Try Again
						</button>
					</div>
				)}

				{/* Bets List */}
				{!loading && !error && (
					<div className="space-y-6">
						{bets.map((bet) => (
							<PreviousBet 
								key={bet.id} 
								bet={bet} 
								onStatusChange={handleStatusChange}
							/>
						))}
					</div>
				)}

				{/* Empty State (for when there are no bets) */}
				{!loading && !error && bets.length === 0 && (
					<div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
						<div className="text-6xl mb-4">🎯</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							No Bets Yet
						</h2>
						<p className="text-gray-600 mb-6">
							Start by creating your first betting scenario to see it here.
						</p>
						<a 
							href="/get-started"
							className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
						>
							Create Your First Bet
						</a>
					</div>
				)}
			</div>
		</>
	);
}
