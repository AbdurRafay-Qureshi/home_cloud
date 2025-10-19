from flask import Flask, request, jsonify, send_from_directory, render_template
from werkzeug.utils import secure_filename
import os
from datetime import datetime
import shutil

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-change-this'
app.config['UPLOAD_FOLDER'] = 'E:/cloud'
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB

# Allowed file extensions - allow everything for now
ALLOWED_EXTENSIONS = {
    'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'docx', 'xlsx', 'zip', 
    'mp4', 'mp3', 'avi', 'mov', 'rar', '7z', 'pptx', 'csv', 'py', 
    'html', 'css', 'js', 'json', 'xml', 'exe', 'apk', 'iso'
}

# Create main upload folder and default categories
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Create default folders
DEFAULT_FOLDERS = ['Documents', 'Pictures', 'Videos', 'Downloads']
for folder in DEFAULT_FOLDERS:
    folder_path = os.path.join(app.config['UPLOAD_FOLDER'], folder)
    os.makedirs(folder_path, exist_ok=True)

def allowed_file(filename):
    # Allow all files
    return True

def get_file_size(filepath):
    try:
        size_bytes = os.path.getsize(filepath)
        if size_bytes < 1024:
            return f"{size_bytes} Bytes"
        elif size_bytes < 1024 * 1024:
            return f"{round(size_bytes / 1024, 2)} KB"
        else:
            return f"{round(size_bytes / (1024 * 1024), 2)} MB"
    except:
        return "0 Bytes"

def is_safe_path(basedir, path):
    """Check if path is within basedir"""
    basedir = os.path.abspath(basedir)
    path = os.path.abspath(path)
    return path.startswith(basedir)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/browse', methods=['GET'])
