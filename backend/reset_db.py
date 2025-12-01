import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models import (
    DefenseStats,
    Game,
    GameLog,
    KickingStats,
    PassingStats,
    Player,
    PuntingStats,
    ReceivingStats,
    RushingStats,
    Team,
)

with app.app_context():
    print("Dropping all existing tables...")
    db.drop_all()
    print("Creating new tables...")
    db.create_all()
    print("Database schema reset complete!")
