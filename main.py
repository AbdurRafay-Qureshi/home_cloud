from flask import Flask, request, jsonify, send_from_directory, render_template, redirect, url_for, session
from werkzeug.utils import secure_filename
from flask_bcrypt import Bcrypt
import os
from datetime import datetime
import shutil
import json

app = Flask(__name__)
bcrypt = Bcrypt(app)

# Configuration
app.config['SECRET_KEY'] = 'change-this-to-random-secret-key-for-production'
app.config['UPLOAD_FOLDER'] = 'E:/cloud'
app.config['USERS_FILE'] = 'users.json'
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB

# Create main upload folder
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Default folders for each user
DEFAULT_FOLDERS = ['Documents', 'Pictures', 'Videos', 'Downloads']

# User management functions
def load_users():
    """Load users from JSON file"""
    if os.path.exists(app.config['USERS_FILE']):
        with open(app.config['USERS_FILE'], 'r') as f:
            return json.load(f)
    return {}

def save_users(users):
    """Save users to JSON file"""
    with open(app.config['USERS_FILE'], 'w') as f:
        json.dump(users, f, indent=4)

def create_user_folders(username):
    """Create default folders for new user"""
    user_base_path = os.path.join(app.config['UPLOAD_FOLDER'], username)
    os.makedirs(user_base_path, exist_ok=True)
    
    for folder in DEFAULT_FOLDERS:
        folder_path = os.path.join(user_base_path, folder)
        os.makedirs(folder_path, exist_ok=True)

def get_user_storage_path(username, subpath=''):
    """Get storage path for specific user"""
    return os.path.join(app.config['UPLOAD_FOLDER'], username, subpath)

# File utility functions
def allowed_file(filename):
    return True  # Allow all files for now

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

# Authentication routes
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        users = load_users()
        
        if username in users:
            if bcrypt.check_password_hash(users[username]['password'], password):
                session['username'] = username
                return jsonify({'success': True, 'message': 'Login successful'}), 200
            else:
                return jsonify({'success': False, 'message': 'Invalid password'}), 401
        else:
            return jsonify({'success': False, 'message': 'User not found'}), 404
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'Username and password required'}), 400
        
        if len(username) < 3:
            return jsonify({'success': False, 'message': 'Username must be at least 3 characters'}), 400
        
        if len(password) < 4:
            return jsonify({'success': False, 'message': 'Password must be at least 4 characters'}), 400
        
        users = load_users()
        
        if username in users:
            return jsonify({'success': False, 'message': 'Username already exists'}), 409
        
        # Hash password and create user
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        users[username] = {
            'password': hashed_password,
            'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        save_users(users)
        create_user_folders(username)
        
        return jsonify({'success': True, 'message': 'Registration successful'}), 201
    
    return render_template('register.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))

# Main application routes (require login)
@app.route('/')
def index():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('index.html', username=session['username'])

@app.route('/browse', methods=['GET'])
@app.route('/browse/', methods=['GET'])
@app.route('/browse/<path:path>', methods=['GET'])
def browse_files(path=''):
    if 'username' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    username = session['username']
    
    try:
        full_path = get_user_storage_path(username, path)
        
        if not is_safe_path(get_user_storage_path(username), full_path):
            return jsonify({'error': 'Invalid path'}), 403
        
        if not os.path.exists(full_path):
            return jsonify({'error': 'Path not found'}), 404
        
        items = []
        
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
                continue
        
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
    if 'username' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    username = session['username']
    
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        current_path = request.form.get('path', '')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        original_filename = secure_filename(file.filename)
        if not original_filename:
            original_filename = 'unnamed_file'
        
        upload_dir = get_user_storage_path(username, current_path)
        
        if not is_safe_path(get_user_storage_path(username), upload_dir):
            return jsonify({'error': 'Invalid path'}), 403
        
        os.makedirs(upload_dir, exist_ok=True)
        filepath = os.path.join(upload_dir, original_filename)
        
        # Handle duplicate filenames
        counter = 1
        name, ext = os.path.splitext(original_filename)
        while os.path.exists(filepath):
            filepath = os.path.join(upload_dir, f"{name}_{counter}{ext}")
            counter += 1
        
        file.save(filepath)
        
        return jsonify({
            'message': 'File uploaded successfully',
            'filename': os.path.basename(filepath)
        }), 200
        
    except Exception as e:
        print(f"Upload error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/download/<path:filepath>', methods=['GET'])
def download_file(filepath):
    if 'username' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    username = session['username']
    
    try:
        full_path = get_user_storage_path(username, filepath)
        
        if not is_safe_path(get_user_storage_path(username), full_path):
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
    if 'username' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    username = session['username']
    
    try:
        full_path = get_user_storage_path(username, filepath)
        
        if not is_safe_path(get_user_storage_path(username), full_path):
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
    if 'username' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    username = session['username']
    
    try:
        data = request.get_json()
        folder_name = secure_filename(data.get('name', ''))
        current_path = data.get('path', '')
        
        if not folder_name:
            return jsonify({'error': 'Folder name required'}), 400
        
        new_folder_path = get_user_storage_path(username, os.path.join(current_path, folder_name))
        
        if not is_safe_path(get_user_storage_path(username), new_folder_path):
            return jsonify({'error': 'Invalid path'}), 403
        
        if os.path.exists(new_folder_path):
            return jsonify({'error': 'Folder already exists'}), 400
        
        os.makedirs(new_folder_path)
        
        return jsonify({'message': 'Folder created successfully'}), 200
        
    except Exception as e:
        print(f"Create folder error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/storage-info', methods=['GET'])
def storage_info():
    if 'username' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    username = session['username']
    
    try:
        total_size = 0
        file_count = 0
        user_path = get_user_storage_path(username)
        
        for root, dirs, files in os.walk(user_path):
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
    print("Server starting on http://0.0.0.0:5000")
    print("Access from this computer: http://127.0.0.1:5000")
    print("Access from other devices: http://YOUR_LOCAL_IP:5000\n")
    app.run(host='0.0.0.0', port=5000, debug=True)