@app.route('/browse/', methods=['GET'])
@app.route('/browse/<path:path>', methods=['GET'])
def browse_files(path=''):
    """Browse files and folders"""
    try:
        # Handle empty path
        if not path:
            path = ''
        
        full_path = os.path.join(app.config['UPLOAD_FOLDER'], path)
        
        print(f"Browsing path: {full_path}")  # Debug
        
        if not is_safe_path(app.config['UPLOAD_FOLDER'], full_path):
            return jsonify({'error': 'Invalid path'}), 403
        
        if not os.path.exists(full_path):
            return jsonify({'error': 'Path not found'}), 404
        
        items = []
        
        try:
            for item_name in os.listdir(full_path):
                item_path = os.path.join(full_path, item_name)
                
                try:
                    if os.path.isdir(item_path):
                        items.append({
                            'name': item_name,
                            'type': 'folder',
                            'size': '—',
                            'modified': datetime.fromtimestamp(os.path.getmtime(item_path)).strftime('%Y-%m-%d'),
                            'path': os.path.join(path, item_name).replace('\\', '/')
                        })
                    else:
                        items.append({
                            'name': item_name,
                            'type': 'file',
                            'size': get_file_size(item_path),
                            'modified': datetime.fromtimestamp(os.path.getmtime(item_path)).strftime('%Y-%m-%d'),
                            'path': os.path.join(path, item_name).replace('\\', '/')
                        })
                except Exception as e:
                    print(f"Error processing item {item_name}: {str(e)}")
                    continue
        except Exception as e:
            print(f"Error listing directory: {str(e)}")
            return jsonify({'error': 'Cannot read directory'}), 500
        
        # Sort: folders first, then files
        items.sort(key=lambda x: (x['type'] != 'folder', x['name'].lower()))
        
        return jsonify({
            'items': items,
            'current_path': path,
            'breadcrumbs': path.split('/') if path else []
        }), 200
        
    except Exception as e:
        print(f"Error in browse_files: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload"""
    try:
        print("Upload request received")  # Debug
        
        if 'file' not in request.files:
            print("No file in request")  # Debug
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        current_path = request.form.get('path', '')
        
        print(f"File: {file.filename}, Path: {current_path}")  # Debug
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Secure the filename
        original_filename = secure_filename(file.filename)
        if not original_filename:
            original_filename = 'unnamed_file'
        
        upload_dir = os.path.join(app.config['UPLOAD_FOLDER'], current_path)
        
        print(f"Upload directory: {upload_dir}")  # Debug
        
        if not is_safe_path(app.config['UPLOAD_FOLDER'], upload_dir):
            return jsonify({'error': 'Invalid path'}), 403
        
        # Create directory if it doesn't exist
        os.makedirs(upload_dir, exist_ok=True)
        
        filepath = os.path.join(upload_dir, original_filename)
        
        # Handle duplicate filenames
        counter = 1
        name, ext = os.path.splitext(original_filename)
        while os.path.exists(filepath):
            filepath = os.path.join(upload_dir, f"{name}_{counter}{ext}")
            counter += 1
        
        # Save the file
        file.save(filepath)
        print(f"File saved to: {filepath}")  # Debug
        
        return jsonify({
            'message': 'File uploaded successfully',
            'filename': os.path.basename(filepath)
        }), 200
        
    except Exception as e:
        print(f"Upload error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/download/<path:filepath>', methods=['GET'])
def download_file(filepath):
    """Download a specific file"""
    try:
        full_path = os.path.join(app.config['UPLOAD_FOLDER'], filepath)
        
        print(f"Download request for: {full_path}")  # Debug
        
        if not is_safe_path(app.config['UPLOAD_FOLDER'], full_path):
            return jsonify({'error': 'Invalid path'}), 403
        
        if not os.path.isfile(full_path):
            return jsonify({'error': 'File not found'}), 404
        
        directory = os.path.dirname(full_path)
        filename = os.path.basename(full_path)
        
        return send_from_directory(directory, filename, as_attachment=True)
    except Exception as e:
        print(f"Download error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/delete/<path:filepath>', methods=['DELETE'])
def delete_file(filepath):
    """Delete a file or folder"""
    try:
        full_path = os.path.join(app.config['UPLOAD_FOLDER'], filepath)
        
        print(f"Delete request for: {full_path}")  # Debug
        
        if not is_safe_path(app.config['UPLOAD_FOLDER'], full_path):
            return jsonify({'error': 'Invalid path'}), 403
        
        if os.path.isfile(full_path):
            os.remove(full_path)
            return jsonify({'message': 'File deleted successfully'}), 200
        elif os.path.isdir(full_path):
            shutil.rmtree(full_path)
            return jsonify({'message': 'Folder deleted successfully'}), 200
        else:
            return jsonify({'error': 'Path not found'}), 404
            
    except Exception as e:
        print(f"Delete error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/create-folder', methods=['POST'])
def create_folder():
    """Create a new folder"""
    try:
        data = request.get_json()
        folder_name = secure_filename(data.get('name', ''))
        current_path = data.get('path', '')
        
        print(f"Creating folder: {folder_name} in {current_path}")  # Debug
        
        if not folder_name:
            return jsonify({'error': 'Folder name required'}), 400
        
        new_folder_path = os.path.join(app.config['UPLOAD_FOLDER'], current_path, folder_name)
        
        if not is_safe_path(app.config['UPLOAD_FOLDER'], new_folder_path):
            return jsonify({'error': 'Invalid path'}), 403
        
        if os.path.exists(new_folder_path):
            return jsonify({'error': 'Folder already exists'}), 400
        
        os.makedirs(new_folder_path)
        print(f"Folder created: {new_folder_path}")  # Debug
        
        return jsonify({'message': 'Folder created successfully'}), 200
        
    except Exception as e:
        print(f"Create folder error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/storage-info', methods=['GET'])
def storage_info():
    """Get storage information"""
    try:
        total_size = 0
        file_count = 0
        
        for root, dirs, files in os.walk(app.config['UPLOAD_FOLDER']):
            for file in files:
                try:
                    filepath = os.path.join(root, file)
                    total_size += os.path.getsize(filepath)
                    file_count += 1
                except:
                    continue
        
        return jsonify({
            'total_size_mb': round(total_size / (1024 * 1024), 2),
            'file_count': file_count
        }), 200
    except Exception as e:
        print(f"Storage info error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print(f"Storage location: {app.config['UPLOAD_FOLDER']}")
    print("Creating default folders...")
    for folder in DEFAULT_FOLDERS:
        folder_path = os.path.join(app.config['UPLOAD_FOLDER'], folder)
        if os.path.exists(folder_path):
            print(f"  ✓ {folder}")
        else:
            print(f"  ✗ {folder} - not found!")
    print("\nServer starting on http://0.0.0.0:5000")
    print("Access from this computer: http://127.0.0.1:5000")
    print("Access from other devices: http://YOUR_LOCAL_IP:5000\n")
    app.run(host='0.0.0.0', port=5000, debug=True)
