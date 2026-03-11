"""
ML Service Module for Hedge Your Bets

This module contains the machine learning models and inference pipeline
for predicting player prop outcomes.

Models trained on: 2020-2024 NFL Season Data
Training date: 2025-10-19 22:54:48
Total models: 56 quantile regression models (4 positions x multiple stats x 3 quantiles)
"""

__version__ = "1.0.0"

# Import main classes for easy access
from .model_loader import ModelLoader
from .feature_engineering import FeatureEngineer
from .prediction_service import PredictionService, PredictionResult
from .constants import (
    ACTION_TO_STAT,
    STAT_TO_ACTION,
    POSITION_STATS,
    VALID_POSITIONS,
    QUANTILES,
    STAT_DISPLAY_NAMES
)

__all__ = [
    'ModelLoader',
    'FeatureEngineer',
    'PredictionService',
    'PredictionResult',
    'ACTION_TO_STAT',
    'STAT_TO_ACTION',
    'POSITION_STATS',
    'VALID_POSITIONS',
    'QUANTILES',
    'STAT_DISPLAY_NAMES'
]

