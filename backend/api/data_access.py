"""
Data access layer for querying players and game stats.
Provides convenient functions for ML inference and API views.
"""

import pandas as pd
from typing import List, Optional, Dict
from django.db.models import Q, Count, Sum, Avg
from .models import Player, PlayerGameStats
from .constants import standardize_team_name


def get_player_by_name(name: str) -> Optional[Player]:
    """
    Get a player by exact display name match.
    
    Args:
        name: Player's display name (e.g., "Patrick Mahomes")
    
    Returns:
        Player object or None if not found
    """
    try:
        return Player.objects.get(display_name__iexact=name)
    except Player.DoesNotExist:
        return None
    except Player.MultipleObjectsReturned:
        # If multiple matches, return the first one
        return Player.objects.filter(display_name__iexact=name).first()


def get_player_by_id(player_id: str) -> Optional[Player]:
    """
    Get a player by their player_id.
    
    Args:
        player_id: NFL GSIS ID (e.g., "00-0023459")
    
    Returns:
        Player object or None if not found
    """
    try:
        return Player.objects.get(player_id=player_id)
    except Player.DoesNotExist:
        return None


def search_players(
    query: str,
    position: Optional[str] = None,
    team: Optional[str] = None,
    limit: int = 20
) -> List[Player]:
    """
    Search for players by name (fuzzy matching).
    
    Args:
        query: Search query (partial name)
        position: Optional position filter (QB, RB, WR, TE)
        team: Optional team filter (abbreviation)
        limit: Maximum number of results
    
    Returns:
        List of matching Player objects
    """
    # Build query
    q = Q(display_name__icontains=query) | Q(short_name__icontains=query)
    
    if position:
        q &= Q(position=position)
    
    if team:
        team_abb = standardize_team_name(team)
        q &= Q(current_team=team_abb)
    
    return list(Player.objects.filter(q)[:limit])


def get_players_by_team(team: str, position: Optional[str] = None) -> List[Player]:
    """
    Get all players for a specific team.
    
    Args:
        team: Team abbreviation or full name
        position: Optional position filter
    
    Returns:
        List of Player objects
    """
    team_abb = standardize_team_name(team)
    
    q = Q(current_team=team_abb)
    if position:
        q &= Q(position=position)
    
    return list(Player.objects.filter(q).order_by('display_name'))


def get_player_recent_games(
    player: Player,
    num_games: int = 5,
    season_type: str = 'REG'
) -> pd.DataFrame:
    """
    Get a player's most recent games as a DataFrame for ML inference.
    
    Args:
        player: Player object
        num_games: Number of recent games to retrieve
        season_type: 'REG' for regular season, 'POST' for playoffs
    
    Returns:
        DataFrame with game stats (compatible with ML models)
    """
    # Query recent games
    games = PlayerGameStats.objects.filter(
        player=player,
        season_type=season_type
    ).order_by('-season', '-week')[:num_games]
    
    # Convert to list of dicts
    games_data = []
    for game in games:
        games_data.append({
            'player_id': game.player.player_id,
            'season': game.season,
            'week': game.week,
            'season_type': game.season_type,
            'team': game.team,
            'opponent_team': game.opponent_team,
            
            # Passing stats
            'completions': game.completions or 0,
            'attempts': game.attempts or 0,
            'passing_yards': game.passing_yards or 0,
            'passing_tds': game.passing_tds or 0,
            'passing_interceptions': game.passing_interceptions or 0,
            
            # Rushing stats
            'carries': game.carries or 0,
            'rushing_yards': game.rushing_yards or 0,
            'rushing_tds': game.rushing_tds or 0,
            
            # Receiving stats
            'receptions': game.receptions or 0,
            'targets': game.targets or 0,
            'receiving_yards': game.receiving_yards or 0,
            'receiving_tds': game.receiving_tds or 0,
        })
    
    # Convert to DataFrame (reverse so oldest is first for rolling features)
    df = pd.DataFrame(games_data[::-1])
    
    return df


def get_player_season_stats(
    player: Player,
    season: int,
    season_type: str = 'REG'
) -> pd.DataFrame:
    """
    Get all games for a player in a specific season.
    
    Args:
        player: Player object
        season: Season year (e.g., 2025)
        season_type: 'REG' or 'POST'
    
    Returns:
        DataFrame with game stats
    """
    games = PlayerGameStats.objects.filter(
        player=player,
        season=season,
        season_type=season_type
    ).order_by('week')
    
    # Convert to DataFrame (same format as get_player_recent_games)
    games_data = []
    for game in games:
        games_data.append({
            'player_id': game.player.player_id,
            'season': game.season,
            'week': game.week,
            'season_type': game.season_type,
            'team': game.team,
            'opponent_team': game.opponent_team,
            'completions': game.completions or 0,
            'attempts': game.attempts or 0,
            'passing_yards': game.passing_yards or 0,
            'passing_tds': game.passing_tds or 0,
            'passing_interceptions': game.passing_interceptions or 0,
            'carries': game.carries or 0,
            'rushing_yards': game.rushing_yards or 0,
            'rushing_tds': game.rushing_tds or 0,
            'receptions': game.receptions or 0,
            'targets': game.targets or 0,
            'receiving_yards': game.receiving_yards or 0,
            'receiving_tds': game.receiving_tds or 0,
        })
    
    return pd.DataFrame(games_data)


