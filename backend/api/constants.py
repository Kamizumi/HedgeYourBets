"""
Constants and mappings for the API.
"""

# Team abbreviation to full name mapping
TEAM_ABBREVIATIONS = {
    'ARI': 'Arizona Cardinals',
    'ATL': 'Atlanta Falcons',
    'BAL': 'Baltimore Ravens',
    'BUF': 'Buffalo Bills',
    'CAR': 'Carolina Panthers',
    'CHI': 'Chicago Bears',
    'CIN': 'Cincinnati Bengals',
    'CLE': 'Cleveland Browns',
    'DAL': 'Dallas Cowboys',
    'DEN': 'Denver Broncos',
    'DET': 'Detroit Lions',
    'GB': 'Green Bay Packers',
    'HOU': 'Houston Texans',
    'IND': 'Indianapolis Colts',
    'JAX': 'Jacksonville Jaguars',
    'KC': 'Kansas City Chiefs',
    'LA': 'Los Angeles Rams',
    'LAC': 'Los Angeles Chargers',
    'LV': 'Las Vegas Raiders',
    'MIA': 'Miami Dolphins',
    'MIN': 'Minnesota Vikings',
    'NE': 'New England Patriots',
    'NO': 'New Orleans Saints',
    'NYG': 'New York Giants',
    'NYJ': 'New York Jets',
    'PHI': 'Philadelphia Eagles',
    'PIT': 'Pittsburgh Steelers',
    'SEA': 'Seattle Seahawks',
    'SF': 'San Francisco 49ers',
    'TB': 'Tampa Bay Buccaneers',
    'TEN': 'Tennessee Titans',
    'WAS': 'Washington Commanders',
}

# Reverse mapping: full name to abbreviation
TEAM_NAMES_TO_ABB = {v: k for k, v in TEAM_ABBREVIATIONS.items()}

# Alternative/old team names
TEAM_NAME_ALIASES = {
    'Washington Football Team': 'WAS',
    'Washington Redskins': 'WAS',
    'Oakland Raiders': 'LV',
    'San Diego Chargers': 'LAC',
    'St. Louis Rams': 'LA',
}

def get_team_full_name(abbreviation):
    """Get full team name from abbreviation."""
    return TEAM_ABBREVIATIONS.get(abbreviation, abbreviation)

def get_team_abbreviation(full_name):
    """Get team abbreviation from full name (supports aliases)."""
    # Try direct match
    if full_name in TEAM_NAMES_TO_ABB:
        return TEAM_NAMES_TO_ABB[full_name]
    
    # Try aliases
    if full_name in TEAM_NAME_ALIASES:
        return TEAM_NAME_ALIASES[full_name]
    
    # Return as-is if not found
    return full_name

def standardize_team_name(team_name):
    """
    Standardize team name to abbreviation.
    Handles both full names and abbreviations.
    """
    # If already an abbreviation, return it
    if team_name in TEAM_ABBREVIATIONS:
        return team_name
    
    # Otherwise try to get abbreviation
    return get_team_abbreviation(team_name)

