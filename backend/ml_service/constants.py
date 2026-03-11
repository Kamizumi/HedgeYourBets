"""
Constants and mappings for ML inference service.
"""

# Position-specific stat mappings
POSITION_STATS = {
    'QB': ['passing_yards', 'passing_tds', 'completions', 'passing_interceptions', 'rushing_yards'],
    'RB': ['rushing_yards', 'rushing_tds', 'receptions', 'receiving_yards', 'receiving_tds'],
    'WR': ['receiving_yards', 'receptions', 'receiving_tds', 'targets'],
    'TE': ['receiving_yards', 'receptions', 'receiving_tds']
}

# Action name mappings (frontend -> model stat name)
ACTION_TO_STAT = {
    'Passing Yards': 'passing_yards',
    'Passing Touchdowns': 'passing_tds',
    'Completions': 'completions',
    'Attempts': 'attempts',
    'Interceptions': 'passing_interceptions',
    'Rushing Yards': 'rushing_yards',
    'Rushing Touchdowns': 'rushing_tds',
    'Receiving Yards': 'receiving_yards',
    'Receiving Touchdowns': 'receiving_tds',
    'Receptions': 'receptions',
    'Targets': 'targets',
    'Touchdowns': 'touchdowns'  # Note: May need position-specific handling
}

# Stat to action name (reverse mapping)
STAT_TO_ACTION = {v: k for k, v in ACTION_TO_STAT.items()}

# Valid positions
VALID_POSITIONS = ['QB', 'RB', 'WR', 'TE']

# Model quantiles
QUANTILES = {
    'q10': 0.10,  # Pessimistic (10th percentile)
    'q50': 0.50,  # Median (50th percentile / most likely)
    'q90': 0.90   # Optimistic (90th percentile)
}

# Stat display names for better UX
STAT_DISPLAY_NAMES = {
    'passing_yards': 'Passing Yards',
    'passing_tds': 'Passing Touchdowns',
    'completions': 'Completions',
    'attempts': 'Attempts',
    'passing_interceptions': 'Interceptions',
    'rushing_yards': 'Rushing Yards',
    'rushing_tds': 'Rushing Touchdowns',
    'receiving_yards': 'Receiving Yards',
    'receiving_tds': 'Receiving Touchdowns',
    'receptions': 'Receptions',
    'targets': 'Targets'
}

# Model naming convention
def get_model_filename(position: str, stat: str, quantile: str) -> str:
    """
    Generate model filename based on position, stat, and quantile.
    
    Args:
        position: Player position (QB, RB, WR, TE)
        stat: Stat name (e.g., 'passing_yards')
        quantile: Quantile identifier (q10, q50, q90)
    
    Returns:
        Model filename (e.g., 'QB_passing_yards_q50.joblib')
    """
    return f"{position}_{stat}_{quantile}.joblib"

# Stat units for display
STAT_UNITS = {
    'passing_yards': 'yards',
    'passing_tds': 'TDs',
    'completions': 'completions',
    'attempts': 'attempts',
    'passing_interceptions': 'INTs',
    'rushing_yards': 'yards',
    'rushing_tds': 'TDs',
    'receiving_yards': 'yards',
    'receiving_tds': 'TDs',
    'receptions': 'receptions',
    'targets': 'targets'
}

