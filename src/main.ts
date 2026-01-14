// DOM Elements
const monitorScreen = document.getElementById('screen');
const bootTerminal = document.getElementById('boot-terminal');
const terminalContent = document.getElementById('terminal-content');
const loadingContainer = document.getElementById('loading-container');
const loadingBar = document.getElementById('loading-bar');
const loadingPercentage = document.getElementById('loading-percentage');
const desktop = document.getElementById('desktop');
const windowContainer = document.getElementById('window-container');
const currentTime = document.getElementById('current-time');

// Boot Sequence Configuration
const bootMessages = [
    "Initializing NUKE Kernel...",
    "Powering on system components...",
    "CPU: 1.2GHz PowerPC G3 checked.",
    "RAM: 512MB SDRAM checked.",
    "Hard Drive: Macintosh HD mounted.",
    "Loading kernel extensions...",
    "Security policy initialized.",
    "System bootstrap complete.",
    "Starting Terminal CLI..."
];

async function typeMessage(message: string, delay: number = 20) {
    return new Promise<void>((resolve) => {
        let i = 0;
        const interval = setInterval(() => {
            if (i < message.length) {
                terminalContent!.textContent += message[i];
                i++;
            } else {
                terminalContent!.textContent += '\n';
                clearInterval(interval);
                resolve();
            }
        }, delay);
    });
}

async function runBootSequence() {
    for (const msg of bootMessages) {
        await typeMessage(msg);
        await new Promise(r => setTimeout(r, 200));
    }

    // Show loading bar
    loadingContainer!.classList.remove('hidden');
    let progress = 0;
    const startTime = Date.now();
    const duration = 5000; // 5 seconds

    return new Promise<void>((resolve) => {
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            progress = Math.min((elapsed / duration) * 100, 100);

            loadingBar!.style.width = `${progress}%`;
            loadingPercentage!.textContent = `${Math.floor(progress)}%`;

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(resolve, 500);
            }
        }, 50);
    });
}

function transitionToDesktop() {
    bootTerminal!.classList.add('hidden');
    desktop!.classList.remove('hidden');
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    if (currentTime) {
        const now = new Date();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const day = days[now.getDay()];
        const date = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Mock battery for aesthetic
        const battery = "98%";

        currentTime.textContent = `${day} ${date} ${time} [${battery} ⚡]`;
    }
}

// Window Management
function createWindow(title: string, content: string) {
    const windowId = `win-${Date.now()}`;
    const win = document.createElement('div');
    win.className = 'window';
    win.id = windowId;
    win.style.left = '100px';
    win.style.top = '100px';

    win.innerHTML = `
    <div class="window-header">
      <div class="window-title">${title}</div>
      <div class="window-controls">
        <div class="control minimize"></div>
        <div class="control maximize"></div>
        <div class="control close" onclick="this.closest('.window').remove()"></div>
      </div>
    </div>
    <div class="window-content">
      ${content}
    </div>
  `;

    // Make draggable (Simple implementation)
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    const header = win.querySelector('.window-header') as HTMLElement;
    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - win.offsetLeft;
        offsetY = e.clientY - win.offsetTop;
        win.style.zIndex = '1000';
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            win.style.left = `${e.clientX - offsetX}px`;
            win.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    windowContainer!.appendChild(win);
}

// Wallpaper Logic
function setDesktopWallpaper(url: string) {
    if (desktop) {
        desktop.style.backgroundImage = `url('${url}')`;
        // Save to local storage
        localStorage.setItem('desktop-wallpaper', url);
    }
}

// Load saved wallpaper on start
const savedWallpaper = localStorage.getItem('desktop-wallpaper');
if (savedWallpaper && desktop) {
    desktop.style.backgroundImage = `url('${savedWallpaper}')`;
}

function openWallpaperFolder() {
    const wallpapers = [
        'wallpaper1.jpg', 'wallpaper2.jpg', 'wallpaper3.jpg',
        'wallpaper4.jpg', 'wallpaper5.jpg', 'wallpaper6.jpg', 'wallpaper7.jpg'
    ];

    let html = '<div class="file-grid">';
    wallpapers.forEach(wp => {
        const path = `./img/wallpapers/${wp}`;
        html += `
            <div class="file-item wallpaper-item" data-path="${path}">
                <img src="${path}" class="wallpaper-preview" />
                <span class="file-label">${wp}</span>
            </div>
        `;
    });
    html += '</div><p style="text-align:center; font-size:10px; margin-top:10px;">Double-click an image to set as wallpaper</p>';

    createWindow('Wallpaper', html);

    // Add double-click listeners
    setTimeout(() => {
        document.querySelectorAll('.wallpaper-item').forEach(item => {
            item.addEventListener('dblclick', () => {
                const path = item.getAttribute('data-path');
                if (path) setDesktopWallpaper(path);
            });
        });
    }, 100);
}

function openFilesWindow() {
    const html = `
        <div class="file-grid">
            <div class="file-item folder-item" id="folder-wallpaper">
                <img src="./img/Sub_folders.jpg" alt="Folder" />
                <span class="file-label">Wallpaper</span>
            </div>
            <div class="file-item folder-item">
                <img src="./img/Sub_folders.jpg" alt="Folder" />
                <span class="file-label">Documents</span>
            </div>
            <div class="file-item folder-item">
                <img src="./img/Sub_folders.jpg" alt="Folder" />
                <span class="file-label">Projects</span>
            </div>
        </div>
    `;

    createWindow('Files', html);

    // Add folder click listeners
    setTimeout(() => {
        const wpFolder = document.getElementById('folder-wallpaper');
        if (wpFolder) {
            wpFolder.addEventListener('click', () => {
                openWallpaperFolder();
            });
        }
    }, 100);
}

// Icon Click Handlers (Consolidated to Dock)
document.querySelectorAll('.dock-item').forEach(item => {
    item.addEventListener('click', () => {
        const label = item.getAttribute('data-label');
        const id = item.id;

        if (id === 'dock-github') {
            window.open('https://github.com/spro047?tab=repositories', '_blank');
            return;
        }

        if (id === 'files') {
            openFilesWindow();
            return;
        }

        if (id === 'trash') {
            createWindow('Recycle Bin', 'Empty as always...');
            return;
        }

        let content = 'Content Will be added here';
        if (id === 'this-pc') {
            content = `
        <p><strong>Navigation Guide:</strong></p>
        <ul style="padding-left: 20px; margin-top: 10px;">
          <li><strong>This PC:</strong> Navigate the system</li>
          <li><strong>Files:</strong> Browse folders & change wallpapers</li>
          <li><strong>Resume:</strong> View professional background</li>
          <li><strong>GitHub:</strong> Check projects</li>
          <li><strong>Research:</strong> Scientific contributions</li>
          <li><strong>Trash:</strong> Where bugs go</li>
        </ul>
      `;
        }

        createWindow(label || 'Window', content);
    });
});

// Start the app
runBootSequence().then(transitionToDesktop);
