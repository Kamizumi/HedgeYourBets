"""
Prediction Service for ML inference.
Main entry point for making betting predictions.
"""

import pandas as pd
import numpy as np
import logging
from typing import Dict, Optional, List, Any
from dataclasses import dataclass

try:
    from .model_loader import ModelLoader
    from .feature_engineering import FeatureEngineer
    from .constants import (
        ACTION_TO_STAT, 
        POSITION_STATS, 
        VALID_POSITIONS,
        STAT_DISPLAY_NAMES,
        STAT_UNITS,
        QUANTILES
    )
except ImportError:
    from model_loader import ModelLoader
    from feature_engineering import FeatureEngineer
    from constants import (
        ACTION_TO_STAT, 
        POSITION_STATS, 
        VALID_POSITIONS,
        STAT_DISPLAY_NAMES,
        STAT_UNITS,
        QUANTILES
    )

logger = logging.getLogger(__name__)


@dataclass
class PredictionResult:
    """Container for prediction results."""
    position: str
    stat_name: str
    stat_display_name: str
    predictions: Dict[str, float]  # quantile -> predicted value
    threshold: float
    bet_type: str  # 'over' or 'under'
    win_probability: float
    confidence_level: str  # 'Low', 'Medium', 'High'
    expected_value: float
    recommendation: str
    details: Dict[str, Any]


