'use client';

import React, { useState } from "react";

export default function PreviousBet({ bet, onStatusChange }) {
  const [status, setStatus] = useState(bet.status);
  const [deleteState, setDeleteState] = useState('idle'); // 'idle', 'confirm', 'deleting'
  
  const {
    player,
    team,
    action,
    betType,
    actionAmount,
    betAmount,
    prediction,
    result,
    date
  } = bet;

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'delete') {
      if (deleteState === 'idle') {
        setDeleteState('confirm');
        // Reset after 3 seconds if user doesn't click again
        setTimeout(() => setDeleteState('idle'), 3000);
      } else if (deleteState === 'confirm') {
        setDeleteState('deleting');
        // Show the checkmark for 800ms before actually deleting
        setTimeout(() => {
          onStatusChange(bet.id, newStatus);
        }, 800);
      }
    } else {
      setStatus(newStatus);
      if (onStatusChange) {
        onStatusChange(bet.id, newStatus);
      }
    }
  };

  // Determine status styling
  const getStatusStyles = () => {
    switch (status) {
      case 'won':
        return {
          bg: 'bg-green-50',
          border: 'border-green-300',
          text: 'text-green-700',
          badge: 'bg-green-100 text-green-800',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'lost':
        return {
          bg: 'bg-red-50',
          border: 'border-red-300',
          text: 'text-red-700',
          badge: 'bg-red-100 text-red-800',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'pending':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          text: 'text-blue-700',
          badge: 'bg-blue-100 text-blue-800',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  const statusStyles = getStatusStyles();

  return (
    <div className={`rounded-2xl border-2 ${statusStyles.border} ${statusStyles.bg} p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold text-gray-900">{player}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusStyles.badge}`}>
              {statusStyles.icon}
              {status.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-600 font-medium">{team}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-sm text-gray-500">{date}</p>
          {/* Status Update Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange('won')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${
                status === 'won'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-green-600 border border-green-300 hover:bg-green-50'
              }`}
              title="Mark as Won"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Won
            </button>
            <button
              onClick={() => handleStatusChange('lost')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${
                status === 'lost'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
              }`}
              title="Mark as Lost"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lost
            </button>
            <button
              onClick={() => handleStatusChange('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${
                status === 'pending'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
              }`}
              title="Mark as Pending"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pending
            </button>
            <button
              onClick={() => handleStatusChange('delete')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${
                deleteState === 'idle'
                  ? 'bg-white text-gray-600 border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
                  : deleteState === 'confirm'
                  ? 'bg-orange-500 text-white border border-orange-600 animate-pulse'
                  : 'bg-green-500 text-white border border-green-600'
              }`}
              title={deleteState === 'idle' ? 'Delete Bet' : deleteState === 'confirm' ? 'Click again to confirm' : 'Deleted'}
              disabled={deleteState === 'deleting'}
            >
              {deleteState === 'idle' ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </>
              ) : deleteState === 'confirm' ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Click Again?
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Deleted
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bet Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white/70 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1 font-semibold">BET TYPE</p>
          <p className="text-lg font-bold text-gray-900 capitalize">{betType}</p>
        </div>
        <div className="bg-white/70 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1 font-semibold">ACTION</p>
          <p className="text-lg font-bold text-gray-900">{action}</p>
        </div>
        <div className="bg-white/70 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1 font-semibold">LINE</p>
          <p className="text-lg font-bold text-gray-900">{actionAmount} units</p>
        </div>
        <div className="bg-white/70 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1 font-semibold">WAGER</p>
          <p className="text-lg font-bold text-gray-900">${betAmount}</p>
        </div>
      </div>

      {/* Prediction & Result */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-sm text-gray-600 font-semibold">AI Prediction</p>
          </div>
          <p className="text-gray-900 font-medium">{prediction}</p>
        </div>
        {result && (
          <div className="bg-white/70 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm text-gray-600 font-semibold">Actual Result</p>
            </div>
            <p className="text-gray-900 font-medium">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
