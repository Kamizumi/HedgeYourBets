from django.db import models
from django.utils import timezone


class Player(models.Model):
    """Model to store NFL player information."""
    
    POSITION_CHOICES = [
        ('QB', 'Quarterback'),
        ('RB', 'Running Back'),
        ('WR', 'Wide Receiver'),
        ('TE', 'Tight End'),
    ]
    
    STATUS_CHOICES = [
        ('ACT', 'Active'),
        ('CUT', 'Cut'),
        ('DEV', 'Development'),
        ('RES', 'Reserved'),
        ('RET', 'Retired'),
        ('UNK', 'Unknown'),
    ]
    
    # Primary identifier from NFL data
    player_id = models.CharField(
        max_length=50,
        primary_key=True,
        help_text="NFL GSIS ID (e.g., '00-0023459')"
    )
    
    # Player names
    display_name = models.CharField(
        max_length=100,
        db_index=True,
        help_text="Full display name (e.g., 'Patrick Mahomes')"
    )
    
    short_name = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Short name (e.g., 'P.Mahomes')"
    )
    
    first_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50, blank=True)
    
    # Position and team info
    position = models.CharField(
        max_length=10,
        choices=POSITION_CHOICES,
        db_index=True,
        help_text="Player position (QB, RB, WR, TE)"
    )
    
    current_team = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        db_index=True,
        help_text="Current team abbreviation (e.g., 'KC')"
    )
    
    jersey_number = models.IntegerField(
        null=True,
        blank=True,
        help_text="Jersey number"
    )
    
    # Additional info
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='UNK',
        help_text="Player status"
    )
    
    headshot_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="URL to player headshot image"
    )
    
    # Metadata
    rookie_season = models.IntegerField(null=True, blank=True)
    last_season = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['display_name']
        verbose_name = "Player"
        verbose_name_plural = "Players"
        indexes = [
            models.Index(fields=['display_name']),
            models.Index(fields=['position', 'current_team']),
        ]
    
    def __str__(self):
        return f"{self.display_name} ({self.position} - {self.current_team or 'FA'})"
    
    def get_recent_games(self, num_games=5):
        """Get player's most recent games."""
        return self.game_stats.order_by('-season', '-week')[:num_games]


class PlayerGameStats(models.Model):
    """Model to store player statistics for each game."""
    
    SEASON_TYPE_CHOICES = [
        ('REG', 'Regular Season'),
        ('POST', 'Playoffs'),
        ('PRE', 'Preseason'),
    ]
    
    # Foreign key to player
    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name='game_stats',
        help_text="Player this stat line belongs to"
    )
    
    # Game identifiers
    season = models.IntegerField(
        db_index=True,
        help_text="Season year (e.g., 2025)"
    )
    
    week = models.IntegerField(
        db_index=True,
        help_text="Week number (1-18 for regular season)"
    )
    
    season_type = models.CharField(
        max_length=10,
        choices=SEASON_TYPE_CHOICES,
        default='REG',
        help_text="Type of game"
    )
    
    team = models.CharField(
        max_length=10,
        db_index=True,
        help_text="Team abbreviation (e.g., 'KC')"
    )
    
    opponent_team = models.CharField(
        max_length=10,
        help_text="Opponent team abbreviation"
    )
    
    # Passing stats (primarily for QB)
    completions = models.IntegerField(default=0, null=True, blank=True)
    attempts = models.IntegerField(default=0, null=True, blank=True)
    passing_yards = models.IntegerField(default=0, null=True, blank=True)
    passing_tds = models.IntegerField(default=0, null=True, blank=True)
    passing_interceptions = models.IntegerField(default=0, null=True, blank=True)
    sacks_suffered = models.IntegerField(default=0, null=True, blank=True)
    passing_epa = models.FloatField(null=True, blank=True, help_text="Expected Points Added")
    passing_2pt_conversions = models.IntegerField(default=0, null=True, blank=True)
    
    # Rushing stats (QB, RB, WR, TE)
    carries = models.IntegerField(default=0, null=True, blank=True)
    rushing_yards = models.IntegerField(default=0, null=True, blank=True)
    rushing_tds = models.IntegerField(default=0, null=True, blank=True)
    rushing_fumbles = models.IntegerField(default=0, null=True, blank=True)
    rushing_fumbles_lost = models.IntegerField(default=0, null=True, blank=True)
    rushing_first_downs = models.IntegerField(default=0, null=True, blank=True)
    rushing_epa = models.FloatField(null=True, blank=True)
    rushing_2pt_conversions = models.IntegerField(default=0, null=True, blank=True)
    
    # Receiving stats (RB, WR, TE)
    receptions = models.IntegerField(default=0, null=True, blank=True)
    targets = models.IntegerField(default=0, null=True, blank=True)
    receiving_yards = models.IntegerField(default=0, null=True, blank=True)
    receiving_tds = models.IntegerField(default=0, null=True, blank=True)
    receiving_fumbles = models.IntegerField(default=0, null=True, blank=True)
    receiving_fumbles_lost = models.IntegerField(default=0, null=True, blank=True)
    receiving_first_downs = models.IntegerField(default=0, null=True, blank=True)
    receiving_epa = models.FloatField(null=True, blank=True)
    receiving_2pt_conversions = models.IntegerField(default=0, null=True, blank=True)
    receiving_air_yards = models.IntegerField(default=0, null=True, blank=True)
    receiving_yards_after_catch = models.IntegerField(default=0, null=True, blank=True)
    
    # Fantasy points (useful for validation)
    fantasy_points = models.FloatField(null=True, blank=True)
    fantasy_points_ppr = models.FloatField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-season', '-week']
        verbose_name = "Player Game Stats"
        verbose_name_plural = "Player Game Stats"
        unique_together = [['player', 'season', 'week', 'season_type']]
        indexes = [
            models.Index(fields=['player', '-season', '-week']),
            models.Index(fields=['season', 'week']),
            models.Index(fields=['team', 'season', 'week']),
        ]
    
    def __str__(self):
        return f"{self.player.display_name} - Week {self.week} {self.season} ({self.season_type})"
    
    def get_key_stats_by_position(self):
        """Return key stats based on player position."""
        position = self.player.position
        
        if position == 'QB':
            return {
                'passing_yards': self.passing_yards or 0,
                'passing_tds': self.passing_tds or 0,
                'completions': self.completions or 0,
                'interceptions': self.passing_interceptions or 0,
                'rushing_yards': self.rushing_yards or 0,
            }
        elif position == 'RB':
            return {
                'rushing_yards': self.rushing_yards or 0,
                'rushing_tds': self.rushing_tds or 0,
                'receptions': self.receptions or 0,
                'receiving_yards': self.receiving_yards or 0,
                'receiving_tds': self.receiving_tds or 0,
            }
        elif position == 'WR':
            return {
                'receptions': self.receptions or 0,
                'targets': self.targets or 0,
                'receiving_yards': self.receiving_yards or 0,
                'receiving_tds': self.receiving_tds or 0,
            }
        elif position == 'TE':
            return {
                'receptions': self.receptions or 0,
                'receiving_yards': self.receiving_yards or 0,
                'receiving_tds': self.receiving_tds or 0,
            }
        
        return {}


