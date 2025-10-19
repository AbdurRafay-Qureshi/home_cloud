// Global variables
let currentPath = '';
let currentContextItem = null;
let selectedFiles = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadFiles(currentPath);
    initializeEventListeners();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const folder = this.getAttribute('data-folder');
            currentPath = folder;
            loadFiles(folder);
        });
    });

    // File input handlers
    document.getElementById('fileInput').addEventListener('change', function(e) {
        selectedFiles = Array.from(e.target.files);
        updateSelectedFilesDisplay();
    });

    document.getElementById('folderInput').addEventListener('change', function(e) {
        selectedFiles = Array.from(e.target.files);
        updateSelectedFilesDisplay();
    });

    // Close context menu on click
    document.addEventListener('click', closeContextMenu);

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
}

// Update selected files display
function updateSelectedFilesDisplay() {
    const infoDiv = document.getElementById('selectedFilesInfo');
    const uploadBtn = document.getElementById('uploadBtn');
    
    if (selectedFiles.length === 0) {
        infoDiv.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No files selected</p>';
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Upload';
        return;
    }

    const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    
    // Check if it's a folder upload
    const isFolder = selectedFiles.some(f => f.webkitRelativePath);
    const uploadType = isFolder ? '📁 Folder Upload' : '📄 Multiple Files';

    let html = `<div style="margin-bottom: 10px; font-weight: 600; color: #4CAF50;">
        ${uploadType}
    </div>`;
    
    html += `<div style="margin-bottom: 10px; padding: 8px; background: #e8f5e9; border-radius: 4px;">
        <strong>${selectedFiles.length}</strong> file(s) - <strong>${totalSizeMB} MB</strong> total
    </div>`;

    html += '<div style="max-height: 150px; overflow-y: auto; border-top: 1px solid #e0e0e0; padding-top: 10px;">';
    
    // Show first 10 files, then indicate more
    const filesToShow = selectedFiles.slice(0, 10);
    const remainingFiles = selectedFiles.length - 10;
    
    filesToShow.forEach((file) => {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const displayPath = file.webkitRelativePath || file.name;
        html += `<div style="padding: 5px 0; border-bottom: 1px solid #f0f0f0; font-size: 12px;">
            <div style="font-weight: 500; color: #333;">${displayPath}</div>
            <div style="font-size: 11px; color: #666;">${sizeMB} MB</div>
        </div>`;
    });
    
    if (remainingFiles > 0) {
        html += `<div style="padding: 10px; text-align: center; color: #666; font-style: italic;">
            ...and ${remainingFiles} more file(s)
        </div>`;
    }
    
    html += '</div>';

    infoDiv.innerHTML = html;
    uploadBtn.disabled = false;
    uploadBtn.textContent = `Upload ${selectedFiles.length} File(s)`;
}

// Load files from server
async function loadFiles(path) {
    try {
        const response = await fetch(`/browse/${path}`);
        
        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }
        
        const data = await response.json();
        
        const filesList = document.getElementById('filesList');
        const breadcrumb = document.getElementById('breadcrumb');
        
        if (path === '') {
            breadcrumb.textContent = 'My Files';
        } else {
            breadcrumb.textContent = path;
        }
        
        if (data.items.length === 0) {
            filesList.innerHTML = `
                <tr>
                    <td colspan="4">
                        <div class="empty-state">
                            <svg fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>
                            <p>This folder is empty</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        filesList.innerHTML = data.items.map(item => {
            const icon = item.type === 'folder' 
                ? '<svg class="file-icon folder-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>'
                : '<svg class="file-icon file-icon-doc" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/></svg>';
            
            const escapedPath = item.path.replace(/'/g, "\\'");
            
            return `
                <tr oncontextmenu="showContextMenu(event, '${escapedPath}', '${item.type}'); return false;">
                    <td>
                        <div class="file-name" onclick="handleItemClick('${escapedPath}', '${item.type}')">
                            ${icon}
                            ${item.name}
                        </div>
                    </td>
                    <td class="modified-cell">${item.modified}</td>
                    <td class="size-cell">${item.size}</td>
                    <td class="actions-cell">
                        <div class="action-menu" onclick="showContextMenu(event, '${escapedPath}', '${item.type}')">⋮</div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Load files error:', error);
        showNotification('Failed to load files', 'error');
    }
}

