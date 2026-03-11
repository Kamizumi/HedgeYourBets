"""
Django management command to load player and game stats from CSV files.

Usage:
    python manage.py load_player_data
    python manage.py load_player_data --years 2024 2025
    python manage.py load_player_data --skip-players
"""

import os
import pandas as pd
from pathlib import Path
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import Player, PlayerGameStats
from api.constants import standardize_team_name


class Command(BaseCommand):
    help = 'Load player data and game stats from CSV files'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--years',
            nargs='+',
            type=int,
            help='Specific years to import (e.g., --years 2024 2025)',
        )
        parser.add_argument(
            '--skip-players',
            action='store_true',
            help='Skip loading players.csv (only load game stats)',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before importing',
        )
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=' * 70))
        self.stdout.write(self.style.SUCCESS('LOADING NFL PLAYER DATA'))
        self.stdout.write(self.style.SUCCESS('=' * 70))
        
        # Get paths
        base_dir = Path(__file__).parent.parent.parent.parent.parent
        datasets_dir = base_dir / "machine_learning" / "datasets"
        players_file = datasets_dir / "players.csv"
        stats_dir = datasets_dir / "player_weekly_stats"
        
        # Check if directories exist
        if not datasets_dir.exists():
            self.stdout.write(self.style.ERROR(f"Datasets directory not found: {datasets_dir}"))
            return
        
        # Clear existing data if requested
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            PlayerGameStats.objects.all().delete()
            Player.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing data cleared'))
        
        # Load players
        if not options['skip_players']:
            self.load_players(players_file)
        else:
            self.stdout.write(self.style.WARNING('Skipping players.csv'))
        
        # Load game stats
        years = options.get('years') or range(2019, 2026)  # 2019-2025
        self.load_game_stats(stats_dir, years)
        
        # Print summary
        self.print_summary()
        
        self.stdout.write(self.style.SUCCESS('\\n' + '=' * 70))
        self.stdout.write(self.style.SUCCESS('DATA LOADING COMPLETE!'))
        self.stdout.write(self.style.SUCCESS('=' * 70))
    
    def load_players(self, players_file):
        """Load players from players.csv."""
        self.stdout.write(self.style.WARNING(f'\\nLoading players from: {players_file}'))
        
        if not players_file.exists():
            self.stdout.write(self.style.ERROR(f'Players file not found: {players_file}'))
            return
        
        # Read CSV
        df = pd.read_csv(players_file)
        self.stdout.write(f'Found {len(df)} total players in CSV')
        
        # Filter for positions we need (QB, RB, WR, TE)
        model_positions = ['QB', 'RB', 'WR', 'TE']
        df = df[df['position'].isin(model_positions)]
        self.stdout.write(f'Filtered to {len(df)} players (QB/RB/WR/TE only)')
        
        # Import players
        created_count = 0
        updated_count = 0
        skipped_count = 0
        
        for index, row in df.iterrows():
            try:
                player_id = row['gsis_id']
                
                # Skip if no player_id
                if pd.isna(player_id):
                    skipped_count += 1
                    continue
                
                # Prepare player data
                player_data = {
                    'display_name': row.get('display_name', ''),
                    'short_name': row.get('short_name') if pd.notna(row.get('short_name')) else None,
                    'first_name': row.get('first_name', ''),
                    'last_name': row.get('last_name', ''),
                    'position': row['position'],
                    'current_team': row.get('latest_team') if pd.notna(row.get('latest_team')) else None,
                    'jersey_number': int(row['jersey_number']) if pd.notna(row.get('jersey_number')) else None,
                    'status': self.map_status(row.get('status')),
                    'headshot_url': row.get('headshot') if pd.notna(row.get('headshot')) else None,
                    'rookie_season': int(row['rookie_season']) if pd.notna(row.get('rookie_season')) else None,
                    'last_season': int(row['last_season']) if pd.notna(row.get('last_season')) else None,
                }
                
                # Create or update player
                player, created = Player.objects.update_or_create(
                    player_id=player_id,
                    defaults=player_data
                )
                
                if created:
                    created_count += 1
                else:
                    updated_count += 1
                
                # Progress indicator
                if (index + 1) % 100 == 0:
                    self.stdout.write(f'  Processed {index + 1}/{len(df)} players...', ending='\\r')
            
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'\\nError processing player {row.get("display_name")}: {e}'))
                skipped_count += 1
                continue
        
        self.stdout.write(f'\\n{self.style.SUCCESS("Players imported successfully!")}')
        self.stdout.write(f'  Created: {created_count}')
        self.stdout.write(f'  Updated: {updated_count}')
        self.stdout.write(f'  Skipped: {skipped_count}')
    
    def load_game_stats(self, stats_dir, years):
        """Load game stats from weekly CSV files."""
        self.stdout.write(self.style.WARNING(f'\\nLoading game stats for years: {list(years)}'))
        
        model_positions = ['QB', 'RB', 'WR', 'TE']
        total_created = 0
        total_updated = 0
        total_skipped = 0
        
        for year in years:
            stats_file = stats_dir / f"stats_player_week_{year}.csv"
            
            if not stats_file.exists():
                self.stdout.write(self.style.WARNING(f'  Skipping {year}: File not found'))
                continue
            
            self.stdout.write(f'\\n  Loading {year}...')
            
            # Read CSV
            df = pd.read_csv(stats_file)
            
            # Filter for positions we need
            df = df[df['position'].isin(model_positions)]
            self.stdout.write(f'    Found {len(df)} records for QB/RB/WR/TE')
            
            # Process each game
            created_count = 0
            updated_count = 0
            skipped_count = 0
            
            for index, row in df.iterrows():
                try:
                    player_id = row['player_id']
                    
                    # Skip if no player_id
                    if pd.isna(player_id):
                        skipped_count += 1
                        continue
                    
                    # Try to get player from database
                    try:
                        player = Player.objects.get(player_id=player_id)
                    except Player.DoesNotExist:
                        # Player not in database (not QB/RB/WR/TE or not in players.csv)
                        skipped_count += 1
                        continue
                    
                    # Prepare game stats data
                    stats_data = {
                        'season': int(row['season']),
                        'week': int(row['week']),
                        'season_type': row['season_type'],
                        'team': standardize_team_name(row['team']) if pd.notna(row['team']) else '',
                        'opponent_team': standardize_team_name(row['opponent_team']) if pd.notna(row['opponent_team']) else '',
                        
                        # Passing stats
                        'completions': self.safe_int(row.get('completions')),
                        'attempts': self.safe_int(row.get('attempts')),
                        'passing_yards': self.safe_int(row.get('passing_yards')),
                        'passing_tds': self.safe_int(row.get('passing_tds')),
                        'passing_interceptions': self.safe_int(row.get('passing_interceptions')),
                        'sacks_suffered': self.safe_int(row.get('sacks_suffered')),
                        'passing_epa': self.safe_float(row.get('passing_epa')),
                        'passing_2pt_conversions': self.safe_int(row.get('passing_2pt_conversions')),
                        
                        # Rushing stats
                        'carries': self.safe_int(row.get('carries')),
                        'rushing_yards': self.safe_int(row.get('rushing_yards')),
                        'rushing_tds': self.safe_int(row.get('rushing_tds')),
                        'rushing_fumbles': self.safe_int(row.get('rushing_fumbles')),
                        'rushing_fumbles_lost': self.safe_int(row.get('rushing_fumbles_lost')),
                        'rushing_first_downs': self.safe_int(row.get('rushing_first_downs')),
                        'rushing_epa': self.safe_float(row.get('rushing_epa')),
                        'rushing_2pt_conversions': self.safe_int(row.get('rushing_2pt_conversions')),
                        
                        # Receiving stats
                        'receptions': self.safe_int(row.get('receptions')),
                        'targets': self.safe_int(row.get('targets')),
                        'receiving_yards': self.safe_int(row.get('receiving_yards')),
                        'receiving_tds': self.safe_int(row.get('receiving_tds')),
                        'receiving_fumbles': self.safe_int(row.get('receiving_fumbles')),
                        'receiving_fumbles_lost': self.safe_int(row.get('receiving_fumbles_lost')),
                        'receiving_first_downs': self.safe_int(row.get('receiving_first_downs')),
                        'receiving_epa': self.safe_float(row.get('receiving_epa')),
                        'receiving_2pt_conversions': self.safe_int(row.get('receiving_2pt_conversions')),
                        'receiving_air_yards': self.safe_int(row.get('receiving_air_yards')),
                        'receiving_yards_after_catch': self.safe_int(row.get('receiving_yards_after_catch')),
                        
                        # Fantasy points
                        'fantasy_points': self.safe_float(row.get('fantasy_points')),
                        'fantasy_points_ppr': self.safe_float(row.get('fantasy_points_ppr')),
                    }
                    
                    # Create or update game stats
                    game_stats, created = PlayerGameStats.objects.update_or_create(
                        player=player,
                        season=stats_data['season'],
                        week=stats_data['week'],
                        season_type=stats_data['season_type'],
                        defaults=stats_data
                    )
                    
                    if created:
                        created_count += 1
                    else:
                        updated_count += 1
                    
                    # Progress indicator
                    if (index + 1) % 200 == 0:
                        self.stdout.write(f'      Processed {index + 1}/{len(df)} records...', ending='\\r')
                
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'\\n      Error processing record: {e}'))
                    skipped_count += 1
                    continue
            
            self.stdout.write(f'\\n    {year}: Created {created_count}, Updated {updated_count}, Skipped {skipped_count}')
            total_created += created_count
            total_updated += updated_count
            total_skipped += skipped_count
        
        self.stdout.write(f'\\n{self.style.SUCCESS("Game stats imported successfully!")}')
        self.stdout.write(f'  Total Created: {total_created}')
        self.stdout.write(f'  Total Updated: {total_updated}')
        self.stdout.write(f'  Total Skipped: {total_skipped}')
    
    def print_summary(self):
        """Print database summary."""
        self.stdout.write(self.style.WARNING('\\nDatabase Summary:'))
        
        total_players = Player.objects.count()
        self.stdout.write(f'  Total Players: {total_players}')
        
        for position in ['QB', 'RB', 'WR', 'TE']:
            count = Player.objects.filter(position=position).count()
            self.stdout.write(f'    {position}: {count} players')
        
        total_games = PlayerGameStats.objects.count()
        self.stdout.write(f'  Total Game Records: {total_games}')
        
        # Games by year
        from django.db.models import Count
        games_by_year = PlayerGameStats.objects.values('season').annotate(
            count=Count('id')
        ).order_by('season')
        
        for year_data in games_by_year:
            self.stdout.write(f'    {year_data["season"]}: {year_data["count"]} games')
    
    @staticmethod
    def safe_int(value):
        """Safely convert to int, return 0 if NaN or None."""
        if pd.isna(value):
            return 0
        try:
            return int(value)
        except (ValueError, TypeError):
            return 0
    
    @staticmethod
    def safe_float(value):
        """Safely convert to float, return None if NaN."""
        if pd.isna(value):
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None
    
    @staticmethod
    def map_status(status_str):
        """Map status string to our choices."""
        if pd.isna(status_str):
            return 'UNK'
        
        status_map = {
            'ACT': 'ACT',
            'CUT': 'CUT',
            'DEV': 'DEV',
            'RES': 'RES',
            'RET': 'RET',
        }
        
        return status_map.get(status_str, 'UNK')

