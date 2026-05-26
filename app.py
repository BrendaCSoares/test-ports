from flask import Flask, request, jsonify
from flask_cors import CORS
import socket

app = Flask(__name__)

CORS(app)

@app.route("/scan", methods=["POST"])
def scan_ports():

    data = request.json

    ip = data.get("ip")
    ports = data.get("ports", [])

    resultados = []

    for port in ports:

        client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        client.settimeout(0.5)

        result = client.connect_ex((ip, port))

        if result == 0:
            status = "ABERTA"
        else:
            status = "FECHADA"

        resultados.append({
            "porta": port,
            "status": status
        })

        client.close()

    return jsonify(resultados)

if __name__ == "__main__":
    app.run(debug=True)