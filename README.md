# 🏠 Home Cloud Storage

A lightweight, self-hosted personal cloud storage system built with Flask. Access and manage your files from any device on your home network with a clean, modern interface.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

- 📁 **Folder Management** - Create, navigate, and organize files in folders
- 📤 **File Upload/Download** - Drag and drop file uploads with download support
- 🗂️ **Category Organization** - Pre-organized folders (Documents, Pictures, Videos, Downloads)
- 🖥️ **Responsive UI** - Clean table-based interface with sidebar navigation
- 🌐 **Network Access** - Access from any device on your local network
- 🔒 **Secure Storage** - Custom storage path with file validation
- ⚡ **One-Click Startup** - Automated setup and launch with batch script

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/AbdurRafay-Qureshi/home_cloud.git
   cd home_cloud
   ```

2. **Run the application** (Windows)

   Simply double-click `start.bat` - it will:
   - Check Python installation
   - Install all dependencies automatically
   - Start the server
   - Open your browser to `http://127.0.0.1:5000`

   **OR** manually:

   ```bash
   pip install -r requirements.txt
   python main.py
   ```

3. **Access the application**

   - Local: `http://127.0.0.1:5000`
   - Network: `http://YOUR_LOCAL_IP:5000` (e.g., `http://192.168.1.100:5000`)

## 📂 Project Structure

```
home_cloud/
├── main.py              # Flask backend server
├── requirements.txt     # Python dependencies
├── start.bat            # One-click startup script (Windows)
├── static/
│   └── style.css        # Application styles
├── templates/
│   └── index.html       # Frontend interface
└── README.md            # Project documentation
```

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

### Allowed File Types

The application accepts all common file types. To restrict, edit the `ALLOWED_EXTENSIONS` set in `main.py`.

## 🖼️ Interface

The application features:

- **Sidebar Navigation** - Quick access to Documents, Pictures, Videos, and Downloads folders
- **Table View** - File listing with name, modification date, and size
- **Upload Modal** - Simple file upload interface
- **Context Menu** - Right-click for download and delete options
- **Folder Creation** - Create new folders anywhere in the hierarchy

## 🌐 Network Access

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
2. Go to `http://YOUR_IP:5000` on any device
3. Upload, download, and manage files seamlessly

## 📋 API Endpoints

| Method | Endpoint                | Description                     |
|--------|-------------------------|---------------------------------|
| GET    | `/`                     | Main application interface      |
| GET    | `/browse/<path>`        | List files and folders          |
| POST   | `/upload`               | Upload a file                   |
| GET    | `/download/<path>`      | Download a file                 |
| DELETE | `/delete/<path>`        | Delete a file or folder         |
| POST   | `/create-folder`        | Create a new folder             |
| GET    | `/storage-info`         | Get storage statistics          |

## 🔧 Tech Stack

- **Backend:** Python Flask 3.0.0
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **File Handling:** Werkzeug
- **Storage:** Local file system

## 📦 Dependencies

```text
Flask==3.0.0
Werkzeug==3.0.1
Jinja2==3.1.2
click==8.1.7
itsdangerous==2.1.2
MarkupSafe==2.1.5
blinker==1.7.0
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Known Issues

- Currently designed for home network use only (no authentication)
- Best suited for trusted network environments

## 🔮 Future Enhancements

- [ ] User authentication system
- [ ] File search functionality
- [ ] File preview (images, videos, PDFs)
- [ ] Multi-file upload
- [ ] Mobile app companion
- [ ] File sharing with expiration links
- [ ] Thumbnail generation for images
- [ ] ZIP download for folders

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Abdur Rafay Qureshi**

- GitHub: [@AbdurRafay-Qureshi](https://github.com/AbdurRafay-Qureshi)
- Repository: [home_cloud](https://github.com/AbdurRafay-Qureshi/home_cloud)

## 🙏 Acknowledgments

- Flask framework for the powerful backend
- Modern web standards for the responsive interface
- The open-source community for inspiration

---

**⚠️ Security Note:** This application is designed for personal use on trusted home networks. For production or public-facing deployments, implement proper authentication, HTTPS, and security measures.

**💡 Tip:** To find your local IP for network access, run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) in your terminal.