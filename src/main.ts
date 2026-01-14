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
    "Initializing Apple Mach Kernel...",
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
        currentTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      <div class="window-controls">
        <div class="control close" onclick="this.closest('.window').remove()"></div>
        <div class="control minimize"></div>
        <div class="control maximize"></div>
      </div>
      <div class="window-title">${title}</div>
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

// Icon Click Handlers
document.querySelectorAll('.icon').forEach(icon => {
    icon.addEventListener('click', () => {
        const label = icon.getAttribute('data-label');
        const id = icon.id;

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
          <li><strong>Resume:</strong> View professional background</li>
          <li><strong>GitHub (Dock):</strong> Check projects</li>
          <li><strong>Research:</strong> Scientific contributions</li>
          <li><strong>Trash:</strong> Where bugs go</li>
        </ul>
      `;
        }

        createWindow(label || 'Window', content);
    });
});

// Dock Handlers
const dockGithub = document.getElementById('dock-github');
if (dockGithub) {
    dockGithub.addEventListener('click', () => {
        window.open('https://github.com/spro047?tab=repositories', '_blank');
    });
}

// Start the app
runBootSequence().then(transitionToDesktop);
