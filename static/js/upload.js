// ============================================
// UPLOAD MODAL - COMPLETE FILE
// ============================================

// Global variable for selected files
let selectedFiles = [];

// ============================================
// MODAL CONTROL FUNCTIONS
// ============================================

function showUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Reset everything
    selectedFiles = [];
    updateFileList();
    
    const fileInput = document.getElementById('fileInput');
    const folderInput = document.getElementById('folderInput');
    if (fileInput) fileInput.value = '';
    if (folderInput) folderInput.value = '';
}

// ============================================
// FILE LIST DISPLAY FUNCTION
// ============================================

function updateFileList() {
    const fileList = document.getElementById('selectedFilesInfo');
    const uploadBtn = document.getElementById('uploadBtn');

    if (!fileList || !uploadBtn) {
        console.error('Upload modal elements not found');
        return;
    }

    // No files selected
    if (selectedFiles.length === 0) {
        fileList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No files selected</p>';
        uploadBtn.disabled = true;
        return;
    }

    // Calculate total size
    const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);
    
    // Build HTML for file list
    let html = '<div style="margin-bottom: 10px;"><strong>Selected Files:</strong></div>';
    
    selectedFiles.forEach((file, index) => {
        const size = formatFileSize(file.size);
        html += `
            <div style="padding: 8px; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center;">
                <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    📄 ${file.name}
                </span>
                <span style="color: #666; margin-left: 10px; white-space: nowrap;">
                    ${size}
                </span>
                <button onclick="removeFile(${index})" style="margin-left: 10px; background: #ff4444; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-weight: bold;">×</button>
            </div>
        `;
    });
    
    html += `
        <div style="margin-top: 10px; padding: 10px; background: #e8f4f8; border-radius: 6px; text-align: center;">
            <strong>${selectedFiles.length} file(s)</strong> - Total: ${formatFileSize(totalSize)}
        </div>
    `;
    
    fileList.innerHTML = html;
    uploadBtn.disabled = false;
}

// ============================================
// REMOVE FILE FUNCTION
// ============================================

function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileList();
}

// ============================================
// UPLOAD FUNCTION
// ============================================

async function uploadFiles() {
    if (selectedFiles.length === 0) {
        if (typeof showNotification === 'function') {
            showNotification('Please select files to upload', 'error');
        } else {
            alert('Please select files to upload');
        }
        return;
    }
    
    // Create FormData
    const formData = new FormData();
    selectedFiles.forEach(file => {
        formData.append('files', file);
    });
    
    // Add current path if available
    if (typeof currentPath !== 'undefined') {
        formData.append('path', currentPath);
    }
    
    // Update button state
    const uploadBtn = document.getElementById('uploadBtn');
    const originalText = uploadBtn.textContent;
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';
    
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Success
            if (typeof showNotification === 'function') {
                showNotification(`Successfully uploaded ${selectedFiles.length} file(s)`, 'success');
            } else {
                alert(`Successfully uploaded ${selectedFiles.length} file(s)`);
            }
            
            closeUploadModal();
            
            // Reload files if function available
            if (typeof loadFiles === 'function' && typeof currentPath !== 'undefined') {
                loadFiles(currentPath);
            }
        } else {
            // Error from server
            if (typeof showNotification === 'function') {
                showNotification(data.message || 'Upload failed', 'error');
            } else {
                alert(data.message || 'Upload failed');
            }
        }
    } catch (error) {
        // Network error
        if (typeof showNotification === 'function') {
            showNotification('Upload failed. Please try again.', 'error');
        } else {
            alert('Upload failed. Please try again.');
        }
        console.error('Upload error:', error);
    } finally {
        // Reset button
        uploadBtn.disabled = false;
        uploadBtn.textContent = originalText;
    }
}

// ============================================
// EVENT LISTENERS - INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Upload.js loaded');
    
    // Get elements
    const chooseFilesBtn = document.getElementById('chooseFilesBtn');
    const chooseFolderBtn = document.getElementById('chooseFolderBtn');
    const fileInput = document.getElementById('fileInput');
    const folderInput = document.getElementById('folderInput');
    
    // Choose files button
    if (chooseFilesBtn && fileInput) {
        chooseFilesBtn.addEventListener('click', () => {
            fileInput.click();
        });
    } else {
        console.warn('Choose files button or input not found');
    }
    
    // Choose folder button
    if (chooseFolderBtn && folderInput) {
        chooseFolderBtn.addEventListener('click', () => {
            folderInput.click();
        });
    } else {
        console.warn('Choose folder button or input not found');
    }
    
    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            selectedFiles = Array.from(e.target.files);
            console.log(`Selected ${selectedFiles.length} files`);
            updateFileList();
        });
    }
    
    // Folder input change
    if (folderInput) {
        folderInput.addEventListener('change', (e) => {
            selectedFiles = Array.from(e.target.files);
            console.log(`Selected ${selectedFiles.length} files from folder`);
            updateFileList();
        });
    }
    
    console.log('Upload.js initialized');
});
