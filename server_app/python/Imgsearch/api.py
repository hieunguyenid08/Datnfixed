from flask import Flask, request, jsonify
from flask_cors import CORS
from keras.preprocessing import image
from keras.models import load_model
import joblib
import numpy as np
import os
from flask_pymongo import PyMongo

# Khởi tạo ứng dụng Flask
app = Flask(__name__)
CORS(app)  # Bật CORS để nhận yêu cầu từ React

# Cấu hình MongoDB Atlas URI (Thay đổi thông tin kết nối với MongoDB Atlas của bạn)
app.config['MONGO_URI'] = 'mongodb+srv://huytehuy:huytehuy@cluster0.i6slrnu.mongodb.net/DACN-231'
mongo = PyMongo(app)

# Tạo thư mục lưu file nếu chưa tồn tại
UPLOAD_FOLDER = './uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load model và encoder khi khởi động ứng dụng
try:
    print("Loading model...")
    model = load_model('e-commerce-model.keras')  # Load mô hình
    print("Model loaded successfully.")
    
    print("Loading label encoder...")
    encoder = joblib.load('label_encoder.pkl')  # Load encoder
    print("Label encoder loaded successfully.")
except Exception as e:
    print(f"Error loading model or encoder: {e}")

@app.route('/upload-image', methods=['POST'])
def upload_image():
    try:
        # Kiểm tra xem request có chứa file không
        if 'image' not in request.files:
            print("No file provided")
            return jsonify({"error": "No file provided"}), 400

        # Nhận file từ request
        file = request.files['image']
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        
        # Lưu file vào thư mục uploads
        file.save(file_path)
        print(f"File saved at {file_path}")

        # Gọi hàm dự đoán để xử lý file
        predictions = predict_image(file_path)
        print(f"Predictions: {predictions}")

        # Tìm các sản phẩm tương ứng với nhãn dự đoán từ MongoDB Atlas
        products = find_products_by_labels(predictions)
        print(f"Found products: {products}")

        return jsonify({"predictions": predictions, "products": products, "file_path": file_path})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


def predict_image(file_path):
    try:
        # Chuẩn bị ảnh cho mô hình
        img = image.load_img(file_path, target_size=(128, 128))  # Resize ảnh về (128, 128)
        img_array = image.img_to_array(img)  # Chuyển ảnh thành mảng numpy
        img_array = np.expand_dims(img_array, axis=0)  # Thêm chiều batch
        img_array /= 255.0  # Chuẩn hóa giá trị pixel

        # Dự đoán
        predictions = model.predict(img_array)
        all_labels = encoder.classes_

        result = {}
        # In các nhãn có xác suất lớn hơn 20%
        for label, prob in zip(all_labels, predictions[0]):
            if prob * 100 > 5:  # Chỉ in khi xác suất lớn hơn 10%
                result[label] = float(prob * 100)  # Chuyển đổi sang float chuẩn
                print(f"{label}: {prob * 100:.2f}%")  # In ra nhãn và xác suất

        # Trả về kết quả dạng dictionary
        return result
    except Exception as e:
        print(f"Error in prediction: {e}")
        raise

# Tìm kiếm sản phẩm từ nhãn trong MongoDB Atlas
def find_products_by_labels(predictions):
    try:
        product_names = list(predictions.keys())  # Lấy tên sản phẩm từ nhãn đã dự đoán
        products = []
        print(f"Looking for products matching labels: {product_names}")

        for name in product_names:
            # Tìm kiếm sản phẩm trong MongoDB Atlas với trường name_product
            products_in_db = mongo.db.product.find({"name_product": {"$regex": name, "$options": "i"}})
            for product in products_in_db:
                product['_id'] = str(product['_id'])
                products.append({
                    "_id": product.get("_id"),
                    "name_product": product.get("name_product", ""),
                    "description": product.get("description", ""),
                    "price_product": product.get("price_product", 0),
                    "image_url": product.get("image", ""),
                    "describe": product.get("describe", ""),
                    "gender": product.get("gender", ""),
                    "number": product.get("number", 0),
                    "id_category": product.get("id_category", "")
                     
                })
                print(f"Found product: {product['name_product']}")
        if not products:
            return {"message": "No products found for the given labels"}   

        return products

    except Exception as e:
        print(f"Error finding products: {e}")
        return []


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