def player_has_sufficient_history(
    player: Player,
    min_games: int = 3,
    season_type: str = 'REG'
) -> bool:
    """
    Check if player has enough game history for ML predictions.
    
    Args:
        player: Player object
        min_games: Minimum number of games required
        season_type: Season type to check
    
    Returns:
        True if player has enough games, False otherwise
    """
    game_count = PlayerGameStats.objects.filter(
        player=player,
        season_type=season_type
    ).count()
    
    return game_count >= min_games


def get_available_seasons() -> List[int]:
    """
    Get list of available seasons in the database.
    
    Returns:
        List of season years (descending order)
    """
    seasons = PlayerGameStats.objects.values_list(
        'season', flat=True
    ).distinct().order_by('-season')
    
    return list(seasons)


def get_team_stats_summary(team: str, season: int) -> Dict:
    """
    Get summary statistics for a team in a season.
    
    Args:
        team: Team abbreviation
        season: Season year
    
    Returns:
        Dictionary with team stats summary
    """
    team_abb = standardize_team_name(team)
    
    # Get all games for this team/season
    games = PlayerGameStats.objects.filter(
        team=team_abb,
        season=season,
        season_type='REG'
    )
    
    total_games = games.count()
    
    if total_games == 0:
        return {
            'team': team_abb,
            'season': season,
            'total_games': 0,
        }
    
    # Aggregate stats
    stats = games.aggregate(
        total_passing_yards=Sum('passing_yards'),
        avg_passing_yards=Avg('passing_yards'),
        total_rushing_yards=Sum('rushing_yards'),
        avg_rushing_yards=Avg('rushing_yards'),
        total_receptions=Sum('receptions'),
        avg_receptions=Avg('receptions'),
        total_targets=Sum('targets'),
        avg_targets=Avg('targets'),
    )
    
    return {
        'team': team_abb,
        'season': season,
        'total_games': total_games,
        **stats
    }


def get_team_stats_for_week(team: str, season: int, week: int) -> Optional[Dict[str, float]]:
    """
    Get team statistics for a specific game week.
    This will be used for predictions.
    
    Args:
        team: Team abbreviation or full name
        season: Season year
        week: Week number
    
    Returns:
        Dictionary with team stats for that week:
        {
            'team_passing_yards': float,
            'team_rushing_yards': float,
            'team_receptions': float,
            'team_targets': float
        }
        Returns None if no data is available (caller should use defaults)
    """
    import logging
    logger = logging.getLogger(__name__)
    
    team_abb = standardize_team_name(team)
    
    # First, try to get stats for the requested week
    games = PlayerGameStats.objects.filter(
        team=team_abb,
        season=season,
        week=week,
        season_type='REG'
    )
    
    # If no games found for requested week, fallback to most recent week
    if games.count() == 0:
        # Find the most recent week with data for this team/season
        latest_game = PlayerGameStats.objects.filter(
            team=team_abb,
            season=season,
            season_type='REG'
        ).order_by('-week').first()
        
        if latest_game:
            # Use the most recent week's data
            actual_week = latest_game.week
            if actual_week != week:
                logger.warning(
                    f"No data for {team_abb} in {season} Week {week}. "
                    f"Using Week {actual_week} stats instead."
                )
            games = PlayerGameStats.objects.filter(
                team=team_abb,
                season=season,
                week=actual_week,
                season_type='REG'
            )
        else:
            # No data at all for this team/season
            logger.warning(
                f"No game data found for {team_abb} in {season}. "
                f"Team stats will use defaults."
            )
            return None
    
    # Aggregate stats for all players on the team for this week
    # Sum treats NULL values as 0, which is what we want
    stats = games.aggregate(
        team_passing_yards=Sum('passing_yards'),
        team_rushing_yards=Sum('rushing_yards'),
        team_receptions=Sum('receptions'),
        team_targets=Sum('targets'),
    )
    
    # Convert to float and ensure all values are present (handle None from Sum)
    result = {
        'team_passing_yards': float(stats.get('team_passing_yards') or 0.0),
        'team_rushing_yards': float(stats.get('team_rushing_yards') or 0.0),
        'team_receptions': float(stats.get('team_receptions') or 0.0),
        'team_targets': float(stats.get('team_targets') or 0.0),
    }
    
    return result


def get_database_stats() -> Dict:
    """
    Get overall database statistics.
    
    Returns:
        Dictionary with database stats
    """
    return {
        'total_players': Player.objects.count(),
        'players_by_position': {
            'QB': Player.objects.filter(position='QB').count(),
            'RB': Player.objects.filter(position='RB').count(),
            'WR': Player.objects.filter(position='WR').count(),
            'TE': Player.objects.filter(position='TE').count(),
        },
        'total_game_records': PlayerGameStats.objects.count(),
        'available_seasons': get_available_seasons(),
    }

