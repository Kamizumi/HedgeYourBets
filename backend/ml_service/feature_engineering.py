"""
Feature Engineering for ML inference.
Prepares player data for model predictions.
"""

import pandas as pd
import numpy as np
import logging
from typing import Dict, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class FeatureEngineer:
    """
    Handles feature engineering for player predictions.
    Creates rolling averages, temporal features, and team context.
    """
    
    def __init__(self):
        """Initialize the feature engineer."""
        pass
    
    def create_rolling_features(
        self, 
        df: pd.DataFrame, 
        stat_cols: List[str], 
        windows: List[int] = [3, 5]
    ) -> pd.DataFrame:
        """
        Create rolling average features for player statistics.
        
        Args:
            df: DataFrame with player game data (sorted by date)
            stat_cols: List of stat column names to create rolling features for
            windows: List of window sizes (default: [3, 5])
        
        Returns:
            DataFrame with added rolling feature columns
        """
        df = df.copy()
        
        # Ensure data is sorted properly
        if 'player_id' in df.columns and 'season' in df.columns and 'week' in df.columns:
            df = df.sort_values(['player_id', 'season', 'week'])
        
        for window in windows:
            for stat in stat_cols:
                if stat in df.columns:
                    # Rolling mean
                    df[f'{stat}_avg_{window}'] = (
                        df.groupby('player_id')[stat]
                        .rolling(window=window, min_periods=1)
                        .mean()
                        .reset_index(0, drop=True)
                    )
                    
                    # Rolling standard deviation
                    df[f'{stat}_std_{window}'] = (
                        df.groupby('player_id')[stat]
                        .rolling(window=window, min_periods=1)
                        .std()
                        .reset_index(0, drop=True)
                    )
                    
                    # Fill NaN in std with 0 (happens when only 1 game)
                    df[f'{stat}_std_{window}'] = df[f'{stat}_std_{window}'].fillna(0)
        
        return df
    
    def add_temporal_features(
        self, 
        df: pd.DataFrame,
        season: Optional[int] = None,
        week: Optional[int] = None,
        is_playoff: bool = False
    ) -> pd.DataFrame:
        """
        Add temporal features like season progression and playoff indicator.
        
        Args:
            df: DataFrame to add features to
            season: Season year (if not in df)
            week: Week number (if not in df)
            is_playoff: Whether this is a playoff game
        
        Returns:
            DataFrame with added temporal features
        """
        df = df.copy()
        
        # Add season and week if provided
        if season is not None and 'season' not in df.columns:
            df['season'] = season
        if week is not None and 'week' not in df.columns:
            df['week'] = week
        
        # Season progression (0 to 1)
        if 'week' in df.columns:
            df['season_progression'] = df['week'] / 18.0
        
        # Playoff indicator
        if 'season_type' in df.columns:
            df['is_playoff'] = (df['season_type'] == 'POST').astype(int)
        else:
            df['is_playoff'] = int(is_playoff)
        
        # Home game indicator (placeholder - would need schedule data)
        if 'is_home' not in df.columns:
            df['is_home'] = 0
        
        return df
    
    def add_team_context_features(
        self, 
        df: pd.DataFrame,
        team_stats: Optional[Dict[str, float]] = None
    ) -> pd.DataFrame:
        """
        Add team-level context features.
        
        Args:
            df: DataFrame to add features to
            team_stats: Dictionary of team statistics (optional)
                       Keys: 'team_passing_yards', 'team_rushing_yards', 
                            'team_receptions', 'team_targets'
        
        Returns:
            DataFrame with added team context features
        """
        df = df.copy()
        
        # If team stats provided, add them as features
        if team_stats:
            for stat_name, stat_value in team_stats.items():
                df[stat_name] = stat_value
        
        # Otherwise, set default values (league average approximations)
        else:
            default_team_stats = {
                'team_passing_yards': 230.0,
                'team_rushing_yards': 120.0,
                'team_receptions': 22.0,
                'team_targets': 34.0
            }
            
            for stat_name, stat_value in default_team_stats.items():
                if stat_name not in df.columns:
                    df[stat_name] = stat_value
        
        return df
    
    def prepare_inference_features(
        self,
        player_history: pd.DataFrame,
        position: str,
        stat_cols: List[str],
        current_season: int,
        current_week: int,
        is_playoff: bool = False,
        team_stats: Optional[Dict[str, float]] = None
    ) -> pd.DataFrame:
        """
        Prepare all features needed for model inference.
        
        Args:
            player_history: DataFrame with player's recent game history
            position: Player position (QB, RB, WR, TE)
            stat_cols: List of stats to create rolling features for
            current_season: Current season year
            current_week: Current week number
            is_playoff: Whether this is a playoff game
            team_stats: Optional team statistics
        
        Returns:
            DataFrame with all engineered features for the NEXT game
        """
        df = player_history.copy()
        
        # Add temporal features to historical data
        df = self.add_temporal_features(df)
        
        # Create rolling features from historical data
        df = self.create_rolling_features(df, stat_cols, windows=[3, 5])
        
        # Add team context
        df = self.add_team_context_features(df, team_stats)
        
        # Get the most recent row (this will be our feature vector)
        # The rolling features represent the player's form going INTO the next game
        if len(df) > 0:
            latest_features = df.iloc[[-1]].copy()
            
            # Update to next game's temporal features
            latest_features['season'] = current_season
            latest_features['week'] = current_week
            latest_features['season_progression'] = current_week / 18.0
            latest_features['is_playoff'] = int(is_playoff)
        else:
            # No history - create a minimal feature set
            logger.warning("No player history available, using default features")
            latest_features = pd.DataFrame({
                'season': [current_season],
                'week': [current_week],
                'season_progression': [current_week / 18.0],
                'is_playoff': [int(is_playoff)],
                'is_home': [0]
            })
            
            # Add default rolling features (all zeros)
            for window in [3, 5]:
                for stat in stat_cols:
                    latest_features[f'{stat}_avg_{window}'] = 0.0
                    latest_features[f'{stat}_std_{window}'] = 0.0
            
            # Add team context
            latest_features = self.add_team_context_features(latest_features, team_stats)
        
        return latest_features
    
    def validate_features(
        self,
        df: pd.DataFrame,
        required_features: List[str]
    ) -> tuple[bool, List[str]]:
        """
        Validate that all required features are present in the DataFrame.
        
        Args:
            df: DataFrame to validate
            required_features: List of required feature names
        
        Returns:
            Tuple of (is_valid, missing_features)
        """
        missing_features = [f for f in required_features if f not in df.columns]
        is_valid = len(missing_features) == 0
        
        if not is_valid:
            logger.warning(f"Missing features: {missing_features}")
        
        return is_valid, missing_features
    
    def align_features(
        self,
        df: pd.DataFrame,
        required_features: List[str]
    ) -> pd.DataFrame:
        """
        Align DataFrame columns to match required feature order.
        Adds missing columns with zeros.
        
        Args:
            df: DataFrame with features
            required_features: List of required feature names in correct order
        
        Returns:
            DataFrame with columns aligned to required_features
        """
        df = df.copy()
        
        # Add missing columns with zeros
        for feature in required_features:
            if feature not in df.columns:
                logger.warning(f"Adding missing feature '{feature}' with default value 0")
                df[feature] = 0.0
        
        # Select and reorder columns to match required features
        df = df[required_features]
        
        return df

