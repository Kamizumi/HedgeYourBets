from django.urls import path
from . import views
from . import prediction_views

urlpatterns = [
    path("hello/", views.hello, name="hello"),
    path("jason/", views.jason_greeting, name="jason_greeting"),
    path("tim/", views.tim_greeting, name="tim_greeting"),
    path("betting-scenarios/", views.create_betting_scenario, name="create_betting_scenario"),
    path("betting-scenarios/list/", views.get_betting_scenarios, name="get_betting_scenarios"),
    
    # ML Prediction endpoint
    path("predict-bet/", prediction_views.predict_bet, name="predict_bet"),
    
    # Dynamic data endpoints
    path("teams/", views.get_teams, name="get_teams"),
    path("players/", views.get_players_by_team, name="get_players_by_team"),
    path("actions/", views.get_available_actions, name="get_available_actions"),
]