// Handle item click (open folder or file)
function handleItemClick(path, type) {
    if (type === 'folder') {
        currentPath = path;
        loadFiles(path);
    }
}

// Show upload modal
function showUploadModal() {
    document.getElementById('uploadModal').classList.add('active');
    selectedFiles = [];
    updateSelectedFilesDisplay();
}

// Close upload modal
function closeUploadModal() {
    document.getElementById('uploadModal').classList.remove('active');
    document.getElementById('fileInput').value = '';
    document.getElementById('folderInput').value = '';
    selectedFiles = [];
}

// Upload files to server
// Upload files to server
async function uploadFiles() {
    if (selectedFiles.length === 0) {
        showNotification('Please select files to upload', 'error');
        return;
    }

    const uploadBtn = document.getElementById('uploadBtn');
    const originalText = uploadBtn.textContent;
    uploadBtn.disabled = true;
    uploadBtn.textContent = `Uploading ${selectedFiles.length} file(s)...`;

    const formData = new FormData();
    
    // Add all files - let the backend handle the path parsing
    selectedFiles.forEach((file) => {
        formData.append('files', file, file.webkitRelativePath || file.name);
    });
    
    // Add current path
    formData.append('path', currentPath);

    console.log(`Uploading ${selectedFiles.length} files to path: ${currentPath}`);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }

        if (!response.ok) {
            const data = await response.json();
            showNotification(data.error || 'Upload failed', 'error');
            return;
        }

        const data = await response.json();
        showNotification(data.message, 'success');
        closeUploadModal();
        loadFiles(currentPath);
        
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Upload failed: Server error', 'error');
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = originalText;
    }
}


// Show new folder modal
function showNewFolderModal() {
    document.getElementById('newFolderModal').classList.add('active');
}

// Close new folder modal
function closeNewFolderModal() {
    document.getElementById('newFolderModal').classList.remove('active');
    document.getElementById('folderNameInput').value = '';
}

// Create new folder
async function createFolder() {
    const folderName = document.getElementById('folderNameInput').value.trim();
    if (!folderName) {
        showNotification('Please enter a folder name', 'error');
        return;
    }

    try {
        const response = await fetch('/create-folder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: folderName,
                path: currentPath
            })
        });

        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }

        const data = await response.json();

        if (response.ok) {
            showNotification(data.message, 'success');
            closeNewFolderModal();
            loadFiles(currentPath);
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        console.error('Create folder error:', error);
        showNotification('Failed to create folder', 'error');
    }
}

// Show context menu
function showContextMenu(event, path, type) {
    event.preventDefault();
    event.stopPropagation();
    
    currentContextItem = { path, type };
    
    const menu = document.getElementById('contextMenu');
    menu.style.left = event.pageX + 'px';
    menu.style.top = event.pageY + 'px';
    menu.classList.add('active');
}

// Download item
function downloadItem() {
    if (currentContextItem && currentContextItem.type === 'file') {
        window.location.href = `/download/${currentContextItem.path}`;
        showNotification('Downloading file...', 'success');
    }
    closeContextMenu();
}

// Delete item
async function deleteItem() {
    if (!currentContextItem) return;
    
    if (!confirm(`Are you sure you want to delete this ${currentContextItem.type}?`)) {
        closeContextMenu();
        return;
    }

    try {
        const response = await fetch(`/delete/${currentContextItem.path}`, {
            method: 'DELETE'
        });

        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }

        const data = await response.json();

        if (response.ok) {
            showNotification(data.message, 'success');
            loadFiles(currentPath);
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Delete failed', 'error');
    }
    
    closeContextMenu();
}

// Close context menu
function closeContextMenu() {
    document.getElementById('contextMenu').classList.remove('active');
    currentContextItem = null;
}

// Show notification
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    
    text.textContent = message;
    notification.className = `notification ${type} active`;
    
    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}
