from flask import Flask, request, jsonify, send_from_directory, render_template
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-change-this'
app.config['UPLOAD_FOLDER'] = 'E:/cloud'  # Your custom storage path
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max file size

# Allowed file extensions
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'docx', 'xlsx', 'zip', 'mp4', 'mp3', 'avi', 'mov', 'rar', '7z', 'pptx', 'csv'}

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_size(filepath):
    """Get file size in MB"""
    return round(os.path.getsize(filepath) / (1024 * 1024), 2)

# Routes
@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        # Secure the filename and add unique identifier
        original_filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{original_filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        # Save the file
        file.save(filepath)
        
        return jsonify({
            'message': 'File uploaded successfully',
            'filename': original_filename,
            'stored_as': unique_filename,
            'size': get_file_size(filepath)
        }), 200
    
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/files', methods=['GET'])
def list_files():
    """List all uploaded files"""
    files = []
    for filename in os.listdir(app.config['UPLOAD_FOLDER']):
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.isfile(filepath):
            files.append({
                'filename': filename,
                'original_name': filename.split('_', 1)[1] if '_' in filename else filename,
                'size': get_file_size(filepath),
                'uploaded': datetime.fromtimestamp(os.path.getctime(filepath)).strftime('%Y-%m-%d %H:%M:%S')
            })
    
    # Sort by upload time (newest first)
    files.sort(key=lambda x: x['uploaded'], reverse=True)
    
    return jsonify({'files': files}), 200

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    """Download a specific file"""
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404

@app.route('/delete/<filename>', methods=['DELETE'])
def delete_file(filename):
    """Delete a specific file"""
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(filepath):
            os.remove(filepath)
            return jsonify({'message': 'File deleted successfully'}), 200
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/storage-info', methods=['GET'])
def storage_info():
    """Get storage information"""
    total_size = sum(
        os.path.getsize(os.path.join(app.config['UPLOAD_FOLDER'], f))
        for f in os.listdir(app.config['UPLOAD_FOLDER'])
        if os.path.isfile(os.path.join(app.config['UPLOAD_FOLDER'], f))
    )
    
    file_count = len([f for f in os.listdir(app.config['UPLOAD_FOLDER']) 
                      if os.path.isfile(os.path.join(app.config['UPLOAD_FOLDER'], f))])
    
    return jsonify({
        'total_size_mb': round(total_size / (1024 * 1024), 2),
        'file_count': file_count
    }), 200

if __name__ == '__main__':
    # Run on localhost, accessible by all devices on local network
    print(f"Storage location: {app.config['UPLOAD_FOLDER']}")
    print("Server starting on http://0.0.0.0:5000")
    print("Access from other devices using your local IP address")
    app.run(host='127.0.0.1', port=5000, debug=True)
