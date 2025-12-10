#!/usr/bin/env python3
"""
Convenient test runner script for NFL Stats Backend

This script provides easy-to-use commands for running different test scenarios.
Usage:
    python run_tests.py              # Run all tests
    python run_tests.py smoke        # Run smoke tests only
    python run_tests.py crud         # Run CRUD tests only
    python run_tests.py queries      # Run query tests only
    python run_tests.py fast         # Run fast tests (exclude slow)
    python run_tests.py coverage     # Run with coverage report
"""

import sys
import subprocess
import os

def run_command(cmd):
    """Run a command and return the exit code."""
    print(f"\n{'='*60}")
    print(f"Running: {' '.join(cmd)}")
    print('='*60)
    result = subprocess.run(cmd)
    return result.returncode

def main():
    # Change to backend directory if not already there
    if os.path.basename(os.getcwd()) != 'backend':
        if os.path.exists('backend'):
            os.chdir('backend')

    # Default: run all tests
    if len(sys.argv) == 1:
        exit_code = run_command(['pytest', '-v'])
        sys.exit(exit_code)

    scenario = sys.argv[1].lower()

    scenarios = {
        'smoke': {
            'cmd': ['pytest', '-v', '-m', 'smoke'],
            'desc': 'Quick smoke tests to verify basic functionality'
        },
        'crud': {
            'cmd': ['pytest', '-v', '-m', 'crud'],
            'desc': 'CRUD operation tests for players, teams, and games'
        },
        'queries': {
            'cmd': ['pytest', '-v', '-m', 'queries'],
            'desc': 'All query endpoint tests'
        },
        'integration': {
            'cmd': ['pytest', '-v', '-m', 'integration'],
            'desc': 'Integration tests'
        },
        'unit': {
            'cmd': ['pytest', '-v', '-m', 'unit'],
            'desc': 'Unit tests'
        },
        'fast': {
            'cmd': ['pytest', '-v', '-m', 'not slow'],
            'desc': 'All tests except slow ones (faster for development)'
        },
        'slow': {
            'cmd': ['pytest', '-v', '-m', 'slow'],
            'desc': 'Only slow tests'
        },
        'coverage': {
            'cmd': ['pytest', '-v', '--cov=.', '--cov-report=html', '--cov-report=term-missing'],
            'desc': 'Run all tests with coverage report'
        },
        'basic': {
            'cmd': ['pytest', '-v', 'tests/test_basic.py'],
            'desc': 'Run basic API tests only'
        },
        'parallel': {
            'cmd': ['pytest', '-v', '-n', 'auto'],
            'desc': 'Run tests in parallel (requires pytest-xdist)'
        },
        'failed': {
            'cmd': ['pytest', '-v', '--lf'],
            'desc': 'Re-run only failed tests from last run'
        },
        'verbose': {
            'cmd': ['pytest', '-vv'],
            'desc': 'Run all tests with extra verbose output'
        },
        'quiet': {
            'cmd': ['pytest', '-q'],
            'desc': 'Run all tests with minimal output'
        },
        'exitfirst': {
            'cmd': ['pytest', '-v', '-x'],
            'desc': 'Stop on first failure'
        },
        'help': {
            'cmd': None,
            'desc': 'Show this help message'
        }
    }

    if scenario == 'help' or scenario not in scenarios:
        print("\n" + "="*60)
        print("NFL Stats Backend Test Runner")
        print("="*60)
        print("\nAvailable test scenarios:\n")

        for name, info in scenarios.items():
            print(f"  {name:15} - {info['desc']}")

        print("\nExamples:")
        print("  python run_tests.py smoke")
        print("  python run_tests.py coverage")
        print("  python run_tests.py fast")

        print("\nCustom pytest commands:")
        print("  pytest tests/test_crud.py::TestPlayerCRUD")
        print("  pytest tests/test_queries.py -k 'test_rushing'")
        print("  pytest -m 'crud and not slow'")

        if scenario not in scenarios and scenario != 'help':
            print(f"\nError: Unknown scenario '{scenario}'")
            sys.exit(1)
        sys.exit(0)

    # Run the selected scenario
    info = scenarios[scenario]
    print(f"\n{info['desc']}\n")
    exit_code = run_command(info['cmd'])

    # Special message for coverage
    if scenario == 'coverage' and exit_code == 0:
        print("\n" + "="*60)
        print("Coverage report generated!")
        print("="*60)
        print("\nView HTML report:")
        print("  open htmlcov/index.html      # macOS")
        print("  xdg-open htmlcov/index.html  # Linux")
        print("  start htmlcov/index.html     # Windows")
        print()

    sys.exit(exit_code)

if __name__ == '__main__':
    main()
