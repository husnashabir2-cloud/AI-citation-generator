from flask import Flask, request
from pdf_reader import read_pdf
import os

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/")
def home():
    return "AI Citation Generator is working!"


@app.route("/upload-pdf", methods=["POST"])
def upload_pdf():

    file = request.files["pdf"]

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    file.save(file_path)

    text = read_pdf(file_path)

    return {
        "message": "PDF uploaded successfully",
        "text": text
    }


if __name__ == "__main__":
    app.run(debug=True) 