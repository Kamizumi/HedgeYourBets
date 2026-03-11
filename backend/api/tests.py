"""
Unit test for the BettingScenario API endpoint.
Tests if JSON data is submitted and processed properly.
"""

import json
from decimal import Decimal
from django.test import TestCase, Client
from django.urls import reverse
from .models import BettingScenario, Player, PlayerGameStats
from .data_access import get_team_stats_for_week, get_team_stats_summary


class BettingScenarioAPITest(TestCase):
    """Test case for betting scenario JSON data submission."""
    
    def test_json_data_submission_and_processing(self):
        """Test that valid JSON data is submitted and processed correctly."""
        # Set up test data
        client = Client()
        url = reverse('create_betting_scenario')
        
        # Valid betting scenario data (matches frontend form structure)
        betting_data = {
            'sport': 'football',
            'team': 'Kansas City Chiefs',
            'player': 'Patrick Mahomes',
            'betType': 'over',
            'action': 'Passing Yards',
            'actionAmount': '250',
            'betAmount': '100'
        }
        
        # Submit JSON data via POST request
        response = client.post(
            url,
            data=json.dumps(betting_data),
            content_type='application/json'
        )
        
        # Verify successful submission (HTTP 201 Created)
        self.assertEqual(response.status_code, 201)
        
        # Verify response contains success message
        response_data = json.loads(response.content)
        self.assertTrue(response_data['success'])
        self.assertEqual(response_data['message'], 'Betting scenario created successfully!')
        
        # Verify data was saved to database
        self.assertEqual(BettingScenario.objects.count(), 1)
        
        # Verify all submitted data was correctly stored
        scenario = BettingScenario.objects.first()
        self.assertEqual(scenario.sport, 'football')
        self.assertEqual(scenario.team, 'Kansas City Chiefs')
        self.assertEqual(scenario.player, 'Patrick Mahomes')
        self.assertEqual(scenario.bet_type, 'over')
        self.assertEqual(scenario.action, 'Passing Yards')
        self.assertEqual(scenario.action_amount, Decimal('250'))
        self.assertEqual(scenario.bet_amount, Decimal('100'))
        
        # Verify response data structure matches submitted data
        returned_data = response_data['data']
        self.assertEqual(returned_data['sport'], betting_data['sport'])
        self.assertEqual(returned_data['team'], betting_data['team'])
        self.assertEqual(returned_data['player'], betting_data['player'])
        self.assertEqual(returned_data['bet_type'], betting_data['betType'])
        self.assertEqual(returned_data['action'], betting_data['action'])
        self.assertEqual(returned_data['action_amount'], betting_data['actionAmount'])
        self.assertEqual(returned_data['bet_amount'], betting_data['betAmount'])

    #Test invalid json format
    def test_invalid_json_format(self):
        client = Client()
        url = reverse('create_betting_scenario')
        
        response = client.post(
            url,
            data='{"invalid": json}',  # Malformed JSON
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        response_data = json.loads(response.content)
        self.assertIn('Invalid JSON format', response_data['error'])

    #Test errors are produced for missing fields
    def test_missing_required_fields(self):
        """Test that missing required fields return validation errors."""
        client = Client()
        url = reverse('create_betting_scenario')
        
        incomplete_data = {
            'sport': 'football',
            'team': 'Kansas City Chiefs'
            # Missing other required fields
        }
        
        response = client.post(
            url,
            data=json.dumps(incomplete_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        response_data = json.loads(response.content)
        self.assertIn('Missing required field', response_data['error'])

    def test_negative_bet_amount_validation(self):
        """Test that negative bet amounts are rejected by the API."""
        client = Client()
        url = reverse("create_betting_scenario")

        negative_bet_data = {
            "sport": "football",
            "team": "Kansas City Chiefs",
            "player": "Patrick Mahomes",
            "betType": "over",
            "action": "Passing Yards",
            "actionAmount": "250",
            "betAmount": "-50",  # Negative bet amount should be rejected
        }

        response = client.post(
            url, data=json.dumps(negative_bet_data), content_type="application/json"
        )

        # Should return 400 Bad Request
        self.assertEqual(response.status_code, 400)
        response_data = json.loads(response.content)
        self.assertIn("Bet amount must be greater than 0", response_data["error"])

        # Verify no scenario was created in database
        self.assertEqual(BettingScenario.objects.count(), 0)

    def test_bet_amount_is_a_number(self):
        """Test that bet amount is actually a number."""
        client = Client()
        url = reverse("create_betting_scenario")

        #incorrect type for bet amount
        incorrect_bet_amount_data = {
            "sport": "football",
            "team": "Kansas City Chiefs",
            "player": "Patrick Mahomes",
            "betType": "over",
            "action": "Passing Yards",
            "actionAmount": "250",
            "betAmount": "one hundred", #Invalid type for bet amount (non-numeric)
        }

        response = client.post(
            url,
            data = json.dumps(incorrect_bet_amount_data),
            content_type = "application/json"
        )

        self.assertEqual(response.status_code, 400)
        response_data = json.loads(response.content)
        self.assertIn("Bet amount must be a valid number", response_data["error"])

        # Verify no scenario was created in database
        self.assertEqual(BettingScenario.objects.count(), 0)


class TeamStatsTest(TestCase):
    """Test cases for team stats functionality."""
    
    def setUp(self):
        """Set up test data."""
        # Create test players
        self.qb = Player.objects.create(
            player_id='test-qb-001',
            display_name='Test QB',
            position='QB',
            current_team='KC'
        )
        
        self.rb = Player.objects.create(
            player_id='test-rb-001',
            display_name='Test RB',
            position='RB',
            current_team='KC'
        )
        
        self.wr = Player.objects.create(
            player_id='test-wr-001',
            display_name='Test WR',
            position='WR',
            current_team='KC'
        )
        
        # Create game stats for Week 1
        PlayerGameStats.objects.create(
            player=self.qb,
            season=2025,
            week=1,
            season_type='REG',
            team='KC',
            opponent_team='DEN',
            passing_yards=250,
            rushing_yards=20,
            receptions=0,
            targets=0
        )
        
        PlayerGameStats.objects.create(
            player=self.rb,
            season=2025,
            week=1,
            season_type='REG',
            team='KC',
            opponent_team='DEN',
            passing_yards=0,
            rushing_yards=80,
            receptions=5,
            targets=6
        )
        
        PlayerGameStats.objects.create(
            player=self.wr,
            season=2025,
            week=1,
            season_type='REG',
            team='KC',
            opponent_team='DEN',
            passing_yards=0,
            rushing_yards=0,
            receptions=8,
            targets=12
        )
        
        # Create game stats for Week 2
        PlayerGameStats.objects.create(
            player=self.qb,
            season=2025,
            week=2,
            season_type='REG',
            team='KC',
            opponent_team='LV',
            passing_yards=300,
            rushing_yards=15,
            receptions=0,
            targets=0
        )
        
        PlayerGameStats.objects.create(
            player=self.rb,
            season=2025,
            week=2,
            season_type='REG',
            team='KC',
            opponent_team='LV',
            passing_yards=0,
            rushing_yards=100,
            receptions=3,
            targets=4
        )
    
    def test_get_team_stats_for_week(self):
        """Test that team stats are correctly calculated for a specific week."""
        stats = get_team_stats_for_week('KC', 2025, 1)
        
        self.assertIsNotNone(stats)
        self.assertEqual(stats['team_passing_yards'], 250.0)  # Only QB
        self.assertEqual(stats['team_rushing_yards'], 100.0)  # QB (20) + RB (80)
        self.assertEqual(stats['team_receptions'], 13.0)  # RB (5) + WR (8)
        self.assertEqual(stats['team_targets'], 18.0)  # RB (6) + WR (12)
    
    def test_get_team_stats_for_week_with_full_team_name(self):
        """Test that team name standardization works."""
        stats = get_team_stats_for_week('Kansas City Chiefs', 2025, 1)
        
        self.assertIsNotNone(stats)
        self.assertEqual(stats['team_passing_yards'], 250.0)
    
    def test_get_team_stats_for_week_fallback_to_recent(self):
        """Test that function falls back to most recent week if requested week doesn't exist."""
        # Request Week 5, but only Week 1 and 2 exist
        stats = get_team_stats_for_week('KC', 2025, 5)
        
        # Should return Week 2 stats (most recent)
        self.assertIsNotNone(stats)
        self.assertEqual(stats['team_passing_yards'], 300.0)  # From Week 2
    
    def test_get_team_stats_for_week_no_data(self):
        """Test that function returns None when no data exists."""
        stats = get_team_stats_for_week('BUF', 2025, 1)
        
        # Should return None (no data for BUF)
        self.assertIsNone(stats)
    
    def test_get_team_stats_summary_includes_targets(self):
        """Test that get_team_stats_summary includes avg_targets."""
        summary = get_team_stats_summary('KC', 2025)
        
        self.assertIsNotNone(summary)
        self.assertIn('avg_targets', summary)
        self.assertIn('total_targets', summary)
        # Week 1: 18 targets, Week 2: 4 targets = 22 total
        self.assertGreater(summary['avg_targets'], 0)
    
    def test_team_stats_handles_null_values(self):
        """Test that NULL values in stats are handled correctly (treated as 0)."""
        # Create a player with NULL stats
        player_null = Player.objects.create(
            player_id='test-null-001',
            display_name='Test Null Player',
            position='WR',
            current_team='KC'
        )
        
        PlayerGameStats.objects.create(
            player=player_null,
            season=2025,
            week=1,
            season_type='REG',
            team='KC',
            opponent_team='DEN',
            passing_yards=None,  # NULL value
            rushing_yards=None,
            receptions=None,
            targets=None
        )
        
        # Stats should still calculate correctly (NULLs treated as 0)
        stats = get_team_stats_for_week('KC', 2025, 1)
        
        self.assertIsNotNone(stats)
        # Values should be the same as before (NULL doesn't add anything)
        self.assertEqual(stats['team_passing_yards'], 250.0)
        self.assertEqual(stats['team_rushing_yards'], 100.0)
        