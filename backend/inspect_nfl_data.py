import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import nflreadpy as nfl

print("Inspecting nflreadpy data structures...")

# Check rosters
print("\n=== ROSTERS ===")
rosters = nfl.load_rosters(seasons=[2024])
if hasattr(rosters, 'to_pandas'):
    rosters_df = rosters.to_pandas()
else:
    rosters_df = rosters
print("Columns:", rosters_df.columns.tolist())
print("Sample row:")
print(rosters_df.head(1))

# Check player stats
print("\n=== PLAYER STATS ===")
stats = nfl.load_player_stats(seasons=[2024])
if hasattr(stats, 'to_pandas'):
    stats_df = stats.to_pandas()
else:
    stats_df = stats
print("Columns:", stats_df.columns.tolist())
print("Sample row:")
print(stats_df.head(1))
