# ML Service Module

Machine Learning inference service for Hedge Your Bets player prop predictions.

## Overview

This module provides a complete ML inference pipeline for predicting NFL player prop bets. It includes:

- **56 trained models** (4 positions × multiple stats × 3 quantiles)
- **Lazy model loading** for efficient memory usage
- **Feature engineering** with rolling averages and temporal features
- **Prediction analysis** with win probability and confidence scoring

## Architecture

```
ml_service/
├── __init__.py                    # Package exports
├── constants.py                   # Mappings and constants
├── model_loader.py                # Lazy model loading with caching
├── feature_engineering.py         # Feature preprocessing
├── prediction_service.py          # Main prediction orchestration
├── inference_preprocessing.py     # Legacy preprocessing utilities
├── example_usage.py               # Usage example
├── feature_columns.joblib         # Feature definitions (CRITICAL)
├── model_metadata.joblib          # Training metadata
└── [53 model files].joblib        # Trained models
```

## Quick Start

### Basic Usage

```python
from ml_service import PredictionService
import pandas as pd

# Initialize service
predictor = PredictionService()

# Prepare player history (from database)
player_history = pd.DataFrame({
    'player_id': ['player_id_123'] * 5,
    'season': [2025] * 5,
    'week': [1, 2, 3, 4, 5],
    'season_type': ['REG'] * 5,
    'team': ['Kansas City Chiefs'] * 5,
    'passing_yards': [285, 312, 298, 275, 320],
    'passing_tds': [2, 3, 2, 1, 3],
    'completions': [25, 28, 27, 24, 29],
    'attempts': [38, 42, 40, 36, 43],
    'passing_interceptions': [1, 0, 1, 2, 0],
    'rushing_yards': [15, 8, 12, 5, 18]
})

# Make prediction
result = predictor.predict_from_betting_scenario(
    player_name='Patrick Mahomes',
    position='QB',
    team='Kansas City Chiefs',
    action='Passing Yards',
    bet_type='over',
    action_amount=275.5,
    player_history=player_history,
    current_season=2025,
    current_week=6
)

# Access results
print(f"Win Probability: {result.win_probability:.1%}")
print(f"Predictions: {result.predictions}")
print(f"Recommendation: {result.recommendation}")
```

## Core Components

### 1. PredictionService

Main entry point for predictions.

**Key Methods:**
- `predict()` - Make a prediction with engineered features
- `predict_from_betting_scenario()` - Predict from frontend betting form
- `validate_position_stat_combination()` - Check if model exists

### 2. ModelLoader

Handles lazy loading and caching of models.

**Features:**
- Only loads models when needed
- Caches loaded models for reuse
- Validates model existence
- Manages feature column mappings

### 3. FeatureEngineer

Prepares features for inference.

**Capabilities:**
- Rolling averages (3-game and 5-game windows)
- Temporal features (season progression, playoff indicator)
- Team context features
- Feature alignment to model requirements

## Supported Positions and Stats

### Quarterback (QB)
- Completions
- Passing Yards
- Passing TDs
- Interceptions
- Rushing Yards

### Running Back (RB)
- Rushing Yards
- Rushing TDs
- Receptions
- Receiving Yards
- Receiving TDs

### Wide Receiver (WR)
- Receptions
- Receiving Yards
- Receiving TDs
- Targets

### Tight End (TE)
- Receptions
- Receiving Yards
- Receiving TDs

## Prediction Output

### PredictionResult Object

```python
@dataclass
class PredictionResult:
    position: str                    # Player position
    stat_name: str                   # Internal stat name
    stat_display_name: str           # Display name
    predictions: Dict[str, float]    # q10, q50, q90 predictions
    threshold: float                 # Betting threshold
    bet_type: str                    # 'over' or 'under'
    win_probability: float           # 0.0 to 1.0
    confidence_level: str            # 'Low', 'Medium', 'High'
    expected_value: float            # Expected value of bet
    recommendation: str              # 'Good Bet', 'Fair Bet', etc.
    details: Dict[str, Any]          # Additional analysis
```

### Example Output

```json
{
  "position": "QB",
  "stat_name": "passing_yards",
  "stat_display_name": "Passing Yards",
  "predictions": {
    "q10": 245.3,
    "q50": 289.7,
    "q90": 334.2
  },
  "threshold": 275.5,
  "bet_type": "over",
  "win_probability": 0.612,
  "confidence_level": "High",
  "expected_value": 0.224,
  "recommendation": "Good Bet"
}
```

## Integration with Django Views

### Example API Endpoint

```python
from django.http import JsonResponse
from ml_service import PredictionService
import pandas as pd

predictor = PredictionService()

@csrf_exempt
def predict_bet(request):
    data = json.loads(request.body)
    
    # Get player history from database
    player_history = get_player_history(
        player_name=data['player'],
        num_games=5
    )
    
    # Make prediction
    result = predictor.predict_from_betting_scenario(
        player_name=data['player'],
        position=data['position'],
        team=data['team'],
        action=data['action'],
        bet_type=data['betType'],
        action_amount=float(data['actionAmount']),
        player_history=player_history
    )
    
    # Return JSON response
    return JsonResponse({
        'success': True,
        'predictions': result.predictions,
        'win_probability': result.win_probability,
        'confidence': result.confidence_level,
        'recommendation': result.recommendation
    })
```

## Important Notes

### Data Requirements

1. **Player History Required**: Models need player's last 3-5 games for rolling features
2. **Feature Alignment Critical**: Features must match training data exactly
3. **Missing Data Handling**: Service provides defaults for missing features

### Performance Considerations

- First prediction loads models (~1-2s)
- Cached predictions are fast (~50-100ms)
- Models stay in memory until cache cleared
- Consider async processing for multiple predictions

### Limitations

- Trained on 2020-2024 data
- Requires current season data for accuracy
- No opponent-specific features (yet)
- Home/away indicator is placeholder (always 0)

## Error Handling

```python
from ml_service import PredictionService

predictor = PredictionService()

try:
    result = predictor.predict_from_betting_scenario(...)
except ValueError as e:
    # Invalid position/stat combination or bad inputs
    print(f"Validation error: {e}")
except FileNotFoundError as e:
    # Model file missing
    print(f"Model not found: {e}")
except RuntimeError as e:
    # Model loading or prediction failed
    print(f"Runtime error: {e}")
```

## Testing

Run the example:
```bash
python backend/ml_service/example_usage.py
```

## Support

For questions about model training or data, see:
- `MODELS_README.md` - Model documentation
- `model_metadata.joblib` - Training statistics
- `../machine_learning/training_code/model_training.ipynb` - Training notebook

