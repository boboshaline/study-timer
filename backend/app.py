from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

current_session = {}
completed_sessions = []

@app.route("/start-session", methods=["POST"])
def start_session():
    data = request.json
    current_session["subject"] = data["subject"]
    current_session["start_time"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    current_session["paused"] = False
    return jsonify({"message": "Session started", "session": current_session})

@app.route("/pause-session", methods=["POST"])
def pause_session():
    current_session["paused"] = True
    return jsonify({"message": "Session paused"})

@app.route("/resume-session", methods=["POST"])
def resume_session():
    current_session["paused"] = False
    return jsonify({"message": "Session resumed"})

@app.route("/complete-session", methods=["POST"])
def complete_session():
    current_session["end_time"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    completed_sessions.append(current_session.copy())
    response = current_session.copy()
    current_session.clear()
    return jsonify({"message": "Session completed", "session": response})

@app.route("/sessions", methods=["GET"])
def get_sessions():
    return jsonify(completed_sessions)

if __name__ == "__main__":
    app.run(debug=True)