class PredictionService:
    """
    Main service for making player prop predictions.
    Orchestrates model loading, feature engineering, and prediction.
    """
    
    def __init__(self, models_dir: Optional[str] = None):
        """
        Initialize the prediction service.
        
        Args:
            models_dir: Path to directory containing model files
        """
        self.model_loader = ModelLoader(models_dir)
        self.feature_engineer = FeatureEngineer()
        logger.info("PredictionService initialized")
    
    def validate_position_stat_combination(
        self, 
        position: str, 
        stat_name: str
    ) -> tuple[bool, Optional[str]]:
        """
        Validate that a position-stat combination is supported.
        
        Args:
            position: Player position
            stat_name: Stat name
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        if position not in VALID_POSITIONS:
            return False, f"Invalid position '{position}'. Must be one of {VALID_POSITIONS}"
        
        if position not in POSITION_STATS:
            return False, f"No stats defined for position '{position}'"
        
        position_stat_list = POSITION_STATS[position]
        if stat_name not in position_stat_list:
            return False, (
                f"Position '{position}' does not support stat '{stat_name}'. "
                f"Available stats: {position_stat_list}"
            )
        
        # Check if model actually exists
        if not self.model_loader.model_exists(position, stat_name):
            return False, f"No trained model found for {position}_{stat_name}"
        
        return True, None
    
    def predict(
        self,
        position: str,
        stat_name: str,
        player_history: pd.DataFrame,
        current_season: int,
        current_week: int,
        threshold: float,
        bet_type: str,
        is_playoff: bool = False,
        team_stats: Optional[Dict[str, float]] = None
    ) -> PredictionResult:
        """
        Make a prediction for a player prop bet.
        
        Args:
            position: Player position (QB, RB, WR, TE)
            stat_name: Stat to predict (e.g., 'passing_yards')
            player_history: DataFrame with player's recent game history
            current_season: Current season year
            current_week: Current week number
            threshold: Betting threshold (e.g., 250.5 yards)
            bet_type: 'over' or 'under'
            is_playoff: Whether this is a playoff game
            team_stats: Optional team statistics
        
        Returns:
            PredictionResult object with predictions and analysis
        
        Raises:
            ValueError: If position/stat combination is invalid
        """
        # Validate inputs
        is_valid, error_msg = self.validate_position_stat_combination(position, stat_name)
        if not is_valid:
            raise ValueError(error_msg)
        
        if bet_type not in ['over', 'under']:
            raise ValueError(f"Invalid bet_type '{bet_type}'. Must be 'over' or 'under'")
        
        logger.info(f"Making prediction for {position}_{stat_name}, threshold={threshold}, bet_type={bet_type}")
        
        # Prepare features
        stat_cols = POSITION_STATS[position]
        features_df = self.feature_engineer.prepare_inference_features(
            player_history=player_history,
            position=position,
            stat_cols=stat_cols,
            current_season=current_season,
            current_week=current_week,
            is_playoff=is_playoff,
            team_stats=team_stats
        )
        
        # Load all quantile models
        models = self.model_loader.get_all_quantile_models(position, stat_name)
        
        if not models:
            raise RuntimeError(f"Failed to load any models for {position}_{stat_name}")
        
        # Make predictions with each quantile model
        predictions = {}
        for quantile, (model, required_features) in models.items():
            # Align features to model requirements
            aligned_features = self.feature_engineer.align_features(
                features_df,
                required_features
            )
            
            # Make prediction
            pred = model.predict(aligned_features)[0]
            predictions[quantile] = float(pred)
            logger.debug(f"Prediction {quantile}: {pred:.2f}")
        
        # Calculate win probability and analysis
        analysis = self._analyze_prediction(
            predictions=predictions,
            threshold=threshold,
            bet_type=bet_type
        )
        
        # Create result
        result = PredictionResult(
            position=position,
            stat_name=stat_name,
            stat_display_name=STAT_DISPLAY_NAMES.get(stat_name, stat_name),
            predictions=predictions,
            threshold=threshold,
            bet_type=bet_type,
            win_probability=analysis['win_probability'],
            confidence_level=analysis['confidence_level'],
            expected_value=analysis['expected_value'],
            recommendation=analysis['recommendation'],
            details={
                'player_games_analyzed': len(player_history),
                'current_season': current_season,
                'current_week': current_week,
                'is_playoff': is_playoff,
                'stat_unit': STAT_UNITS.get(stat_name, ''),
                **analysis
            }
        )
        
        return result
    
    def _analyze_prediction(
        self,
        predictions: Dict[str, float],
        threshold: float,
        bet_type: str
    ) -> Dict[str, Any]:
        """
        Analyze predictions to determine win probability and confidence.
        
        Args:
            predictions: Dictionary of quantile predictions
            threshold: Betting threshold
            bet_type: 'over' or 'under'
        
        Returns:
            Dictionary with analysis results
        """
        q10 = predictions.get('q10', 0)
        q50 = predictions.get('q50', 0)
        q90 = predictions.get('q90', 0)
        
        # Estimate win probability based on quantile predictions
        if bet_type == 'over':
            # For over bets: probability player exceeds threshold
            if threshold < q10:
                # Threshold below 10th percentile - very likely to hit
                win_prob = 0.95
            elif threshold > q90:
                # Threshold above 90th percentile - very unlikely to hit
                win_prob = 0.05
            elif threshold > q50:
                # Threshold above median
                # Linear interpolation between q50 and q90
                win_prob = 0.50 - ((threshold - q50) / (q90 - q50 + 0.001)) * 0.40
            else:
                # Threshold below median
                # Linear interpolation between q10 and q50
                win_prob = 0.90 - ((threshold - q10) / (q50 - q10 + 0.001)) * 0.40
        
        else:  # under
            # For under bets: probability player stays under threshold
            if threshold > q90:
                # Threshold above 90th percentile - very likely to stay under
                win_prob = 0.95
            elif threshold < q10:
                # Threshold below 10th percentile - very unlikely to stay under
                win_prob = 0.05
            elif threshold < q50:
                # Threshold below median
                # Linear interpolation between q10 and q50
                win_prob = 0.50 - ((q50 - threshold) / (q50 - q10 + 0.001)) * 0.40
            else:
                # Threshold above median
                # Linear interpolation between q50 and q90
                win_prob = 0.90 - ((q90 - threshold) / (q90 - q50 + 0.001)) * 0.40
        
        # Clamp probability between 0.05 and 0.95
        win_prob = max(0.05, min(0.95, win_prob))
        
        # Determine confidence level based on prediction spread AND win probability
        # Confidence reflects both:
        # 1. Model certainty (prediction spread) - how certain is the model about the value?
        # 2. Outcome certainty (win probability) - how certain are we about the bet outcome?
        spread = q90 - q10
        median = q50
        relative_spread = spread / (median + 1)  # Coefficient of variation approximation
        
        # Calculate confidence score from prediction spread (0-2 scale)
        # Low spread = high model confidence, High spread = low model confidence
        if relative_spread < 0.3:
            spread_score = 2.0  # High model confidence
        elif relative_spread < 0.6:
            spread_score = 1.0  # Medium model confidence
        else:
            spread_score = 0.0  # Low model confidence
        
        # Calculate confidence score from win probability (0-2 scale)
        # Distance from 50% (0.5) indicates outcome certainty
        # Win prob of 0.5 = uncertain outcome, 0.0 or 1.0 = certain outcome
        prob_distance_from_50 = abs(win_prob - 0.5)  # Range: 0.0 to 0.5
        prob_score = prob_distance_from_50 * 4.0  # Scale to 0-2 range (0.5 * 4 = 2.0)
        
        # Combine scores with weighted average
        # Weight spread more when win prob is moderate (outcome uncertain)
        # Weight win prob more when it's extreme (outcome certain)
        if win_prob >= 0.90 or win_prob <= 0.10:
            # Extreme win probability: outcome is nearly certain, weight win prob heavily
            combined_score = 0.2 * spread_score + 0.8 * prob_score
            # Ensure minimum score for extreme probabilities (outcome is very certain)
            combined_score = max(combined_score, 1.4)
        elif win_prob >= 0.80 or win_prob <= 0.20:
            # High/low win probability: balance both factors
            combined_score = 0.5 * spread_score + 0.5 * prob_score
        else:
            # Moderate win probability: outcome uncertain, weight spread more
            combined_score = 0.7 * spread_score + 0.3 * prob_score
        
        # Map combined score to confidence level
        # Score ranges: 0-0.67 = Low, 0.67-1.33 = Medium, 1.33-2.0 = High
        if combined_score >= 1.33:
            confidence = 'High'
        elif combined_score >= 0.67:
            confidence = 'Medium'
        else:
            confidence = 'Low'
        
        # Probability Edge: measures how much win probability deviates from 50% (fair odds)
        # Range: -1 (0% win prob) to +1 (100% win prob), 0 = 50% (fair odds)
        # Formula: 2 * win_prob - 1
        # Positive = favorable probability, negative = unfavorable
        # Note: This is NOT actual monetary expected value (which would require odds/bet amounts)
        expected_value = 2 * win_prob - 1
        
        # Generate recommendation based on win probability and confidence
        # Low confidence requires higher win probability for same recommendation
        if confidence == 'Low':
            # More conservative thresholds for low confidence
            if win_prob >= 0.75:
                recommendation = 'Good Bet'
            elif win_prob >= 0.65:
                recommendation = 'Fair Bet'
            elif win_prob >= 0.55:
                recommendation = 'Risky Bet'
            else:
                recommendation = 'Poor Bet'
        elif confidence == 'Medium':
            # Standard thresholds
            if win_prob >= 0.60:
                recommendation = 'Good Bet'
            elif win_prob >= 0.50:
                recommendation = 'Fair Bet'
            elif win_prob >= 0.40:
                recommendation = 'Risky Bet'
            else:
                recommendation = 'Poor Bet'
        else:  # High confidence
            # Can be slightly more aggressive with high confidence
            if win_prob >= 0.55:
                recommendation = 'Good Bet'
            elif win_prob >= 0.45:
                recommendation = 'Fair Bet'
            elif win_prob >= 0.35:
                recommendation = 'Risky Bet'
            else:
                recommendation = 'Poor Bet'
        
        return {
            'win_probability': round(win_prob, 3),
            'confidence_level': confidence,
            'expected_value': round(expected_value, 3),
            'recommendation': recommendation,
            'prediction_spread': round(spread, 2),
            'relative_spread': round(relative_spread, 3),
            'distance_from_median': round(abs(threshold - q50), 2)
        }
    
    def predict_from_betting_scenario(
        self,
        player_name: str,
        position: str,
        team: str,
        action: str,
        bet_type: str,
        action_amount: float,
        player_history: pd.DataFrame,
        current_season: int = 2025,
        current_week: int = 1,
        is_playoff: bool = False,
        team_stats: Optional[Dict[str, float]] = None
    ) -> PredictionResult:
        """
        Make a prediction from a betting scenario (as submitted by frontend).
        
        Args:
            player_name: Player name
            position: Player position
            team: Team name
            action: Action display name (e.g., 'Passing Yards')
            bet_type: 'over' or 'under'
            action_amount: Threshold value
            player_history: Player's recent game history
            current_season: Current season
            current_week: Current week
            is_playoff: Whether playoff game
            team_stats: Optional team stats
        
        Returns:
            PredictionResult object
        """
        # Convert action display name to stat name
        stat_name = ACTION_TO_STAT.get(action)
        
        if stat_name is None:
            raise ValueError(
                f"Unknown action '{action}'. "
                f"Valid actions: {list(ACTION_TO_STAT.keys())}"
            )
        
        logger.info(f"Predicting for player='{player_name}', action='{action}' -> stat='{stat_name}'")
        
        # Make prediction
        return self.predict(
            position=position,
            stat_name=stat_name,
            player_history=player_history,
            current_season=current_season,
            current_week=current_week,
            threshold=action_amount,
            bet_type=bet_type,
            is_playoff=is_playoff,
            team_stats=team_stats
        )

