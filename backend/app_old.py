from flask import Flask, jsonify
# from flask_cors import CORS
# from database import db, get_db_uri
# from models import *
# from routes import register_routes

app = Flask(__name__)
# CORS(app)

# Configure Database
# app.config['SQLALCHEMY_DATABASE_URI'] = get_db_uri()
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# db.init_app(app)

# Register API routes
# register_routes(app)

@app.route('/')
def index():
    return jsonify({"message": "NFL Data API is running!"})

@app.route('/health')
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5001)
