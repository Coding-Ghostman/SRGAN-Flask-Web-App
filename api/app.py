from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from play import output
import base64
import io
from PIL import Image

app = Flask(__name__)
CORS(app,support_credentials=True)

def image_to_byte_array(image: Image) -> bytes:
    imgByteArr = io.BytesIO()
    image.save(imgByteArr, format=image.format)
    imgByteArr = imgByteArr.getvalue()
    return imgByteArr

def process_image(file_data):
    try:
        # Example: Process the file (you can replace this with your logic)
        decoded_file_data = base64.b64decode(file_data)
        processed_image = Image.open(io.BytesIO(decoded_file_data))
        
        # processed_image.show()
        out = output(processed_image)
        out = Image.open("sv.png")
        out = image_to_byte_array(out)

        lr = Image.open("lr.png")
        lr = image_to_byte_array(lr)
        processed_encoded_file = base64.b64encode(out).decode('utf-8')
        lr_encoded = base64.b64encode(lr).decode('utf-8')
        return {'success': True, 'processed_file': processed_encoded_file, 'low_res': lr_encoded}

    except Exception as e:
        return {'error': str(e)}

@app.route('/upload', methods=['POST'])
@cross_origin(supports_credentials=True)
def upload():
    if 'file' not in request.json:
        return jsonify({'error': 'No file provided'}), 400

    file_data = request.json['file']

    result = process_image(file_data)

    if 'error' in result:
        return jsonify(result), 500
    else:
        return jsonify(result), 200

if __name__ == '__main__':
    app.run(debug=True)
