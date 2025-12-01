import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()

def get_db_uri():
    user = os.getenv('DB_USER')
    password = os.getenv('DB_PASSWORD')
    host = os.getenv('DB_HOST')
    port = os.getenv('DB_PORT')
    name = os.getenv('DB_NAME')
    
    return f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}"
