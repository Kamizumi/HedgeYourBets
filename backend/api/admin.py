"""
Django admin configuration for Player and Game Stats models.
Access at: http://localhost:8000/admin
"""

from django.contrib import admin
from .models import Player, PlayerGameStats, BettingScenario


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    """Admin interface for Player model."""
    
    list_display = ['display_name', 'position', 'current_team', 'status', 'game_count']
    list_filter = ['position', 'current_team', 'status']
    search_fields = ['display_name', 'short_name', 'player_id']
    ordering = ['display_name']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('player_id', 'display_name', 'short_name', 'first_name', 'last_name')
        }),
        ('Position & Team', {
            'fields': ('position', 'current_team', 'jersey_number', 'status')
        }),
        ('Additional Info', {
            'fields': ('headshot_url', 'rookie_season', 'last_season'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def game_count(self, obj):
        """Display number of games in database."""
        return obj.game_stats.count()
    game_count.short_description = 'Games'


@admin.register(PlayerGameStats)
class PlayerGameStatsAdmin(admin.ModelAdmin):
    """Admin interface for PlayerGameStats model."""
    
    list_display = ['player_display', 'season', 'week', 'season_type', 'team', 'key_stats']
    list_filter = ['season', 'season_type', 'player__position', 'team']
    search_fields = ['player__display_name', 'player__player_id']
    ordering = ['-season', '-week']
    
    fieldsets = (
        ('Game Info', {
            'fields': ('player', 'season', 'week', 'season_type', 'team', 'opponent_team')
        }),
        ('Passing Stats', {
            'fields': ('completions', 'attempts', 'passing_yards', 'passing_tds', 
                      'passing_interceptions', 'sacks_suffered', 'passing_epa'),
            'classes': ('collapse',)
        }),
        ('Rushing Stats', {
            'fields': ('carries', 'rushing_yards', 'rushing_tds', 'rushing_fumbles', 
                      'rushing_fumbles_lost', 'rushing_epa'),
            'classes': ('collapse',)
        }),
        ('Receiving Stats', {
            'fields': ('receptions', 'targets', 'receiving_yards', 'receiving_tds',
                      'receiving_fumbles', 'receiving_fumbles_lost', 'receiving_epa'),
            'classes': ('collapse',)
        }),
        ('Fantasy Points', {
            'fields': ('fantasy_points', 'fantasy_points_ppr'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def player_display(self, obj):
        """Display player name and position."""
        return f"{obj.player.display_name} ({obj.player.position})"
    player_display.short_description = 'Player'
    
    def key_stats(self, obj):
        """Display key stats based on position."""
        stats = obj.get_key_stats_by_position()
        if obj.player.position == 'QB':
            return f"{stats['passing_yards']} yds, {stats['passing_tds']} TDs"
        elif obj.player.position == 'RB':
            return f"{stats['rushing_yards']} rush, {stats['receptions']} rec"
        elif obj.player.position in ['WR', 'TE']:
            return f"{stats['receiving_yards']} yds, {stats['receptions']} rec"
        return ""
    key_stats.short_description = 'Key Stats'


@admin.register(BettingScenario)
class BettingScenarioAdmin(admin.ModelAdmin):
    """Admin interface for BettingScenario model."""
    
    list_display = ['player', 'team', 'action', 'bet_type', 'action_amount', 
                    'confidence_level', 'is_processed', 'created_at']
    list_filter = ['sport', 'bet_type', 'is_processed', 'confidence_level']
    search_fields = ['player', 'team']
    ordering = ['-created_at']
    
    readonly_fields = ['created_at']

