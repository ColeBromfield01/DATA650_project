from flask import Flask, jsonify, make_response, request
import pandas as pd
import os
from flask_cors import CORS
import functions

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello_from_root():
    return jsonify(message='Hello from root!')


@app.route("/hello")
def hello():
    return jsonify(message='Hello from path!')


@app.route('/read_csv', methods=['POST'])
def read_csv():
    data = request.get_json()
    file_name = data['file_name']
    if not os.path.exists(file_name):
        return jsonify({"error": "File not found"}), 404
    df = pd.read_csv(file_name)
    return jsonify(df.to_dict(orient='records'))


@app.route('/team_lookup', methods=['GET'])
def get_team_lookup():
    year = request.args.get('year')
    team = request.args.get('team')
    return jsonify({ "output": functions.team_lookup(team, int(year))})


@app.route('/batting_leader', methods=['GET'])
def get_batting_leader():
    year = request.args.get('year')
    stat = request.args.get('stat')

    return jsonify({"output": functions.get_batting_leader(year, stat)})


@app.route('/pitching_leader', methods=['GET'])
def get_pitching_leader():
    year = request.args.get('year')
    stat = request.args.get('stat')

    return jsonify({"output": functions.get_pitching_leader(year, stat)})


@app.route('/period_batting_leader', methods=['GET'])
def get_period_batting_leader():
    # Possible to modify to where these are only initialized if the user enters a start and end year,
    # otherwise defaulting to 1871-2023?
    start_year = request.args.get('start_year')
    end_year = request.args.get('end_year')
    stat = request.args.get('stat')

    return jsonify({"output": functions.period_batting_leader(stat, start_year=start_year, end_year=end_year)})


@app.route('/period_pitching_leader', methods=['GET'])
def get_period_pitching_leader():
    # Possible to modify to where these are only initialized if the user enters a start and end year,
    # otherwise defaulting to 1871-2023?
    start_year = request.args.get('start_year')
    end_year = request.args.get('end_year')
    stat = request.args.get('stat')

    return jsonify({"output": functions.period_pitching_leader(stat, start_year=start_year, end_year=end_year)})


@app.route('/visualize_batting_leaders', methods=['GET'])
def get_visualize_batting_leaders():
    start_year = request.args.get('start_year')
    end_year = request.args.get('end_year')
    stat = request.args.get('stat')
    top_n = request.args.get('top_n')

    return functions.visualize_batting_leaders(stat, top_n, start_year=start_year, end_year=end_year)


@app.route('/visualize_pitching_leaders', methods=['GET'])
def get_visualize_pitching_leaders():
    start_year = request.args.get('start_year')
    end_year = request.args.get('end_year')
    stat = request.args.get('stat')
    top_n = request.args.get('top_n')

    return functions.visualize_pitching_leaders(stat, top_n, start_year=start_year, end_year=end_year)


@app.errorhandler(404)
def resource_not_found(e):
    return make_response(jsonify(error='Not found!'), 404)
