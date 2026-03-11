"""
Model Loader for ML inference service.
Implements lazy loading to avoid loading all 56 models at startup.
"""

import joblib
import logging
from pathlib import Path
from typing import Dict, Optional, Tuple, Any

try:
    from .constants import get_model_filename, VALID_POSITIONS, QUANTILES
except ImportError:
    from constants import get_model_filename, VALID_POSITIONS, QUANTILES

logger = logging.getLogger(__name__)


class ModelLoader:
    """
    Manages loading and caching of ML models.
    Uses lazy loading - models are only loaded when first requested.
    """
    
    def __init__(self, models_dir: Optional[Path] = None):
        """
        Initialize the model loader.
        
        Args:
            models_dir: Path to directory containing model files.
                       If None, uses the same directory as this file.
        """
        if models_dir is None:
            models_dir = Path(__file__).parent
        
        self.models_dir = Path(models_dir)
        self._model_cache: Dict[str, Any] = {}
        self._feature_columns: Optional[Dict] = None
        self._model_metadata: Optional[Dict] = None
        
        logger.info(f"ModelLoader initialized with models_dir: {self.models_dir}")
    
    def _load_feature_columns(self) -> Dict:
        """
        Load feature columns mapping from disk.
        This is critical for ensuring features are in the correct order.
        """
        if self._feature_columns is None:
            feature_file = self.models_dir / "feature_columns.joblib"
            
            if not feature_file.exists():
                raise FileNotFoundError(
                    f"Feature columns file not found: {feature_file}"
                )
            
            try:
                self._feature_columns = joblib.load(feature_file)
                logger.info("Feature columns loaded successfully")
            except Exception as e:
                logger.error(f"Error loading feature columns: {e}")
                raise
        
        return self._feature_columns
    
    def _load_model_metadata(self) -> Dict:
        """Load model metadata from disk."""
        if self._model_metadata is None:
            metadata_file = self.models_dir / "model_metadata.joblib"
            
            if not metadata_file.exists():
                logger.warning(f"Model metadata file not found: {metadata_file}")
                return {}
            
            try:
                self._model_metadata = joblib.load(metadata_file)
                logger.info("Model metadata loaded successfully")
            except Exception as e:
                logger.warning(f"Error loading model metadata: {e}")
                self._model_metadata = {}
        
        return self._model_metadata
    
    def get_model(self, position: str, stat: str, quantile: str) -> Tuple[Any, list]:
        """
        Load a specific model and its feature columns.
        Uses caching to avoid reloading the same model.
        
        Args:
            position: Player position (QB, RB, WR, TE)
            stat: Stat name (e.g., 'passing_yards')
            quantile: Quantile identifier (q10, q50, q90)
        
        Returns:
            Tuple of (model, feature_columns)
        
        Raises:
            ValueError: If position or quantile is invalid
            FileNotFoundError: If model file doesn't exist
        """
        # Validate inputs
        if position not in VALID_POSITIONS:
            raise ValueError(
                f"Invalid position '{position}'. Must be one of {VALID_POSITIONS}"
            )
        
        if quantile not in QUANTILES:
            raise ValueError(
                f"Invalid quantile '{quantile}'. Must be one of {list(QUANTILES.keys())}"
            )
        
        # Create cache key
        cache_key = f"{position}_{stat}_{quantile}"
        
        # Check cache first
        if cache_key in self._model_cache:
            logger.debug(f"Model '{cache_key}' loaded from cache")
            model = self._model_cache[cache_key]
        else:
            # Load model from disk
            model_filename = get_model_filename(position, stat, quantile)
            model_path = self.models_dir / model_filename
            
            if not model_path.exists():
                raise FileNotFoundError(
                    f"Model file not found: {model_path}. "
                    f"Position '{position}' may not have a model for stat '{stat}'."
                )
            
            try:
                model = joblib.load(model_path)
                self._model_cache[cache_key] = model
                logger.info(f"Model '{cache_key}' loaded from disk")
            except Exception as e:
                logger.error(f"Error loading model '{cache_key}': {e}")
                raise
        
        # Get feature columns for this model
        feature_columns = self.get_feature_columns(position, stat)
        
        return model, feature_columns
    
    def get_feature_columns(self, position: str, stat: str) -> list:
        """
        Get the required feature columns for a specific model.
        
        Args:
            position: Player position (QB, RB, WR, TE)
            stat: Stat name (e.g., 'passing_yards')
        
        Returns:
            List of feature column names in the correct order
        """
        feature_cols = self._load_feature_columns()
        
        model_key = f"{position}_{stat}"
        
        if model_key not in feature_cols:
            raise KeyError(
                f"Feature columns not found for '{model_key}'. "
                f"Available models: {list(feature_cols.keys())}"
            )
        
        return feature_cols[model_key]
    
    def get_all_quantile_models(self, position: str, stat: str) -> Dict[str, Tuple[Any, list]]:
        """
        Load all three quantile models (q10, q50, q90) for a position-stat combination.
        
        Args:
            position: Player position (QB, RB, WR, TE)
            stat: Stat name (e.g., 'passing_yards')
        
        Returns:
            Dictionary with quantile keys and (model, features) tuples as values
        """
        models = {}
        
        for quantile in QUANTILES.keys():
            try:
                model, features = self.get_model(position, stat, quantile)
                models[quantile] = (model, features)
            except FileNotFoundError:
                logger.warning(
                    f"Model not found for {position}_{stat}_{quantile}, skipping"
                )
        
        return models
    
    def model_exists(self, position: str, stat: str) -> bool:
        """
        Check if a model exists for a given position-stat combination.
        
        Args:
            position: Player position (QB, RB, WR, TE)
            stat: Stat name (e.g., 'passing_yards')
        
        Returns:
            True if at least one quantile model exists, False otherwise
        """
        for quantile in QUANTILES.keys():
            model_filename = get_model_filename(position, stat, quantile)
            model_path = self.models_dir / model_filename
            if model_path.exists():
                return True
        
        return False
    
    def get_metadata(self) -> Dict:
        """Get model training metadata."""
        return self._load_model_metadata()
    
    def clear_cache(self):
        """Clear the model cache to free memory."""
        self._model_cache.clear()
        logger.info("Model cache cleared")
    
    def get_cache_info(self) -> Dict:
        """Get information about currently cached models."""
        return {
            'cached_models': list(self._model_cache.keys()),
            'cache_size': len(self._model_cache)
        }

