// ============================================
// GLOBAL VARIABLES
// ============================================
let currentPath = '';
let contextMenuTarget = null;

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    if (!notification || !notificationText) {
        console.warn('Notification elements not found');
        return;
    }
    
    notificationText.textContent = message;
    notification.className = `notification alert-${type}`;
    notification.classList.add('active');
    
    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}

// ============================================
// FILE LOADING
// ============================================

async function loadFiles(path = '') {
    currentPath = path;
    updateURL(path);
    const filesList = document.getElementById('filesList');
    const breadcrumb = document.getElementById('breadcrumb');
    
    if (!filesList) {
        console.error('filesList element not found');
        return;
    }
    
    // Update breadcrumb
    if (breadcrumb) {
        breadcrumb.innerHTML = '';
        
        // Add "My Files" home link
        const homeLink = document.createElement('span');
        homeLink.textContent = 'My Files';
        homeLink.style.cursor = 'pointer';
        homeLink.style.color = '#1282A2';
        homeLink.onclick = () => loadFiles('');
        breadcrumb.appendChild(homeLink);
        
        // Add path parts
        if (path !== '') {
            const parts = path.split('/').filter(p => p);
            let currentBreadcrumbPath = '';
            
            parts.forEach((part, index) => {
                currentBreadcrumbPath += (currentBreadcrumbPath ? '/' : '') + part;
                const pathToLoad = currentBreadcrumbPath;
                
                const separator = document.createElement('span');
                separator.textContent = ' / ';
                separator.style.color = '#666';
                breadcrumb.appendChild(separator);
                
                const partLink = document.createElement('span');
                partLink.textContent = part;
                
                if (index === parts.length - 1) {
                    // Current folder (not clickable)
                    partLink.style.color = '#333';
                } else {
                    // Parent folders (clickable)
                    partLink.style.cursor = 'pointer';
                    partLink.style.color = '#1282A2';
                    partLink.onclick = () => loadFiles(pathToLoad);
                }
                
                breadcrumb.appendChild(partLink);
            });
        }
    }
    
    // Show loading state
    filesList.innerHTML = `
        <tr>
            <td colspan="4">
                <div class="empty-state">
                    <svg fill="currentColor" viewBox="0 0 20 20" width="48" height="48">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                    </svg>
                    <p>Loading files...</p>
                </div>
            </td>
        </tr>
    `;
    
    try {
        const response = await fetch(`/list_files?path=${encodeURIComponent(path)}`);
        const data = await response.json();
        
        if (response.ok) {
            if (data.files && data.files.length > 0) {
                filesList.innerHTML = data.files.map(file => `
                    <tr class="file-row" data-path="${path ? path + '/' : ''}${file.name}" data-is-dir="${file.is_dir}" ${file.is_dir ? `onclick="loadFiles('${path ? path + '/' : ''}${file.name}')" style="cursor: pointer;"` : ''}>
                        <td>
                            ${file.is_dir ? 
                                `<svg fill="currentColor" viewBox="0 0 20 20" width="20" height="20" style="color: #1282A2; margin-right: 8px;">
                                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                                </svg>` :
                                `<svg fill="currentColor" viewBox="0 0 20 20" width="20" height="20" style="color: #666; margin-right: 8px;">
                                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                                </svg>`
                            }
                            ${file.name}
                        </td>
                        <td>${file.modified}</td>
                        <td>${file.is_dir ? '—' : formatFileSize(file.size)}</td>
                        <td>
                            <button class="more-btn" onclick="showContextMenu(event, '${path ? path + '/' : ''}${file.name}', ${file.is_dir})">⋮</button>
                        </td>
                    </tr>
                `).join('');
            } else {
                filesList.innerHTML = `
                    <tr>
                        <td colspan="4">
                            <div class="empty-state">
                                <svg fill="currentColor" viewBox="0 0 20 20" width="48" height="48">
                                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                                </svg>
                                <p>This folder is empty</p>
                            </div>
                        </td>
                    </tr>
                `;
            }
        } else {
            filesList.innerHTML = `
                <tr>
                    <td colspan="4">
                        <div class="empty-state">
                            <p style="color: #ff4444;">Failed to load files: ${data.error || 'Unknown error'}</p>
                        </div>
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error loading files:', error);
        filesList.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        <p style="color: #ff4444;">Error: ${error.message}</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

// ============================================
// CONTEXT MENU (3-DOT MENU)
// ============================================

function showContextMenu(event, filePath, isDir) {
    event.stopPropagation();
    
    const contextMenu = document.getElementById('contextMenu');
    if (!contextMenu) {
        console.error('Context menu not found');
        return;
    }
    
    contextMenuTarget = { path: filePath, isDir: isDir };
    
    // Position the menu
    contextMenu.style.display = 'block';
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';
}

function downloadItem() {
    if (!contextMenuTarget || contextMenuTarget.isDir) {
        hideContextMenu();
        return;
    }
    
    window.location.href = `/download?path=${encodeURIComponent(contextMenuTarget.path)}`;
    hideContextMenu();
}

async function deleteItem() {
    if (!contextMenuTarget) {
        hideContextMenu();
        return;
    }
    
    const itemName = contextMenuTarget.path.split('/').pop();
    const itemType = contextMenuTarget.isDir ? 'folder' : 'file';
    
    if (!confirm(`Are you sure you want to delete this ${itemType}: ${itemName}?`)) {
        hideContextMenu();
        return;
    }
    
    try {
        const response = await fetch('/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: contextMenuTarget.path
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification(data.message || `${itemType} deleted successfully`, 'success');
            loadFiles(currentPath);
        } else {
            showNotification(data.error || 'Delete failed', 'error');
        }
    } catch (error) {
        showNotification('Error deleting item', 'error');
        console.error('Delete error:', error);
    }
    
    hideContextMenu();
}

function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
    contextMenuTarget = null;
}

// ============================================
// NEW FOLDER MODAL
// ============================================

function showNewFolderModal() {
    const modal = document.getElementById('newFolderModal');
    const input = document.getElementById('folderNameInput');
    
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 100);
        }
    }
}

function closeNewFolderModal() {
    const modal = document.getElementById('newFolderModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

async function createFolder() {
    const input = document.getElementById('folderNameInput');
    if (!input) return;
    
    const folderName = input.value.trim();
    
    if (!folderName) {
        showNotification('Please enter a folder name', 'error');
        return;
    }
    
    try {
        const response = await fetch('/create_folder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                folder_name: folderName,
                path: currentPath
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification(data.message || 'Folder created successfully', 'success');
            closeNewFolderModal();
            loadFiles(currentPath);
        } else {
            showNotification(data.error || 'Failed to create folder', 'error');
        }
    } catch (error) {
        showNotification('Error creating folder', 'error');
        console.error('Create folder error:', error);
    }
}

// ============================================
// SIDEBAR NAVIGATION
// ============================================

function initializeSidebarNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Load folder
            const folder = this.getAttribute('data-folder');
            loadFiles(folder);
        });
    });
}

// ============================================
// EVENT LISTENERS
// ============================================

// Hide context menu when clicking elsewhere
document.addEventListener('click', hideContextMenu);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Main.js loaded');
    loadFiles('');
    initializeSidebarNavigation();
});

// ============================================
// BROWSER HISTORY SUPPORT
// ============================================

// Update URL when navigating folders
function updateURL(path) {
    const url = path ? `/?path=${encodeURIComponent(path)}` : '/';
    window.history.pushState({ path: path }, '', url);
}

// Handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
    const path = event.state?.path || '';
    loadFiles(path);
});

// Load initial path from URL on page load
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialPath = urlParams.get('path') || '';
    
    console.log('Main.js loaded');
    loadFiles(initialPath);
    initializeSidebarNavigation();
    
    // Save initial state
    window.history.replaceState({ path: initialPath }, '', window.location.href);
});
