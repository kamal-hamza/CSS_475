import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models import Team, Player, Game, PlayerStats

with app.app_context():
    print("Dropping all existing tables...")
    db.drop_all()
    print("Creating new tables...")
    db.create_all()
    print("Database schema reset complete!")
