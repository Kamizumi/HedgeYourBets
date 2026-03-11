# Hedge Your Bets - AI-Powered Sports Betting Analysis

**Hedge Your Bets** is a web-based service designed to assist in sports betting by leveraging AI and machine learning models to analyze betting scenarios and provide insights on bet quality and value.

## 🎯 Project Overview

This application allows users to input football betting scenarios (currently supporting NFL teams and players) and uses pre-trained machine learning models to evaluate the potential value of their bets. The system uses quantile regression models trained on historical NFL player data to predict player performance with confidence intervals.

### Key Features

- **ML-Powered Predictions**: Uses LightGBM quantile regression models (q10, q50, q90) for accurate player performance predictions
- **Team Context Integration**: Incorporates team-level statistics (passing yards, rushing yards, receptions, targets) to improve prediction accuracy
- **Player Prop Analysis**: Supports predictions for:
  - **QB**: Passing Yards, Passing TDs, Completions, Passing Interceptions, Rushing Yards
  - **RB**: Rushing Yards, Rushing TDs, Receptions, Receiving Yards, Receiving TDs
  - **WR**: Receptions, Receiving Yards, Receiving TDs, Targets
  - **TE**: Receptions, Receiving Yards, Receiving TDs
- **Bet Analysis**: Provides win probability, confidence levels, expected value, and betting recommendations
- **Dynamic Data**: Real-time access to teams, players, and available betting actions

## 📁 Project Structure

```
hedge-your-bets/
├── frontend/                    # Next.js application
├── backend/                     # Django application
│   ├── api/                     # Django API app
│   │   ├── models.py           # Database models (Player, PlayerGameStats, BettingScenario)
│   │   ├── views.py            # API endpoints for data retrieval
│   │   ├── prediction_views.py # ML prediction endpoint
│   │   ├── data_access.py      # Data access layer (team stats, player history)
│   │   └── management/         # Django management commands
│   │       └── commands/
│   │           └── load_player_data.py  # Command to load player data from CSV
│   ├── ml_service/             # ML inference service
│   │   ├── prediction_service.py    # Main prediction orchestrator
│   │   ├── feature_engineering.py   # Feature preparation for models
│   │   ├── model_loader.py          # Lazy loading of ML models
│   │   └── *.joblib             # Trained ML models (56 models total)
│   └── hedge_bets/             # Django project settings
├── machine_learning/           # ML training code and datasets
│   ├── datasets/               # Training data (CSV files)
│   └── training_code/          # Model training notebooks
└── README.md
```

## Prerequisites

Before running the project, make sure you have:

- **Node.js** (version 16 or higher) - Download from [nodejs.org](https://nodejs.org/)
- **Python** (version 3.8 or higher) - Download from [python.org](https://python.org/)
- **npm** (comes with Node.js)
- **pip** (comes with Python)

### Windows PowerShell Setup

If you're using Windows PowerShell and encounter execution policy issues:

1. Open PowerShell as Administrator
2. Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Or use Command Prompt instead of PowerShell

## Setup Instructions

### Frontend (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the homepage.

5. Test the API endpoint at [http://localhost:3000/api/hello](http://localhost:3000/api/hello)

### Backend (Django)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   ```
   - On Windows: `venv\Scripts\activate`
   - On Mac/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Load player data (optional, if you have CSV data):
   ```bash
   python manage.py load_player_data path/to/player_data.csv
   ```
   Note: The application will work without data, but predictions require player game statistics.

6. Run the development server:
   ```bash
   python manage.py runserver
   ```

7. The Django server will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000)

8. Test the API endpoint at [http://127.0.0.1:8000/api/hello/](http://127.0.0.1:8000/api/hello/)

### Loading Player Data

The application requires player game statistics for predictions. To load data:

1. Prepare CSV files with player game statistics (see `machine_learning/datasets/` for format examples)
2. Run the management command:
   ```bash
   cd backend
   python manage.py load_player_data path/to/player_data.csv
   ```

The command will:
- Parse player and game statistics from CSV
- Create/update Player records
- Create PlayerGameStats records
- Handle team name standardization

### Running Tests

To run the test suite:

```bash
cd backend
python manage.py test api.tests
```

Tests cover:
- API endpoint validation
- Team stats calculation
- Player data retrieval
- Prediction pipeline

### Troubleshooting

- **Python not found**: Make sure Python is installed and added to your system PATH
- **npm commands fail**: Try using Command Prompt instead of PowerShell
- **Permission errors**: Run your terminal as Administrator
- **Model loading errors**: Ensure all `.joblib` model files are in `backend/ml_service/`
- **Database errors**: Run `python manage.py migrate` to ensure database schema is up to date
- **No predictions available**: Load player data using `load_player_data` command

## API Endpoints

### Django Backend API

All endpoints are prefixed with `/api/`

#### Prediction Endpoints
- **POST** `/api/predict-bet/` - Get ML-powered betting prediction
  - Request body:
    ```json
    {
      "player": "Patrick Mahomes",
      "action": "Passing Yards",
      "bet_type": "over",
      "action_amount": 275.5,
      "bet_amount": 100.00
    }
    ```
  - Returns: Prediction with quantiles (q10, q50, q90), win probability, confidence level, expected value, and recommendation

#### Data Retrieval Endpoints
- **GET** `/api/teams/` - Get list of all NFL teams
- **GET** `/api/players/` - Get players by team
  - Query params: `?team=KC` (team abbreviation)
- **GET** `/api/actions/` - Get available betting actions for a position
  - Query params: `?position=QB` (QB, RB, WR, or TE)

#### Betting Scenario Endpoints
- **POST** `/api/betting-scenarios/` - Create a betting scenario
- **GET** `/api/betting-scenarios/list/` - List all betting scenarios

#### Utility Endpoints
- **GET** `/api/hello/` - Health check endpoint

### Next.js Frontend API
- **GET** `/api/hello` - Returns a simple JSON response with team information

## Technology Stack

### Backend
- **Django** - Web framework
- **SQLite** - Database (can be configured for PostgreSQL in production)
- **LightGBM** - Machine learning models (quantile regression)
- **pandas** - Data manipulation
- **scikit-learn** - Model utilities

### Frontend
- **Next.js** - React framework
- **React** - UI library

### ML/AI
- **LightGBM** - Gradient boosting framework for quantile regression
- **56 trained models** - Covering all position-stat combinations (QB, RB, WR, TE × various stats × 3 quantiles)

## Key Features Implementation

### Team Stats Integration
The prediction system now incorporates team-level statistics to improve accuracy:
- Calculates team passing yards, rushing yards, receptions, and targets for each game week
- Automatically falls back to most recent available week if predicting for future weeks
- Uses team context features in ML models for more accurate predictions

### Feature Engineering
- **Rolling averages**: 3-game and 5-game rolling averages for key statistics
- **Temporal features**: Season progression, playoff indicators
- **Team context**: Team-level statistics for passing, rushing, receiving
- **Feature alignment**: Automatic alignment with model requirements

## Team Members

- Tony Gonzalez
- Jason Mar
- Michael Castillo
- Timothy Tsang

## Requirements

- **Node.js** (version 16 or higher) - for Next.js
- **Python** (version 3.8 or higher) - for Django
- **npm** or **yarn** - for package management
- **pip** - for Python packages