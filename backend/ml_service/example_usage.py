"""
Example usage of the ML Service for making predictions.

This file demonstrates how to use the prediction service.
NOTE: This requires player historical data to work properly.
"""

import pandas as pd
from prediction_service import PredictionService
from constants import ACTION_TO_STAT

# Initialize the prediction service
predictor = PredictionService()

# Example: Predict Patrick Mahomes passing yards
# In production, this data would come from your database

# Mock player history (last 5 games)
player_history = pd.DataFrame({
    'player_id': ['mahomes'] * 5,
    'season': [2025] * 5,
    'week': [1, 2, 3, 4, 5],
    'season_type': ['REG'] * 5,
    'team': ['Kansas City Chiefs'] * 5,
    # QB stats
    'passing_yards': [285, 312, 298, 275, 320],
    'passing_tds': [2, 3, 2, 1, 3],
    'completions': [25, 28, 27, 24, 29],
    'attempts': [38, 42, 40, 36, 43],
    'passing_interceptions': [1, 0, 1, 2, 0],
    'rushing_yards': [15, 8, 12, 5, 18]
})

try:
    # Make a prediction
    result = predictor.predict_from_betting_scenario(
        player_name='Patrick Mahomes',
        position='QB',
        team='Kansas City Chiefs',
        action='Passing Yards',  # Frontend display name
        bet_type='over',
        action_amount=275.5,  # Threshold
        player_history=player_history,
        current_season=2025,
        current_week=6,
        is_playoff=False
    )
    
    # Display results
    print("=" * 60)
    print(f"PREDICTION RESULTS")
    print("=" * 60)
    print(f"Player: Patrick Mahomes (QB)")
    print(f"Stat: {result.stat_display_name}")
    print(f"Bet: {result.bet_type.upper()} {result.threshold}")
    print()
    print("Predictions:")
    print(f"  Pessimistic (q10): {result.predictions['q10']:.1f}")
    print(f"  Most Likely (q50): {result.predictions['q50']:.1f}")
    print(f"  Optimistic (q90): {result.predictions['q90']:.1f}")
    print()
    print(f"Win Probability: {result.win_probability:.1%}")
    print(f"Confidence: {result.confidence_level}")
    print(f"Expected Value: {result.expected_value:.3f}")
    print(f"Recommendation: {result.recommendation}")
    print("=" * 60)
    
except Exception as e:
    print(f"Error making prediction: {e}")
    import traceback
    traceback.print_exc()

