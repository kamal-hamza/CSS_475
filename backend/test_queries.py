#!/usr/bin/env python3
"""
Simple test script for query endpoints
Run this with the backend server running to verify all query endpoints work
"""

import requests
import json
from termcolor import colored

BASE_URL = "http://localhost:5001"

def test_endpoint(name, endpoint, params=None):
    """Test a single endpoint and print results"""
    print(f"\n{'='*60}")
    print(colored(f"Testing: {name}", "cyan", attrs=["bold"]))
    print(f"Endpoint: {endpoint}")
    if params:
        print(f"Params: {params}")
    print('='*60)

    try:
        response = requests.get(f"{BASE_URL}{endpoint}", params=params, timeout=5)

        if response.status_code == 200:
            data = response.json()
            count = len(data) if isinstance(data, list) else 1
            print(colored(f"✓ SUCCESS - Status: {response.status_code}", "green"))
            print(f"  Returned: {count} record(s)")

            # Show first few results
            if isinstance(data, list) and len(data) > 0:
                print(colored(f"\n  First result:", "yellow"))
                print(f"  {json.dumps(data[0], indent=4)}")
            elif isinstance(data, dict):
                print(colored(f"\n  Result:", "yellow"))
                # Show abbreviated version if too long
                if 'games' in data and isinstance(data['games'], list):
                    games_count = len(data['games'])
                    abbreviated = {k: v for k, v in data.items() if k != 'games'}
                    abbreviated['games'] = f"[{games_count} games]"
                    print(f"  {json.dumps(abbreviated, indent=4)}")
                else:
                    print(f"  {json.dumps(data, indent=4)}")

            return True
        else:
            print(colored(f"✗ FAILED - Status: {response.status_code}", "red"))
            print(f"  Response: {response.text}")
            return False

    except requests.exceptions.ConnectionError:
        print(colored(f"✗ FAILED - Cannot connect to {BASE_URL}", "red"))
        print(colored(f"  Is the backend server running?", "yellow"))
        return False
    except Exception as e:
        print(colored(f"✗ FAILED - Error: {str(e)}", "red"))
        return False

def main():
    print(colored("\n" + "="*60, "magenta"))
    print(colored("  NFL STATS DATABASE - QUERY ENDPOINT TESTS", "magenta", attrs=["bold"]))
    print(colored("="*60 + "\n", "magenta"))

    tests = [
        # Beginner queries
        ("All Teams (Beginner)", "/api/queries/all-teams", {}),
        ("Players by Team (Beginner)", "/api/queries/players-by-team", {"team": "KC"}),
        ("Games by Week (Beginner)", "/api/queries/games-by-week", {"week": 1, "season": 2024}),

        # Intermediate queries
        ("Top Fantasy Scorers", "/api/queries/top-scorers", {"season": 2024, "week": 1, "limit": 5}),
        ("QB Passing Leaders", "/api/queries/qb-passing-leaders", {"season": 2024, "min_yards": 250, "limit": 5}),

        # Advanced queries
        ("Season Rushing Leaders", "/api/queries/rushing-leaders", {"season": 2024, "limit": 5}),
        ("Season Receiving Leaders", "/api/queries/receiving-leaders", {"season": 2024, "limit": 5}),
        ("Team Stats", "/api/queries/team-stats", {"season": 2024, "team": "KC"}),
        ("Player Game Log", "/api/queries/player-game-log", {"player_id": "00-0033873", "season": 2024}),
    ]

    passed = 0
    failed = 0

    for name, endpoint, params in tests:
        if test_endpoint(name, endpoint, params):
            passed += 1
        else:
            failed += 1

    # Summary
    print(f"\n{'='*60}")
    print(colored("SUMMARY", "magenta", attrs=["bold"]))
    print('='*60)
    print(f"Total Tests: {passed + failed}")
    print(colored(f"Passed: {passed}", "green"))
    if failed > 0:
        print(colored(f"Failed: {failed}", "red"))
    else:
        print(colored("All tests passed! 🎉", "green", attrs=["bold"]))
    print('='*60 + "\n")

if __name__ == "__main__":
    main()
