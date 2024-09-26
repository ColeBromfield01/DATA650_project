from flask import Flask, jsonify, make_response, request
import pandas as pd
import os
from flask_cors import CORS

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

@app.errorhandler(404)
def resource_not_found(e):
    return make_response(jsonify(error='Not found!'), 404)