class BettingScenario(models.Model):
    """Model to store betting scenario data from users."""
    
    SPORT_CHOICES = [
        ('basketball', 'Basketball'),
        ('football', 'Football'),
    ]
    
    BET_TYPE_CHOICES = [
        ('over', 'Over'),
        ('under', 'Under'),
    ]
    
    sport = models.CharField(
        max_length=20,
        choices=SPORT_CHOICES,
        default='football',
        help_text="The sport for the betting scenario"
    )
    
    team = models.CharField(
        max_length=100,
        help_text="The team name"
    )
    
    player = models.CharField(
        max_length=100,
        help_text="The player name"
    )
    
    bet_type = models.CharField(
        max_length=10,
        choices=BET_TYPE_CHOICES,
        help_text="Whether the bet is over or under"
    )
    
    action = models.CharField(
        max_length=50,
        help_text="The action being bet on (e.g., Passing Yards)"
    )
    
    action_amount = models.DecimalField(
        max_digits=10,
        decimal_places=1,
        help_text="The threshold amount for the action"
    )
    
    bet_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="The bet amount in dollars"
    )
    
    created_at = models.DateTimeField(
        default=timezone.now,
        help_text="When the betting scenario was created"
    )
    
    # ML Prediction Results
    is_processed = models.BooleanField(
        default=False,
        help_text="Whether the scenario has been processed by ML model"
    )
    
    # Quantile Predictions
    prediction_q10 = models.FloatField(
        null=True,
        blank=True,
        help_text="Pessimistic prediction (10th percentile)"
    )
    
    prediction_q50 = models.FloatField(
        null=True,
        blank=True,
        help_text="Most likely prediction (50th percentile / median)"
    )
    
    prediction_q90 = models.FloatField(
        null=True,
        blank=True,
        help_text="Optimistic prediction (90th percentile)"
    )
    
    # Analysis Results
    win_probability = models.FloatField(
        null=True,
        blank=True,
        help_text="Probability of winning the bet (0.0 to 1.0)"
    )
    
    confidence_level = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        help_text="Confidence level (Low, Medium, High)"
    )
    
    expected_value = models.FloatField(
        null=True,
        blank=True,
        help_text="Probability edge: deviation from 50% win probability (range: -1 to +1)"
    )
    
    recommendation = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="Bet recommendation (Good Bet, Fair Bet, Poor Bet, etc.)"
    )
    
    # Player Info (from database lookup)
    player_position = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        help_text="Player position (QB, RB, WR, TE)"
    )
    
    # Prediction Metadata
    games_analyzed = models.IntegerField(
        null=True,
        blank=True,
        help_text="Number of games used for prediction"
    )
    
    prediction_season = models.IntegerField(
        null=True,
        blank=True,
        help_text="Season year used for prediction"
    )
    
    prediction_week = models.IntegerField(
        null=True,
        blank=True,
        help_text="Week number predicted for"
    )
    
    has_warning = models.BooleanField(
        default=False,
        help_text="Whether prediction has warnings (e.g., insufficient data)"
    )
    
    warning_message = models.TextField(
        null=True,
        blank=True,
        help_text="Warning message if any"
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Betting Scenario"
        verbose_name_plural = "Betting Scenarios"
    
    def __str__(self):
        return f"{self.player} ({self.team}) - {self.action} {self.bet_type} {self.action_amount}"
