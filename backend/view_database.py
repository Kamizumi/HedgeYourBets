"""
Simple script to view database contents.
Usage: python view_database.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hedge_bets.settings')
django.setup()

from api.models import Player, PlayerGameStats
from api.data_access import get_database_stats

print("="*70)
print("DATABASE VIEWER")
print("="*70)

# Overall stats
stats = get_database_stats()
print(f"\nTotal Players: {stats['total_players']}")
for pos, count in stats['players_by_position'].items():
    print(f"  {pos}: {count}")

print(f"\nTotal Game Records: {stats['total_game_records']}")
print(f"Available Seasons: {stats['available_seasons']}")

# Show sample players by team
print("\n" + "-"*70)
print("SAMPLE PLAYERS BY TEAM")
print("-"*70)

teams = ['KC', 'BUF', 'SF', 'PHI', 'DAL']
for team in teams:
    players = Player.objects.filter(current_team=team, position__in=['QB', 'RB', 'WR', 'TE'])[:5]
    if players:
        print(f"\n{team}:")
        for player in players:
            game_count = player.game_stats.count()
            print(f"  {player.display_name} ({player.position}) - {game_count} games")

# Show players with most games
print("\n" + "-"*70)
print("PLAYERS WITH MOST GAMES (Top 10)")
print("-"*70)

from django.db.models import Count
players_with_games = Player.objects.annotate(
    num_games=Count('game_stats')
).filter(num_games__gt=0).order_by('-num_games')[:10]

for player in players_with_games:
    print(f"{player.display_name} ({player.position}, {player.current_team}): {player.num_games} games")

# Show recent games
print("\n" + "-"*70)
print("RECENT GAMES (Last 10)")
print("-"*70)

recent_games = PlayerGameStats.objects.select_related('player').order_by(
    '-season', '-week'
)[:10]

for game in recent_games:
    stats = game.get_key_stats_by_position()
    stats_str = ', '.join([f"{k}: {v}" for k, v in list(stats.items())[:3]])
    print(f"{game.player.display_name} - Week {game.week}, {game.season}: {stats_str}")

print("\n" + "="*70)

