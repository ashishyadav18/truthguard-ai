from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

# Mock database (replace with real DB in production)
users_db = {}

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if username in users_db:
        return jsonify({"error": "Username exists"}), 400

    # Hash password
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    users_db[username] = hashed.decode('utf-8')

    # Create token that expires in 7 days
    access_token = create_access_token(
        identity=username,
        expires_delta=timedelta(days=7)
    )

    return jsonify({
        "access_token": access_token,
        "username": username
    })

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if username not in users_db:
        return jsonify({"error": "Invalid credentials"}), 401

    if not bcrypt.checkpw(password.encode('utf-8'), users_db[username].encode('utf-8')):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(
        identity=username,
        expires_delta=timedelta(days=7))
    
    return jsonify({
        "access_token": access_token,
        "username": username
    })
