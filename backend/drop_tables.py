import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db_uri
from sqlalchemy import create_engine, text

engine = create_engine(get_db_uri())

print("Disabling foreign key checks...")
with engine.connect() as conn:
    conn.execute(text("SET FOREIGN_KEY_CHECKS=0"))
    conn.commit()
    
    print("Dropping all old tables...")
    # Drop old tables from the Hub-and-Spoke model
    tables_to_drop = [
        'kicking_stats', 'receiving_stats', 'rushing_stats', 'passing_stats',
        'player_game_stats', 'team_game_stats', 'games', 'weeks', 'seasons',
        'players', 'teams', 'player_stats'
    ]
    
    for table in tables_to_drop:
        try:
            conn.execute(text(f"DROP TABLE IF EXISTS {table}"))
            print(f"Dropped {table}")
        except Exception as e:
            print(f"Error dropping {table}: {e}")
    
    conn.commit()
    
    print("Re-enabling foreign key checks...")
    conn.execute(text("SET FOREIGN_KEY_CHECKS=1"))
    conn.commit()

print("All old tables dropped successfully!")
print("Disposing engine...")
engine.dispose()
print("Done!")
