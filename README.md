# 🏠 Home Cloud Storage

A lightweight, self-hosted **multi-user** personal cloud storage system built with Flask. Each user gets their own private storage space accessible from any device on your home network with a clean, modern interface.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)
![Version](https://img.shields.io/badge/Version-2.0.0-orange.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

### 🔐 User Authentication
- **Registration System** - Create accounts with username and password
- **Secure Login** - Password hashing with Flask-Bcrypt
- **Session Management** - Stay logged in across browser sessions
- **User Isolation** - Each user has completely private storage

### 📁 File Management
- **Folder Organization** - Create, navigate, and organize files in folders
- **File Upload/Download** - Easy drag and drop file uploads with download support
- **Category Organization** - Pre-organized folders (Documents, Pictures, Videos, Downloads)
- **Context Menu** - Right-click for quick actions (download, delete)

### 🖥️ User Interface
- **Responsive Design** - Clean table-based interface with sidebar navigation
- **User Dashboard** - Displays username and storage info
- **Modern Auth Pages** - Beautiful login and registration pages
- **Real-time Updates** - Instant feedback on all actions

### 🌐 Network Features
- **Local Network Access** - Access from any device on your home network
- **Multi-device Support** - Use from phones, tablets, computers
- **No Internet Required** - Works completely offline on your local network

### ⚡ Easy Setup
- **One-Click Startup** - Automated setup and launch with batch script
- **Auto-folder Creation** - Automatically creates user folders on registration
- **Custom Storage Path** - Configure your own storage location

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Windows OS (for `start.bat`) or manual setup on Mac/Linux

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/AbdurRafay-Qureshi/home_cloud.git
   cd home_cloud
   ```

2. **Run the application** (Windows)

   Simply double-click `start.bat` - it will:
   - ✅ Check Python installation
   - ✅ Install all dependencies automatically
   - ✅ Start the server
   - ✅ Open your browser to the login page

   **OR** manually:

   ```bash
   pip install -r requirements.txt
   python main.py
   ```

3. **Create your account**

   - Browser opens to `http://127.0.0.1:5000/login`
   - Click "Create one" to register
   - Enter username and password
   - Start uploading files!

4. **Access from other devices**

   - Find your local IP: Run `ipconfig` in command prompt
   - On other devices: `http://YOUR_LOCAL_IP:5000` (e.g., `http://192.168.1.100:5000`)

## 📂 Project Structure

```
home_cloud/
├── main.py              # Flask backend server with authentication
├── requirements.txt     # Python dependencies
├── start.bat            # One-click startup script (Windows)
├── users.json           # User credentials (auto-created)
├── static/
│   ├── style.css        # Dashboard styles
│   └── auth.css         # Login/Register page styles
├── templates/
│   ├── index.html       # Main dashboard (requires login)
│   ├── login.html       # Login page
│   └── register.html    # Registration page
└── README.md            # Project documentation
```

## 💾 Storage Structure

Files are organized by user in the configured storage path (default: `E:/cloud`):

```
E:/cloud/
├── user1/
│   ├── Documents/
│   ├── Pictures/
│   ├── Videos/
│   └── Downloads/
├── user2/
│   ├── Documents/
│   ├── Pictures/
│   ├── Videos/
│   └── Downloads/
└── ...
```

Each user can only see and access their own files, ensuring complete data isolation.

## 🛠️ Configuration

### Storage Location

By default, files are stored in `E:/cloud`. To change this, edit `main.py`:

```python
app.config['UPLOAD_FOLDER'] = 'E:/cloud'  # Change to your preferred path
```

### File Size Limit

Default maximum file size is 500MB. Modify in `main.py`:

```python
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB
```

### Secret Key

For production use, change the secret key in `main.py`:

```python
app.config['SECRET_KEY'] = 'your-random-secret-key-here'
```

### Allowed File Types

The application accepts all common file types. To restrict, edit the `ALLOWED_EXTENSIONS` set in `main.py`.

## 📋 API Endpoints

| Method | Endpoint                | Description                     | Auth Required |
|--------|-------------------------|---------------------------------|---------------|
| GET    | `/login`                | Login page                     | No            |
| POST   | `/login`                | Authenticate user              | No            |
| GET    | `/register`             | Registration page              | No            |
| POST   | `/register`             | Create new user                | No            |
| GET    | `/logout`               | Logout user                    | Yes           |
| GET    | `/`                     | Main dashboard                 | Yes           |
| GET    | `/browse/<path>`        | List files and folders         | Yes           |
| POST   | `/upload`               | Upload a file                  | Yes           |
| GET    | `/download/<path>`      | Download a file                | Yes           |
| DELETE | `/delete/<path>`        | Delete a file or folder        | Yes           |
| POST   | `/create-folder`        | Create a new folder            | Yes           |
| GET    | `/storage-info`         | Get storage statistics         | Yes           |

## 🔧 Tech Stack

- **Backend:** Python Flask 3.0.0
- **Authentication:** Flask-Bcrypt (password hashing)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **File Handling:** Werkzeug
- **Storage:** Local file system
- **Session Management:** Flask sessions with secure cookies

## 📦 Dependencies

```text
Flask==3.0.0
Flask-Bcrypt==1.0.1
Werkzeug==3.0.1
Jinja2==3.1.2
click==8.1.7
itsdangerous==2.1.2
MarkupSafe==2.1.5
blinker==1.7.0
```

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ Session-based authentication
- ✅ Path validation to prevent directory traversal
- ✅ Secure filename handling
- ✅ User data isolation
- ✅ CSRF protection via Flask sessions

## 🌐 Network Access Guide

### Find Your Local IP

**Windows:**

```bash
ipconfig
```

Look for "IPv4 Address" (e.g., `192.168.1.100`)

**Mac/Linux:**

```bash
ifconfig
```

### Access from Other Devices

1. Ensure devices are on the same network
2. Open a browser and go to `http://YOUR_IP:5000`
3. Log in with your account
4. Upload, download, and manage files seamlessly

## 🤝 Contributing

Contributions are welcome! Please submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Known Issues

- Designed for trusted home networks only
- No HTTPS support (use on local network only)
- No email verification for registration

## 🔮 Roadmap

- [ ] File search functionality
- [ ] File preview (images, videos, PDFs)
- [ ] Multi-file upload
- [ ] Drag and drop upload
- [ ] Storage quota per user
- [ ] Admin panel for user management
- [ ] File sharing between users
- [ ] Mobile app companion
- [ ] Thumbnail generation for images
- [ ] ZIP download for folders
- [ ] Two-factor authentication

## 📝 Changelog

### v2.0.0 (2025-10-19)
- ✨ Added multi-user authentication system
- ✨ User registration and login pages
- ✨ Password hashing with Flask-Bcrypt
- ✨ Isolated storage per user
- ✨ User dashboard with logout
- 🛠️ Enhanced `start.bat` with better error handling
- 📝 Updated README with authentication info

### v1.0.0 (Initial Release)
- Basic file upload/download
- Folder navigation
- Single-user system

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Abdur Rafay Qureshi**

- GitHub: [@AbdurRafay-Qureshi](https://github.com/AbdurRafay-Qureshi)
- Repository: [home_cloud](https://github.com/AbdurRafay-Qureshi/home_cloud)

## 🙏 Acknowledgments

- Flask framework for the powerful and simple backend
- Flask-Bcrypt for secure password hashing
- The open-source community for inspiration and tools

---

**⚠️ Security Note:** This application is designed for personal use on trusted home networks. For production or public-facing deployments, implement proper authentication enhancements, HTTPS, rate limiting, and additional security measures.

**💡 Tips:**
- Use strong passwords for your accounts
- Regularly backup your `E:/cloud` folder
- Keep the `users.json` file secure (contains password hashes)
- Don't expose this server to the public internet without additional security

**📧 Support:** For issues or questions, please open an issue on GitHub.