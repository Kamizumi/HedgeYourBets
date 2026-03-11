"""
Preprocessing utilities for Hedge Your Bets ML inference
Auto-generated from model_training.ipynb
Training Date: 2025-10-19T22:53:09.771662
Data: 2020-2024 NFL player and team stats
"""

import pandas as pd
import numpy as np
from pathlib import Path


class InferencePreprocessor:
    """Preprocessing pipeline for making predictions on new betting scenarios."""
    
    def __init__(self, datasets_dir='../datasets'):
        """Initialize with path to datasets directory."""
        self.datasets_dir = Path(datasets_dir)
        self.player_weekly_dir = self.datasets_dir / "player_weekly_stats"
        self.team_weekly_dir = self.datasets_dir / "team_season_stats"
        
    def add_temporal_features(self, df):
        """Add temporal features like season progression."""
        df = df.copy()
        df['season_progression'] = df['week'] / 18.0
        df['is_playoff'] = (df['season_type'] == 'POST').astype(int)
        df['is_home'] = 0  # Placeholder - would need schedule data for actual home/away
        return df
    
    def create_rolling_features(self, df, stat_cols, windows=[3, 5]):
        """Create rolling averages for key statistics."""
        df = df.sort_values(['player_id', 'season', 'week'])
        
        for window in windows:
            for stat in stat_cols:
                if stat in df.columns:
                    # Rolling mean
                    df[f'{stat}_avg_{window}'] = df.groupby('player_id')[stat].rolling(
                        window=window, min_periods=1
                    ).mean().reset_index(0, drop=True)
                    
                    # Rolling std
                    df[f'{stat}_std_{window}'] = df.groupby('player_id')[stat].rolling(
                        window=window, min_periods=1
                    ).std().reset_index(0, drop=True)
        
        return df
    
    def merge_team_context(self, player_df, team_df):
        """Merge team-level context features."""
        team_df = team_df.copy()
        team_df['team_game_id'] = team_df['season'].astype(str) + '_' + team_df['week'].astype(str) + '_' + team_df['team']
        
        # Select relevant team features (only numeric ones)
        team_features = ['passing_yards', 'rushing_yards', 'receptions', 'targets']
        team_subset = team_df[['team_game_id'] + team_features].copy()
        
        # Rename columns to indicate team context
        team_subset.columns = ['team_game_id'] + [f'team_{col}' for col in team_features]
        
        # Create game identifier in player data
        player_df['game_id'] = player_df['season'].astype(str) + '_' + player_df['week'].astype(str) + '_' + player_df['team']
        
        # Merge with player data
        player_df = player_df.merge(team_subset, left_on='game_id', right_on='team_game_id', how='left')
        
        # Drop the team_game_id column
        if 'team_game_id' in player_df.columns:
            player_df = player_df.drop('team_game_id', axis=1)
        
        return player_df
    
    def get_player_recent_games(self, player_id, season, week, num_games=5):
        """
        Get recent game data for a player to calculate rolling features.
        This is the main function you'll use for inference.
        """
        # Load recent data (this is simplified - in production you'd have this data ready)
        # For now, assumes data is loaded from CSVs
        pass  # Implement based on your data loading strategy


# Position-specific stat mappings
POSITION_STATS = {
    'QB': ['passing_yards', 'passing_tds', 'completions', 'attempts', 'passing_interceptions', 'rushing_yards'],
    'RB': ['rushing_yards', 'rushing_tds', 'carries', 'receptions', 'receiving_yards', 'receiving_tds'],
    'WR': ['receiving_yards', 'receptions', 'receiving_tds', 'targets'],
    'TE': ['receiving_yards', 'receptions', 'receiving_tds']
}

# Action name mappings (frontend -> model stat name)
ACTION_TO_STAT = {
    'Passing Yards': 'passing_yards',
    'Passing TDs': 'passing_tds',
    'Completions': 'completions',
    'Interceptions': 'passing_interceptions',
    'Rushing Yards': 'rushing_yards',
    'Rushing TDs': 'rushing_tds',
    'Receiving Yards': 'receiving_yards',
    'Receiving TDs': 'receiving_tds',
    'Receptions': 'receptions',
    'Targets': 'targets',
    'Touchdowns': 'touchdowns'  # Note: May need position-specific handling
}

# Stat to action name (reverse mapping)
STAT_TO_ACTION = {v: k for k, v in ACTION_TO_STAT.items()}
