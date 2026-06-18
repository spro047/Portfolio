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
const asciiLogo = `
  ██████  ██   ██  █████  ███████ ██   ██  █████  ███    ██ ██   ██ 
 ██       ██   ██ ██   ██ ██      ██   ██ ██   ██ ████   ██ ██  ██  
  █████   ███████ ███████ ███████ ███████ ███████ ██ ██  ██ █████   
      ██  ██   ██ ██   ██      ██ ██   ██ ██   ██ ██  ██ ██ ██  ██  
  ██████  ██   ██ ██   ██ ███████ ██   ██ ██   ██ ██   ████ ██   ██ 
  
          S Y S T E M   L O A D I N G   -   V E R S I O N   2 . 0
`;

const bootMessages = [
    { text: "Initializing NUKE Kernel...", type: 'info' },
    { text: "CPU: Intel Core i9-12900K @ 5.2GHz", type: 'ok' },
    { text: "RAM: 64GB DDR5 4800MHz [PASSED]", type: 'ok' },
    { text: "NVMe: Samsung 980 Pro 2TB [MOUNTED]", type: 'ok' },
    { text: "Security: Encrypted SSL Tunnel established", type: 'ok' },
    { text: "Loading OS Micro-kernel extensions...", type: 'info' },
    { text: "User 'SHASHANK SHETGERI' logged in via terminal.", type: 'ok' },
    { text: "Starting Pulse Desktop Environment...", type: 'info' }
];

async function addTerminalLine(message: string, statusType?: string) {
    const line = document.createElement('div');
    line.className = 'terminal-line';

    let statusHtml = '';
    if (statusType === 'ok') statusHtml = '<span class="status-tag status-ok">[ OK ]</span>';
    else if (statusType === 'info') statusHtml = '<span class="status-tag status-info">[INFO]</span>';
    else if (statusType === 'warn') statusHtml = '<span class="status-tag status-warn">[WARN]</span>';

    line.innerHTML = `${statusHtml}<span class="line-text"></span>`;
    terminalContent!.appendChild(line);

    const textSpan = line.querySelector('.line-text');
    return new Promise<void>((resolve) => {
        let i = 0;
        const interval = setInterval(() => {
            if (i < message.length) {
                textSpan!.textContent += message[i];
                i++;
            } else {
                clearInterval(interval);
                resolve();
            }
        }, 12);
    });
}

async function runBootSequence() {
    // Enable CRT flicker effect during boot
    monitorScreen?.classList.add('boot-anim');
    // Show Logo first
    const logoDiv = document.createElement('pre');
    logoDiv.className = 'ascii-logo';
    logoDiv.textContent = asciiLogo;
    terminalContent!.appendChild(logoDiv);
    await new Promise(r => setTimeout(r, 600));

    for (const msg of bootMessages) {
        await addTerminalLine(msg.text, msg.type);
        await new Promise(r => setTimeout(r, 150));
    }

    // Show loading bar
    loadingContainer!.classList.remove('hidden');
    let progress = 0;
    const startTime = Date.now();
    const duration = 2500; // Snappy 2.5s

    return new Promise<void>((resolve) => {
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            progress = Math.min((elapsed / duration) * 100, 100);

            loadingBar!.style.width = `${progress}%`;
            loadingPercentage!.textContent = `${Math.floor(progress)}%`;

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(resolve, 400);
            }
        }, 50);
    });
}

function transitionToDesktop() {
    // Stop CRT flicker effect — no longer needed on desktop
    monitorScreen?.classList.remove('boot-anim');
    bootTerminal!.classList.add('hidden');
    desktop!.classList.remove('hidden');
    updateClock();
    setInterval(updateClock, 1000);

    setupContextMenu();

    if (darkMode) desktop?.classList.add('dark-mode');
    const darkToggle = document.getElementById('dark-mode-toggle');
    if (darkToggle) darkToggle.textContent = darkMode ? '🌙' : '☀️';

    darkToggle?.addEventListener('click', toggleDarkMode);
    document.getElementById('search-toggle')?.addEventListener('click', openSearch);

    startScreensaverTimer();
    trackPageView();

    if (!localStorage.getItem('boot-time')) {
        localStorage.setItem('boot-time', Date.now().toString());
    }

    // Auto-open This PC window
    const thisPCContent = `
        <div class="content-page">
          <div style="margin-bottom: 16px;">
            <h2 style="margin: 0 0 4px 0; font-size: 16px;">Hi, I'm Shashank 👋</h2>
            <p style="margin: 0; font-size: 13px; color: #333;">I'm a Software Developer and this is my OS Based Portfolio</p>
          </div>

          <p><strong>How to use this OS Portfolio:</strong></p>
          <ul style="padding-left: 20px; margin-top: 8px;">
            <li><strong>This PC</strong> — You're here! A quick intro to the system.</li>
            <li><strong>Files</strong> — Browse folders, open wallpapers, and change the desktop background.</li>
            <li><strong>Resume</strong> — View my professional background and skills.</li>
            <li><strong>GitHub</strong> — Check out my projects and open-source work.</li>
            <li><strong>Research</strong> — My published scientific papers and contributions.</li>
            <li><strong>Paint</strong> — A simple drawing app to doodle around.</li>
            <li><strong>Calendar</strong> — Check today's date and time.</li>
            <li><strong>Trash</strong> — Where bugs and unused files go.</li>
          </ul>
        </div>
      `;
    createWindow('This PC', thisPCContent, 500, 420);
}

function setupContextMenu() {
    const menu = document.getElementById('context-menu');
    if (!menu) return;

    document.addEventListener('contextmenu', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.window') || target.closest('.dock') || target.closest('.top-bar')) return;
        e.preventDefault();
        menu.style.left = `${e.clientX}px`;
        menu.style.top = `${e.clientY}px`;
        menu.classList.remove('hidden');
    });

    menu.addEventListener('click', (e) => {
        const item = (e.target as HTMLElement).closest('.context-menu-item');
        if (!item) return;
        const action = item.getAttribute('data-action');
        menu.classList.add('hidden');
        if (action === 'change-wallpaper') openWallpaperFolder();
        else if (action === 'refresh') {
            const screen = document.getElementById('screen');
            screen?.classList.add('boot-anim');
            setTimeout(() => screen?.classList.remove('boot-anim'), 500);
        } else if (action === 'terminal') openTerminal();
    });

    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target as Node)) menu.classList.add('hidden');
    });

    // Long-press for mobile context menu
    let longPressTimer: ReturnType<typeof setTimeout> | null = null;
    document.addEventListener('touchstart', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.window') || target.closest('.dock') || target.closest('.top-bar')) return;
        longPressTimer = setTimeout(() => {
            const touch = e.touches[0];
            menu.style.left = `${touch.clientX}px`;
            menu.style.top = `${touch.clientY}px`;
            menu.classList.remove('hidden');
            longPressTimer = null;
        }, 500);
    }, { passive: true });
    document.addEventListener('touchend', () => {
        if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    }, { passive: true });
    document.addEventListener('touchmove', () => {
        if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    }, { passive: true });
}

// ============ Notification System ============
function showNotification(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-removing');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============ Window Registry + Taskbar ============
interface WindowEntry {
    id: string;
    title: string;
    minimized: boolean;
    element: HTMLElement;
}

const windowRegistry: WindowEntry[] = [];

function syncTaskbar() {
    const taskbar = document.getElementById('taskbar');
    if (!taskbar) return;

    const visible = windowRegistry.filter(w => document.body.contains(w.element));
    if (visible.length === 0) {
        taskbar.classList.add('hidden');
        return;
    }
    taskbar.classList.remove('hidden');

    taskbar.innerHTML = '';
    visible.forEach(entry => {
        const item = document.createElement('button');
        item.className = 'taskbar-item' + (entry.minimized ? '' : ' active');
        item.textContent = entry.title;
        item.addEventListener('click', () => {
            if (entry.minimized) {
                entry.element.classList.remove('minimized');
                entry.minimized = false;
                entry.element.style.zIndex = (++highestZIndex).toString();
            } else {
                entry.element.classList.add('minimized');
                entry.minimized = true;
            }
            syncTaskbar();
        });
        taskbar.appendChild(item);
    });
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
let highestZIndex = 1000;

function createWindow(title: string, content: string, width?: number, height?: number) {
    const windowId = `win-${Date.now()}`;
    const win = document.createElement('div');
    win.className = 'window focusable-window';
    win.id = windowId;

    const winWidth = width || 400;
    const winHeight = height || 300;

    if (width) win.style.width = `${width}px`;
    if (height) win.style.height = `${height}px`;

    // Center positioning on the monitor screen
    if (monitorScreen) {
        const screenWidth = monitorScreen.clientWidth;
        const screenHeight = monitorScreen.clientHeight;

        const centerX = (screenWidth - winWidth) / 2;
        const centerY = (screenHeight - winHeight) / 2;

        // Small random offset so multiple windows don't perfectly stack
        const offset = (Math.random() - 0.5) * 40;

        win.style.top = `${centerY + offset}px`;
        win.style.left = `${centerX + offset}px`;
    }

    win.style.zIndex = (++highestZIndex).toString();

    win.innerHTML = `
    <div class="window-header">
      <div class="window-title">${title}</div>
      <div class="window-controls">
        <div class="control minimize" onclick="window.minimizeWindow && window.minimizeWindow('${windowId}')"></div>
        <div class="control maximize" onclick="window.maximizeWindow && window.maximizeWindow('${windowId}')"></div>
        <div class="control close" onclick="window.closeWindow && window.closeWindow('${windowId}')"></div>
      </div>
    </div>
    <div class="window-content">
      ${content}
    </div>
  `;

    // Click to focus logic
    win.addEventListener('mousedown', () => {
        win.style.zIndex = (++highestZIndex).toString();
    });

    // Make draggable
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    const header = win.querySelector('.window-header') as HTMLElement;
    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - win.offsetLeft;
        offsetY = e.clientY - win.offsetTop;
        win.style.zIndex = (++highestZIndex).toString();
    });

    // Touch support for dragging
    header.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        isDragging = true;
        offsetX = touch.clientX - win.offsetLeft;
        offsetY = touch.clientY - win.offsetTop;
        win.style.zIndex = (++highestZIndex).toString();
        e.preventDefault();
    }, { passive: false });

    // Make Resizable
    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    win.appendChild(resizer);

    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        e.stopPropagation();
        e.preventDefault();
    });

    // Touch support for resizing
    resizer.addEventListener('touchstart', (e) => {
        isResizing = true;
        e.stopPropagation();
        e.preventDefault();
    }, { passive: false });

    function handleMouseMove(e: MouseEvent) {
        if (isDragging) {
            win.style.left = `${e.clientX - offsetX}px`;
            win.style.top = `${e.clientY - offsetY}px`;
        } else if (isResizing) {
            const width = e.clientX - win.offsetLeft;
            const height = e.clientY - win.offsetTop;

            if (width > 200) win.style.width = `${width}px`;
            if (height > 150) win.style.height = `${height}px`;
        }
    }

    function handleTouchMove(e: TouchEvent) {
        const touch = e.touches[0];
        if (isDragging) {
            win.style.left = `${touch.clientX - offsetX}px`;
            win.style.top = `${touch.clientY - offsetY}px`;
        } else if (isResizing) {
            const width = touch.clientX - win.offsetLeft;
            const height = touch.clientY - win.offsetTop;

            if (width > 200) win.style.width = `${width}px`;
            if (height > 150) win.style.height = `${height}px`;
        }
    }

    function handleEnd() {
        isDragging = false;
        isResizing = false;
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEnd);

    windowContainer!.appendChild(win);

    // Register window in taskbar
    const entry: WindowEntry = { id: windowId, title, minimized: false, element: win };
    windowRegistry.push(entry);
    syncTaskbar();

    // Clean up registry when window is removed
    const observer = new MutationObserver(() => {
        if (!document.body.contains(win)) {
            const idx = windowRegistry.findIndex(w => w.id === windowId);
            if (idx !== -1) windowRegistry.splice(idx, 1);
            syncTaskbar();
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// Global window control functions (exposed for inline onclick)
(window as any).minimizeWindow = (id: string) => {
    const entry = windowRegistry.find(w => w.id === id);
    if (entry) {
        entry.minimized = !entry.minimized;
        entry.element.classList.toggle('minimized', entry.minimized);
        syncTaskbar();
    }
};

(window as any).maximizeWindow = (id: string) => {
    const entry = windowRegistry.find(w => w.id === id);
    if (entry) {
        entry.element.classList.toggle('maximized');
    }
};

(window as any).closeWindow = (id: string) => {
    const entry = windowRegistry.find(w => w.id === id);
    if (entry) {
        entry.element.remove();
        const idx = windowRegistry.findIndex(w => w.id === id);
        if (idx !== -1) windowRegistry.splice(idx, 1);
        syncTaskbar();
    }
};

// Wallpaper Logic
function setDesktopWallpaper(url: string) {
    if (desktop) {
        desktop.style.backgroundImage = `url('${url}')`;
        // Save to local storage
        localStorage.setItem('desktop-wallpaper', url);
    }
}

const savedWallpaper = localStorage.getItem('desktop-wallpaper');
const defaultWallpaper = './img/wallpapers/wallpaper2.png';
if (desktop) {
    const wp = savedWallpaper || defaultWallpaper;
    desktop.style.backgroundImage = `url('${wp}')`;
    desktop.style.backgroundSize = 'cover';
    desktop.style.backgroundPosition = 'center';
    if (!savedWallpaper) {
        localStorage.setItem('desktop-wallpaper', defaultWallpaper);
    }
}

function openWallpaperFolder() {
    const wallpapers = [
        'wallpaper1.png', 'wallpaper2.png', 'wallpaper3.png',
        'wallpaper4.png', 'wallpaper5.png', 'wallpaper6.png', 'wallpaper7.png',
        'wallpaper8.png'
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
    html += '</div><p class="wallpaper-hint">Double-click an image to set as wallpaper</p>';

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

function openTerminal() {
    const termId = `term-${Date.now()}`;
    let history: string[] = [];

    const commands: Record<string, (args: string[]) => string> = {
        help: () => [
            'Available commands:',
            '  help      — Show this help message',
            '  whoami    — Display current user',
            '  ls        — List files in current directory',
            '  date      — Show current date and time',
            '  echo [text] — Print the given text',
            '  clear     — Clear the terminal screen',
            '  neofetch  — Display system info',
            '  uptime    — Show how long the system has been running',
            '  uname     — Print system information',
            '  exit      — Close the terminal'
        ].join('\n'),
        whoami: () => 'shashank',
        ls: () => 'Desktop  Documents  Projects  Research  Wallpapers',
        date: () => new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        echo: (args) => args.join(' ') || '',
        clear: () => { setTimeout(() => { const out = document.querySelector(`#${termId} .term-output`); if (out) out.innerHTML = ''; }, 0); return ''; },
        neofetch: () => [
            '         .--.            shashank@portfolio',
            '       .\'    \'.          -------------------',
            '      /  .--.  \\         OS: Retro macOS Portfolio v2.0',
            '     |  /    \\  |        Host: Vercel (Serverless)',
            '     | |      | |        Kernel: TypeScript 5.9',
            '    \\\\ \\      / //        Shell: Web Terminal v1.0',
            '     \\\\ \'----\' //         Resolution: 90vw x 90vh',
            '      \\\\      //          CPU: Intel Core i9-12900K @ 5.2GHz',
            '       \\\\    //           Memory: 64GB DDR5',
            '        \\\\  //            Uptime: powered by ☕'
        ].join('\n'),
        uptime: () => {
            const now = Date.now();
            const bootTime = localStorage.getItem('boot-time') || now.toString();
            const diff = Math.floor((now - parseInt(bootTime)) / 1000);
            const h = Math.floor(diff / 3600);
            const m = Math.floor((diff % 3600) / 60);
            const s = diff % 60;
            return `up ${h} hours, ${m} minutes, ${s} seconds`;
        },
        uname: () => 'WebTerminal 1.0 portfolio-os 2026 x86_64',
        exit: () => { setTimeout(() => { document.getElementById(termId)?.closest('.window')?.remove(); }, 100); return 'Goodbye!'; }
    };

    const html = `
        <div class="terminal-window" id="${termId}">
            <div class="term-output"></div>
            <div class="term-input-line">
                <span class="term-prompt">shashank@portfolio:~$</span>
                <input type="text" class="term-input" id="${termId}-input" autofocus />
            </div>
        </div>
    `;

    createWindow('Terminal', html, 600, 400);

    const outputEl = document.querySelector(`#${termId} .term-output`) as HTMLElement;
    const inputEl = document.getElementById(`${termId}-input`) as HTMLInputElement;

    function print(text: string, className = '') {
        const line = document.createElement('div');
        line.className = 'term-line' + (className ? ' ' + className : '');
        line.textContent = text;
        outputEl?.appendChild(line);
        outputEl?.scrollTo(0, outputEl.scrollHeight);
    }

    print('Welcome to WebTerminal v1.0');
    print('Type "help" for available commands.');
    print('');

    function processCommand(cmd: string) {
        const trimmed = cmd.trim();
        if (!trimmed) return;
        history.push(trimmed);

        const parts = trimmed.split(/\s+/);
        const commandName = parts[0].toLowerCase();
        const args = parts.slice(1);

        print(`shashank@portfolio:~$ ${trimmed}`, 'term-input-line-color');

        if (commands[commandName]) {
            const result = commands[commandName](args);
            if (result) {
                result.split('\n').forEach(line => print(line));
            }
        } else {
            print(`bash: ${commandName}: command not found`, 'term-error');
        }
    }

    inputEl?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = inputEl.value;
            inputEl.value = '';
            processCommand(cmd);
        }
    });

    setTimeout(() => {
        const termWin = document.getElementById(termId);
        termWin?.addEventListener('click', () => inputEl?.focus());
        inputEl?.focus();
    }, 200);
}

function openFilesWindow() {
    const html = `
        <div class="file-grid">
            <div class="file-item folder-item" id="folder-wallpaper">
                <img src="./img/Sub_folders.png" alt="Folder" />
                <span class="file-label">Wallpaper</span>
            </div>
            <div class="file-item folder-item" id="folder-documents">
                <img src="./img/Sub_folders.png" alt="Folder" />
                <span class="file-label">Documents</span>
            </div>
            <div class="file-item folder-item" id="folder-projects">
                <img src="./img/Sub_folders.png" alt="Folder" />
                <span class="file-label">Projects</span>
            </div>
            <div class="file-item folder-item" id="folder-paints">
                <img src="./img/Sub_folders.png" alt="Folder" />
                <span class="file-label">Paints</span>
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
        const docFolder = document.getElementById('folder-documents');
        if (docFolder) {
            docFolder.addEventListener('click', () => {
                createWindow('Documents', `
                    <div class="content-page">
                        <div class="file-grid">
                            <div class="file-item" id="file-resume-pdf">
                                <img src="./img/Resume.png" alt="File" />
                                <span class="file-label">Resume.pdf</span>
                            </div>
                        </div>
                    </div>
                `, 400, 300);
                setTimeout(() => {
                    document.getElementById('file-resume-pdf')?.addEventListener('dblclick', () => {
                        createWindow('Resume.pdf', '<iframe src="./img/Resume.pdf" style="width:100%;height:100%;border:none;"></iframe>', 700, 600);
                    });
                }, 100);
            });
        }
        const paintFolder = document.getElementById('folder-paints');
        if (paintFolder) {
            paintFolder.addEventListener('click', () => {
                openPaintsFolder();
            });
        }
        const projectsFolder = document.getElementById('folder-projects');
        if (projectsFolder) {
            projectsFolder.addEventListener('click', () => {
                openProjectsFolder();
            });
        }
    }, 100);
}

function openPaintsFolder() {
    const savedPaints = JSON.parse(localStorage.getItem('user-paints') || '{}');
    const paintNames = Object.keys(savedPaints);

    let html = '<div class="file-grid">';
    if (paintNames.length === 0) {
        html += '<p class="empty-state">No saved paints found.</p>';
    } else {
        paintNames.forEach(name => {
            html += `
                <div class="file-item paint-file-item" data-name="${name}">
                    <img src="${savedPaints[name]}" class="paint-thumb" />
                    <span class="file-label">${name}.png</span>
                </div>
            `;
        });
    }
    html += '</div>';

    createWindow('Paints', html);

    // Add click listeners to view individual paints
    setTimeout(() => {
        document.querySelectorAll('.paint-file-item').forEach(item => {
            item.addEventListener('dblclick', () => {
                const name = item.getAttribute('data-name');
                const dataUrl = savedPaints[name!];
                createWindow(name!, `<img src="${dataUrl}" style="max-width:100%;" />`, 500, 400);
            });
        });
    }, 100);
}

function openProjectsFolder() {
    const projects = [
        { name: "Portfolio", description: "A retro macOS-themed interactive portfolio built with TypeScript and Vite. Features a CRT monitor simulation, boot sequence, draggable windows, and built-in apps like Paint, Flappy Bird, and Calculator." },
        { name: "Password_Manager_Project", description: "A JavaScript-based password manager for storing and managing credentials locally. Implements encryption for secure password storage and retrieval with a clean UI." },
        { name: "XXS_Project", description: "A Python-based toolkit for understanding Cross-Site Scripting (XSS) vulnerabilities. Includes examples of reflected, stored, and DOM-based XSS with remediation techniques and secure coding practices." },
        { name: "Route_OP", description: "A route optimization project implementing pathfinding algorithms like Dijkstra and A* search. Demonstrates graph traversal techniques for efficient navigation and logistics planning." },
        { name: "MRI_Project", description: "A Jupyter Notebook project for medical image analysis using brain MRI data. Includes preprocessing pipelines, visualization tools, and deep learning models for classification tasks." },
        { name: "Travel_Planner_Project", description: "An HTML-based travel itinerary planner with destination selection, scheduling, and trip recommendations. Features interactive forms for building custom travel plans." },
        { name: "Course_Reg", description: "A course registration system built with EJS templating. Allows students to browse available courses, register, and manage their academic schedule with server-side routing." },
        { name: "New_LeaderBoard", description: "A JavaScript leaderboard application that displays and sorts user scores dynamically. Features real-time updates, local storage persistence, and a clean responsive UI." },
        { name: "AI_Interviewer_Project", description: "An AI-powered interview preparation tool that simulates interview questions and provides feedback. Built with JavaScript for interactive practice sessions." },
        { name: "Blockchain_Project", description: "A TypeScript blockchain implementation covering core concepts — blocks, transactions, mining, and consensus mechanisms. Educational project for understanding distributed ledger technology." },
        { name: "Devops_project", description: "A DevOps automation project showcasing CI/CD pipelines, Docker containerization, and cloud deployment workflows. Demonstrates modern infrastructure-as-code practices." },
        { name: "EEG_Project", description: "A Python-based EEG signal analysis project for processing and classifying brain activity data. Uses machine learning techniques for pattern recognition in neural signals." },
        { name: "EsIOT_Project", description: "6th semester IoT course project exploring embedded systems and Internet of Things concepts. Includes sensor integration, data collection, and real-time monitoring." },
        { name: "GenAI_Project", description: "A generative AI project exploring AI-powered content generation. Built with HTML and JavaScript for interactive demonstrations of language models." },
        { name: "Intubation_Project", description: "A medical data analysis project using Jupyter Notebooks for intubation procedure risk assessment. Applies machine learning to clinical decision support." }
    ];

    let html = '<div class="file-grid">';
    projects.forEach(p => {
        html += `
            <div class="file-item project-file-item" data-name="${p.name}" data-desc="${encodeURIComponent(p.description)}">
                <img src="./img/Resume.png" alt="File" />
                <span class="file-label">${p.name}</span>
            </div>
        `;
    });
    html += '</div>';

    createWindow('Projects', html, 600, 450);

    setTimeout(() => {
        document.querySelectorAll('.project-file-item').forEach(item => {
            item.addEventListener('dblclick', () => {
                const name = item.getAttribute('data-name');
                const desc = decodeURIComponent(item.getAttribute('data-desc') || '');
                createWindow(name!, `
                    <div class="project-detail">
                        <h2>${name}</h2>
                        <p>${desc}</p>
                    </div>
                `, 500, 400);
            });
        });
    }, 100);
}

function openPaint() {
    const html = `
        <div class="paint-container">
            <div class="paint-menu-bar">
                <div class="paint-menu-item" id="paint-save">File (Save)</div>
                <div class="paint-menu-item">Edit</div>
                <div class="paint-menu-item">View</div>
                <div class="paint-menu-item">Image</div>
                <div class="paint-menu-item">Colors</div>
            </div>
            <div class="paint-main">
                <div class="paint-toolbar">
                    <div class="paint-tool active" data-tool="pencil" title="Pencil">&#9998;</div>
                    <div class="paint-tool" data-tool="brush" title="Brush">&#9997;</div>
                    <div class="paint-tool" data-tool="eraser" title="Eraser">&#9003;</div>
                    <div class="paint-tool" data-tool="line" title="Line">&#9587;</div>
                    <div class="paint-tool" data-tool="rect" title="Rectangle">&#9634;</div>
                    <div class="paint-tool" data-tool="ellipse" title="Ellipse">&#9711;</div>
                    <div class="paint-tool" data-tool="picker" title="Color Picker">&#9678;</div>
                    <div class="paint-tool" data-tool="clear" title="Clear Canvas">&#8855;</div>
                    <div class="paint-tool" data-tool="undo" title="Undo">&#8634;</div>
                    <div class="paint-tool" data-tool="redo" title="Redo">&#8635;</div>
                </div>
                <div class="paint-canvas-area">
                    <canvas class="paint-canvas" id="paint-canvas" width="600" height="400"></canvas>
                </div>
            </div>
            <div class="paint-bottom">
                <div class="current-color-preview" id="current-color"></div>
                <div class="paint-color-palette" id="paint-palette">
                    <!-- Colors will be added by JS -->
                </div>
                <div class="paint-size-control">
                    <label>Size:</label>
                    <input type="range" id="paint-size-slider" min="1" max="20" value="2">
                    <span id="paint-size-value">2px</span>
                </div>
            </div>
        </div>
    `;

    createWindow('untitled - Paint', html, 750, 550);

    setTimeout(() => {
        const canvas = document.getElementById('paint-canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Tool Settings
        let currentSize = 2;
        const sizeSlider = document.getElementById('paint-size-slider') as HTMLInputElement;
        const sizeValue = document.getElementById('paint-size-value');

        sizeSlider?.addEventListener('input', () => {
            currentSize = parseInt(sizeSlider.value);
            if (sizeValue) sizeValue.textContent = `${currentSize}px`;
            updateLineSettings();
        });

        function updateLineSettings() {
            if (!ctx) return;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.strokeStyle = currentColor;

            if (currentTool === 'eraser') {
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = currentSize * 5; // Eraser is larger
            } else if (currentTool === 'brush') {
                ctx.lineWidth = currentSize * 3; // Brush is thicker
            } else {
                ctx.lineWidth = currentSize;
            }
        }

        // Default settings
        let currentTool = 'pencil';
        let currentColor = '#000000';
        updateLineSettings();

        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;
        let startX = 0;
        let startY = 0;
        let snapshot: ImageData | null = null;

        // Undo/Redo Stacks
        let undoStack: ImageData[] = [];
        let redoStack: ImageData[] = [];

        function saveState() {
            undoStack.push(ctx!.getImageData(0, 0, canvas.width, canvas.height));
            if (undoStack.length > 50) undoStack.shift();
            redoStack = [];
        }

        // Initial state
        saveState();

        function undo() {
            if (undoStack.length > 1) {
                redoStack.push(undoStack.pop()!);
                const previousState = undoStack[undoStack.length - 1];
                ctx!.putImageData(previousState, 0, 0);
            }
        }

        function redo() {
            if (redoStack.length > 0) {
                const nextState = redoStack.pop()!;
                undoStack.push(nextState);
                ctx!.putImageData(nextState, 0, 0);
            }
        }

        // Colors
        const colors = [
            '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#808040', '#004040', '#0080FF', '#004080', '#4000FF', '#804000',
            '#FFFFFF', '#C0C0C0', '#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FFFF80', '#00FF80', '#80FFFF', '#8080FF', '#FF0080', '#FF8040'
        ];

        const palette = document.getElementById('paint-palette');
        colors.forEach(c => {
            const div = document.createElement('div');
            div.className = 'paint-color';
            div.style.background = c;
            div.addEventListener('click', () => {
                currentColor = c;
                updateLineSettings();
                const preview = document.getElementById('current-color');
                if (preview) preview.style.background = c;
            });
            palette?.appendChild(div);
        });

        // Tools
        document.querySelectorAll('.paint-tool').forEach(tool => {
            tool.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                const toolName = target.getAttribute('data-tool');

                if (toolName === 'clear') {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    saveState();
                    return;
                }

                if (toolName === 'undo') {
                    undo();
                    return;
                }

                if (toolName === 'redo') {
                    redo();
                    return;
                }

                currentTool = toolName!;
                document.querySelectorAll('.paint-tool').forEach(t => t.classList.remove('active'));
                target.classList.add('active');
                updateLineSettings();
            });
        });

        // Drawing events
        canvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            lastX = e.clientX - rect.left;
            lastY = e.clientY - rect.top;
            startX = lastX;
            startY = lastY;
            snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        });

        canvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            lastX = touch.clientX - rect.left;
            lastY = touch.clientY - rect.top;
            startX = lastX;
            startY = lastY;
            isDrawing = true;
            snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
            e.preventDefault();
        }, { passive: false });

        canvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'eraser') {
                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(x, y);
                ctx.stroke();
                lastX = x;
                lastY = y;
            } else if (currentTool === 'picker') {
                const pixel = ctx.getImageData(x, y, 1, 1).data;
                const hex = "#" + ("000000" + ((pixel[0] << 16) | (pixel[1] << 8) | pixel[2]).toString(16)).slice(-6);
                currentColor = hex;
                ctx.strokeStyle = hex;
                ctx.fillStyle = hex;
                const preview = document.getElementById('current-color');
                if (preview) preview.style.background = hex;
            } else {
                // Shape tools need snapshot restoration
                if (snapshot) ctx.putImageData(snapshot, 0, 0);

                if (currentTool === 'line') {
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                } else if (currentTool === 'rect') {
                    ctx.strokeRect(startX, startY, x - startX, y - startY);
                } else if (currentTool === 'ellipse') {
                    ctx.beginPath();
                    ctx.ellipse(startX + (x - startX) / 2, startY + (y - startY) / 2, Math.abs(x - startX) / 2, Math.abs(y - startY) / 2, 0, 0, 2 * Math.PI);
                    ctx.stroke();
                }
            }
        });

        canvas.addEventListener('touchmove', (e) => {
            if (!isDrawing) return;
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'eraser') {
                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(x, y);
                ctx.stroke();
                lastX = x;
                lastY = y;
            } else if (currentTool === 'picker') {
                const pixel = ctx.getImageData(x, y, 1, 1).data;
                const hex = "#" + ("000000" + ((pixel[0] << 16) | (pixel[1] << 8) | pixel[2]).toString(16)).slice(-6);
                currentColor = hex;
                ctx.strokeStyle = hex;
                ctx.fillStyle = hex;
                const preview = document.getElementById('current-color');
                if (preview) preview.style.background = hex;
            } else {
                if (snapshot) ctx.putImageData(snapshot, 0, 0);

                if (currentTool === 'line') {
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                } else if (currentTool === 'rect') {
                    ctx.strokeRect(startX, startY, x - startX, y - startY);
                } else if (currentTool === 'ellipse') {
                    ctx.beginPath();
                    ctx.ellipse(startX + (x - startX) / 2, startY + (y - startY) / 2, Math.abs(x - startX) / 2, Math.abs(y - startY) / 2, 0, 0, 2 * Math.PI);
                    ctx.stroke();
                }
            }
            e.preventDefault();
        }, { passive: false });

        canvas.addEventListener('mouseup', () => {
            if (isDrawing) {
                isDrawing = false;
                saveState();
            }
        });

        // Save
        const saveBtn = document.getElementById('paint-save');
        saveBtn?.addEventListener('click', () => {
            const fileName = prompt("Enter a name for your masterpiece:", "Untitled");
            if (fileName) {
                const dataUrl = canvas.toDataURL('image/png');
                const savedPaints = JSON.parse(localStorage.getItem('user-paints') || '{}');
                savedPaints[fileName] = dataUrl;
                localStorage.setItem('user-paints', JSON.stringify(savedPaints));
                alert("Saved to Paints folder!");
            }
        });

    }, 100);
}

function openFlappyBird() {
    const html = `
        <div class="game-container">
            <div class="score-display current-score">Score: <span id="id-game-score">0</span></div>
            <div class="score-display high-score">High: <span id="id-high-score">0</span></div>
            <canvas id="game-canvas" width="320" height="480"></canvas>
            <div id="game-overlay" class="game-overlay">
                <div id="start-screen">
                    <h2 id="game-status">FLAPPY BIRD</h2>
                    <p>Press ARROW UP or SPACE to Jump</p>
                </div>
            </div>
        </div>
    `;

    createWindow('Flappy Bird', html, 320, 520);

    setTimeout(() => {
        const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const birdImg = new Image();
        birdImg.src = './img/flappy-bird_img.png';

        let birdY = 200;
        let birdVelocity = 0;
        const gravity = 0.25;
        const jump = -4.5;
        let score = 0;
        let highScore = parseInt(localStorage.getItem('flappy-high-score') || '0');
        const highScoreEl = document.getElementById('id-high-score');
        if (highScoreEl) highScoreEl.textContent = highScore.toString();

        let gameActive = false;
        let pipes: { x: number, y: number }[] = [];
        const pipeGap = 120;
        const pipeWidth = 50;
        let animationId: number;

        function createPipe() {
            const minPipeHeight = 50;
            const maxPipeHeight = canvas.height - pipeGap - minPipeHeight;
            const height = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
            pipes.push({ x: canvas.width, y: height });
        }

        function draw() {
            if (!ctx) return;
            // Background
            ctx.fillStyle = '#70c5ce';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Bird
            if (birdImg.complete) {
                ctx.save();
                ctx.translate(50 + 15, birdY + 15);
                ctx.rotate(Math.min(Math.PI / 4, Math.max(-Math.PI / 4, birdVelocity * 0.1)));
                ctx.drawImage(birdImg, -15, -15, 30, 30);
                ctx.restore();
            } else {
                ctx.fillStyle = 'yellow';
                ctx.fillRect(50, birdY, 30, 30);
            }

            if (gameActive) {
                birdVelocity += gravity;
                birdY += birdVelocity;

                // Pipes
                if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
                    createPipe();
                }

                pipes.forEach((pipe, index) => {
                    pipe.x -= 2;

                    // Draw pipes
                    ctx.fillStyle = '#73be2e';
                    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.y); // Top
                    ctx.fillRect(pipe.x, pipe.y + pipeGap, pipeWidth, canvas.height - pipe.y - pipeGap); // Bottom

                    // Collision
                    if (
                        50 + 25 > pipe.x && 50 + 5 < pipe.x + pipeWidth &&
                        (birdY + 5 < pipe.y || birdY + 25 > pipe.y + pipeGap)
                    ) {
                        gameOver();
                    }

                    // Score
                    if (pipe.x === 50) {
                        score++;
                        const scoreEl = document.getElementById('id-game-score');
                        if (scoreEl) scoreEl.textContent = score.toString();

                        if (score > highScore) {
                            highScore = score;
                            localStorage.setItem('flappy-high-score', highScore.toString());
                            if (highScoreEl) highScoreEl.textContent = highScore.toString();
                        }
                    }

                    // Remove off-screen pipes
                    if (pipe.x < -pipeWidth) {
                        pipes.splice(index, 1);
                    }
                });

                // Floor/Ceiling collision
                if (birdY > canvas.height - 30 || birdY < 0) {
                    gameOver();
                }
            }

            animationId = requestAnimationFrame(draw);
        }

        function gameOver() {
            gameActive = false;
            const startScreen = document.getElementById('start-screen');
            if (startScreen) startScreen.style.display = 'block';
            const statusEl = document.getElementById('game-status');
            if (statusEl) statusEl.textContent = 'GAME OVER';
            setTimeout(() => {
                resetGame();
            }, 1500);
        }

        function resetGame() {
            birdY = 200;
            birdVelocity = 0;
            pipes = [];
            score = 0;
            const scoreEl = document.getElementById('id-game-score');
            if (scoreEl) scoreEl.textContent = '0';
            const startScreen = document.getElementById('start-screen');
            if (startScreen) startScreen.style.display = 'block';
            const statusEl = document.getElementById('game-status');
            if (statusEl) statusEl.textContent = 'READY?';
            gameActive = false;
        }

        const jumpBird = () => {
            if (!gameActive) {
                gameActive = true;
                const startScreen = document.getElementById('start-screen');
                if (startScreen) startScreen.style.display = 'none';
            }
            birdVelocity = jump;
        };

        const handleInput = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                jumpBird();
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', handleInput);
        canvas.addEventListener('mousedown', (e) => {
            jumpBird();
            e.preventDefault();
        });
        canvas.addEventListener('touchstart', (e) => {
            jumpBird();
            e.preventDefault();
        }, { passive: false });

        // Clean up on window close
        const closeBtn = canvas.closest('.window')?.querySelector('.close');
        closeBtn?.addEventListener('click', () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('keydown', handleInput);
        });

        draw();
    }, 100);
}

function openCalculator() {
    const calcId = `calc-${Date.now()}`;
    const html = `
        <div class="calculator" id="${calcId}">
            <div class="calc-display" id="calc-display">0</div>
            <div class="calc-buttons" data-calc>
                <div class="calc-btn btn-red calc-clear" style="grid-column: span 3;">C</div>
                <div class="calc-btn btn-orange calc-op" data-op="/">/</div>
                <div class="calc-btn btn-grey calc-num" data-num="7">7</div>
                <div class="calc-btn btn-grey calc-num" data-num="8">8</div>
                <div class="calc-btn btn-grey calc-num" data-num="9">9</div>
                <div class="calc-btn btn-orange calc-op" data-op="*">&times;</div>
                <div class="calc-btn btn-grey calc-num" data-num="4">4</div>
                <div class="calc-btn btn-grey calc-num" data-num="5">5</div>
                <div class="calc-btn btn-grey calc-num" data-num="6">6</div>
                <div class="calc-btn btn-orange calc-op" data-op="-">-</div>
                <div class="calc-btn btn-grey calc-num" data-num="1">1</div>
                <div class="calc-btn btn-grey calc-num" data-num="2">2</div>
                <div class="calc-btn btn-grey calc-num" data-num="3">3</div>
                <div class="calc-btn btn-orange calc-op" data-op="+">+</div>
                <div class="calc-btn btn-grey calc-num" data-num="0">0</div>
                <div class="calc-btn btn-grey calc-num" data-num=".">.</div>
                <div class="calc-btn btn-green calc-eq" style="grid-column: span 2;">=</div>
            </div>
        </div>
    `;

    createWindow('Calculator', html, 320, 480);

    // Calculator Logic — uses event delegation, no global scope pollution
    setTimeout(() => {
        const container = document.getElementById(calcId);
        if (!container) return;

        let currentInput = '0';
        let previousInput = '';
        let operation: string | null = null;
        let shouldResetScreen = false;

        const display = container.querySelector('#calc-display') as HTMLElement;

        const updateDisplay = () => {
            let displayText = '';
            if (previousInput) {
                displayText = previousInput + ' ' + (operation || '');
                if (!shouldResetScreen) {
                    displayText += ' ' + currentInput;
                }
            } else {
                displayText = currentInput;
            }
            display.textContent = displayText || '0';
        };

        const btnGrid = container.querySelector('[data-calc]') as HTMLElement;
        btnGrid.addEventListener('click', (e) => {
            const btn = (e.target as HTMLElement).closest('[class*="calc-"]') as HTMLElement;
            if (!btn) return;

            if (btn.classList.contains('calc-num')) {
                const num = btn.getAttribute('data-num')!;
                if (currentInput === '0' || shouldResetScreen) {
                    currentInput = num;
                    shouldResetScreen = false;
                } else {
                    currentInput += num;
                }
                updateDisplay();
            } else if (btn.classList.contains('calc-op')) {
                const op = btn.getAttribute('data-op')!;
                if (operation !== null && !shouldResetScreen) {
                    calculate();
                }
                previousInput = currentInput;
                operation = op;
                shouldResetScreen = true;
                updateDisplay();
            } else if (btn.classList.contains('calc-clear')) {
                currentInput = '0';
                previousInput = '';
                operation = null;
                shouldResetScreen = false;
                updateDisplay();
            } else if (btn.classList.contains('calc-eq')) {
                calculate();
            }
        });

        const calculate = () => {
            if (operation === null || shouldResetScreen) return;
            let result: number;
            const prev = parseFloat(previousInput);
            const current = parseFloat(currentInput);

            switch (operation) {
                case '+': result = prev + current; break;
                case '-': result = prev - current; break;
                case '*': result = prev * current; break;
                case '/': result = prev / current; break;
                default: return;
            }

            currentInput = result.toString();
            previousInput = '';
            operation = null;
            shouldResetScreen = true;
            updateDisplay();
        };
    }, 100);
}

function openContactForm() {
    const formId = 'contact-form-' + Date.now();

    const html = `
        <div class="contact-form">
            <div style="margin-bottom: 16px;">
                <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;color:#333;">Name</label>
                <input type="text" id="${formId}-name" class="contact-input" placeholder="Your name" required />
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;color:#333;">Email</label>
                <input type="email" id="${formId}-email" class="contact-input" placeholder="you@example.com" required />
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;color:#333;">Subject</label>
                <input type="text" id="${formId}-subject" class="contact-input" placeholder="What's this about?" />
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;color:#333;">Message</label>
                <textarea id="${formId}-message" class="contact-textarea" placeholder="Write your message..." required></textarea>
            </div>
            <div style="display:flex;gap:8px;justify-content:flex-end;">
                <button class="contact-btn contact-btn-cancel" id="${formId}-cancel">Cancel</button>
                <button class="contact-btn contact-btn-send" id="${formId}-send">Send</button>
            </div>
            <div id="${formId}-status" class="contact-status hidden"></div>
        </div>
    `;

    createWindow('Contact Me', html, 420, 440);

    // Wire up the form after a short delay so DOM is rendered
    setTimeout(() => {
        const sendBtn = document.getElementById(`${formId}-send`);
        const cancelBtn = document.getElementById(`${formId}-cancel`);
        const statusEl = document.getElementById(`${formId}-status`);

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                const win = cancelBtn.closest('.window');
                if (win) win.remove();
            });
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', async () => {
                const name = (document.getElementById(`${formId}-name`) as HTMLInputElement)?.value.trim();
                const email = (document.getElementById(`${formId}-email`) as HTMLInputElement)?.value.trim();
                const subject = (document.getElementById(`${formId}-subject`) as HTMLInputElement)?.value.trim();
                const message = (document.getElementById(`${formId}-message`) as HTMLTextAreaElement)?.value.trim();

                if (!name || name.length < 2) {
                    if (statusEl) { statusEl.textContent = 'Please enter your name (min 2 characters).'; statusEl.className = 'contact-status contact-error'; }
                    return;
                }
                if (!email || !email.includes('@')) {
                    if (statusEl) { statusEl.textContent = 'Please enter a valid email address.'; statusEl.className = 'contact-status contact-error'; }
                    return;
                }
                if (!message || message.length < 10) {
                    if (statusEl) { statusEl.textContent = 'Please write a message (min 10 characters).'; statusEl.className = 'contact-status contact-error'; }
                    return;
                }

                sendBtn.textContent = 'Sending...';
                (sendBtn as HTMLButtonElement).disabled = true;

                try {
                    const apiUrl = '/api/contact';
                    const res = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, subject, message }),
                    });

                    const data = await res.json();

                    if (res.ok) {
                        if (statusEl) {
                            statusEl.textContent = data.message || 'Message sent!';
                            statusEl.className = 'contact-status contact-success';
                        }
                        sendBtn.textContent = 'Sent!';
                        document.querySelectorAll(`[id^="${formId}"]`).forEach(el => {
                            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                                (el as HTMLInputElement).value = '';
                            }
                        });
                    } else {
                        const detail = data.details ? data.details.join(', ') : data.error || 'Something went wrong.';
                        if (statusEl) { statusEl.textContent = detail; statusEl.className = 'contact-status contact-error'; }
                        sendBtn.textContent = 'Send';
                        (sendBtn as HTMLButtonElement).disabled = false;
                    }
                } catch (err) {
                    if (statusEl) { statusEl.textContent = 'Network error. Please try again later.'; statusEl.className = 'contact-status contact-error'; }
                    sendBtn.textContent = 'Send';
                    (sendBtn as HTMLButtonElement).disabled = false;
                }
            });
        }
    }, 50);
}

function openMenuWindow() {
    const dockItems = document.querySelectorAll('.dock-item');
    let html = '<div class="menu-grid">';

    // Start with core apps from Dock
    dockItems.forEach(item => {
        if (item.id === 'menu') return; // Skip the menu icon itself
        const img = (item.querySelector('img') as HTMLImageElement).src;
        const label = item.getAttribute('data-label');
        const id = item.id;

        html += `
            <div class="menu-app-item" data-id="${id}">
                <img src="${img}" />
                <span>${label}</span>
            </div>
        `;
    });

    // Add extra apps not in Dock
    html += `
        <div class="menu-app-item" data-id="calculator">
            <img src="./img/Calculator_img.jpg" />
            <span>Calculator</span>
        </div>
    `;

    html += '</div>';

    createWindow('Applications', html, 550, 450);

    // Add click listeners to launch apps from the menu
    setTimeout(() => {
        document.querySelectorAll('.menu-app-item').forEach(item => {
            const element = item as HTMLElement;
            element.addEventListener('click', () => {
                const id = element.getAttribute('data-id');

                if (id === 'calculator') {
                    openCalculator();
                } else {
                    const dockItem = document.getElementById(id!);
                    if (dockItem) {
                        (dockItem as HTMLElement).click();
                    }
                }

                // Close the menu window
                element.closest('.window')?.remove();
            });
        });
    }, 100);
}

// ============ Dark Mode Toggle ============
let darkMode = localStorage.getItem('dark-mode') === 'true';

function toggleDarkMode() {
    darkMode = !darkMode;
    const desktop = document.getElementById('desktop');
    const toggle = document.getElementById('dark-mode-toggle');
    if (desktop) desktop.classList.toggle('dark-mode', darkMode);
    if (toggle) toggle.textContent = darkMode ? '🌙' : '☀️';
    localStorage.setItem('dark-mode', String(darkMode));
    showNotification(darkMode ? 'Dark Mode enabled' : 'Light Mode enabled', 'info');
}

// ============ Search ============
const searchData = [
    { label: 'This PC', category: 'System', icon: '🖥️', action: 'this-pc' },
    { label: 'Resume', category: 'System', icon: '📄', action: 'resume' },
    { label: 'Research Papers', category: 'System', icon: '🔬', action: 'research' },
    { label: 'GitHub', category: 'External', icon: '🐙', action: 'github' },
    { label: 'Projects - Portfolio', category: 'Project', icon: '📁', action: 'project:Portfolio' },
    { label: 'Projects - Password Manager', category: 'Project', icon: '📁', action: 'project:Password Manager' },
    { label: 'Projects - Blockchain', category: 'Project', icon: '📁', action: 'project:Blockchain' },
    { label: 'Projects - AI Interviewer', category: 'Project', icon: '📁', action: 'project:AI Interviewer' },
    { label: 'Projects - GenAI', category: 'Project', icon: '📁', action: 'project:GenAI' },
    { label: 'Projects - EEG', category: 'Project', icon: '📁', action: 'project:EEG' },
    { label: 'Projects - MRI', category: 'Project', icon: '📁', action: 'project:MRI' },
    { label: 'Projects - DevOps', category: 'Project', icon: '📁', action: 'project:DevOps' },
    { label: 'ADHD Research Publication', category: 'Publication', icon: '📝', action: 'research' },
    { label: "Alzheimer's Detection Research", category: 'Publication', icon: '📝', action: 'research' },
    { label: 'Terminal', category: 'App', icon: '💻', action: 'terminal' },
    { label: 'Paint', category: 'App', icon: '🎨', action: 'paint' },
    { label: 'Calculator', category: 'App', icon: '🧮', action: 'calculator' },
    { label: 'Flappy Bird', category: 'Game', icon: '🐦', action: 'flappy-bird' },
    { label: 'Calendar', category: 'App', icon: '📅', action: 'calendar' },
    { label: 'Contact Me', category: 'System', icon: '✉️', action: 'contact' },
    { label: 'Blog / Articles', category: 'System', icon: '📰', action: 'blog' },
    { label: 'Skills - C/C++', category: 'Skill', icon: '⚡', action: 'resume' },
    { label: 'Skills - Docker', category: 'Skill', icon: '⚡', action: 'resume' },
    { label: 'Skills - AWS', category: 'Skill', icon: '⚡', action: 'resume' },
    { label: 'Skills - MongoDB', category: 'Skill', icon: '⚡', action: 'resume' },
    { label: 'Skills - Git', category: 'Skill', icon: '⚡', action: 'resume' },
    { label: 'Wallpapers', category: 'System', icon: '🖼️', action: 'wallpapers' },
    { label: 'Files', category: 'System', icon: '📂', action: 'files' },
];

let searchOverlay: HTMLElement | null = null;

function openSearch() {
    if (searchOverlay) { searchOverlay.remove(); searchOverlay = null; return; }

    const overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.innerHTML = `
        <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" class="search-input" id="search-input" placeholder="Search projects, skills, apps..." autofocus />
        </div>
        <div class="search-results" id="search-results">
            <div class="search-empty">Type to search...</div>
        </div>
    `;
    document.getElementById('desktop')?.appendChild(overlay);
    searchOverlay = overlay;

    const input = overlay.querySelector('.search-input') as HTMLInputElement;
    const results = overlay.querySelector('.search-results') as HTMLElement;

    input.addEventListener('input', () => {
        const q = input.value.toLowerCase().trim();
        if (!q) {
            results.innerHTML = '<div class="search-empty">Type to search...</div>';
            return;
        }

        const matches = searchData.filter(item =>
            item.label.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
        );

        if (matches.length === 0) {
            results.innerHTML = '<div class="search-empty">No results found</div>';
            return;
        }

        results.innerHTML = matches.map(m => `
            <div class="search-result-item" data-action="${m.action}">
                <span class="result-icon">${m.icon}</span>
                <span>${m.label}</span>
                <span class="result-category">${m.category}</span>
            </div>
        `).join('');

        results.querySelectorAll('.search-result-item').forEach(el => {
            el.addEventListener('click', () => {
                const action = (el as HTMLElement).getAttribute('data-action') || '';
                overlay.remove();
                searchOverlay = null;
                handleSearchAction(action);
            });
        });
    });

    setTimeout(() => input?.focus(), 50);
}

function handleSearchAction(action: string) {
    if (action.startsWith('project:')) {
        openProjectsFolder();
        return;
    }
    const dockItem = document.getElementById(action);
    if (dockItem) {
        (dockItem as HTMLElement).click();
    } else if (action === 'github') {
        window.open('https://github.com/spro047?tab=repositories', '_blank');
    } else if (action === 'wallpapers') {
        openWallpaperFolder();
    } else if (action === 'calculator') {
        openCalculator();
    } else if (action === 'blog') {
        openBlog();
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay) {
        searchOverlay.remove();
        searchOverlay = null;
    }
});

// ============ Screensaver ============
let screensaverTimer: ReturnType<typeof setTimeout> | null = null;
const SCREENSAVER_TIMEOUT = 120000;

function startScreensaverTimer() {
    if (screensaverTimer) clearTimeout(screensaverTimer);
    screensaverTimer = setTimeout(activateScreensaver, SCREENSAVER_TIMEOUT);
}

function activateScreensaver() {
    const overlay = document.getElementById('screensaver');
    if (!overlay) return;

    overlay.classList.add('active');
    overlay.innerHTML = '';

    const symbols = ['🍞', '🔥', '✦', '⬡', '⚡', '◆', '★', '☄'];
    for (let i = 0; i < 15; i++) {
        const obj = document.createElement('div');
        obj.className = 'screensaver-object';
        obj.textContent = symbols[i % symbols.length];
        obj.style.left = `${Math.random() * 90}%`;
        obj.style.top = `${Math.random() * 90}%`;
        obj.style.fontSize = `${20 + Math.random() * 30}px`;
        obj.style.transform = `rotate(${Math.random() * 360}deg)`;
        obj.dataset.vx = (0.3 + Math.random() * 0.7).toString();
        obj.dataset.vy = (0.3 + Math.random() * 0.7).toString();
        overlay.appendChild(obj);
    }

    function animate() {
        const objects = overlay!.querySelectorAll('.screensaver-object');
        objects.forEach(obj => {
            const el = obj as HTMLElement;
            let x = parseFloat(el.style.left) || 0;
            let y = parseFloat(el.style.top) || 0;
            let vx = parseFloat(el.dataset.vx || '0.5');
            let vy = parseFloat(el.dataset.vy || '0.5');

            x += vx;
            y += vy;

            if (x > 92 || x < 0) { vx = -vx; x += vx * 2; }
            if (y > 92 || y < 0) { vy = -vy; y += vy * 2; }

            el.style.left = `${x}%`;
            el.style.top = `${y}%`;
            el.dataset.vx = vx.toString();
            el.dataset.vy = vy.toString();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

function deactivateScreensaver() {
    const overlay = document.getElementById('screensaver');
    if (!overlay || !overlay.classList.contains('active')) return;
    overlay.classList.remove('active');
    overlay.innerHTML = '';
    startScreensaverTimer();
}

// Track user activity for screensaver
['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
    document.addEventListener(event, deactivateScreensaver);
});

// ============ Blog / Articles ============
const blogPosts = [
    {
        title: 'Building a Retro OS-Style Portfolio with TypeScript',
        date: 'June 2026',
        excerpt: 'How I built an interactive macOS-themed portfolio with a boot sequence, window manager, dock, and retro CRT effects — all in vanilla TypeScript and CSS.',
        content: `
            <h2>Building a Retro OS-Style Portfolio</h2>
            <p>When I set out to rebuild my portfolio, I wanted something that stood out — not just another static page with cards and links. I decided to build it as a retro operating system, complete with a boot sequence, draggable windows, and a functional dock.</p>
            <h3>Tech Stack</h3>
            <p>The entire project is built with TypeScript, vanilla CSS, and Vite as the bundler. No React, no Vue — just pure DOM manipulation. This keeps the bundle tiny (~46KB gzipped) and gives full control over every pixel.</p>
            <h3>Key Challenges</h3>
            <p>The CRT monitor effect was the trickiest part. It uses layered CSS gradients for scanlines, radial gradients for screen curvature, and a subtle flicker animation. Getting the boot sequence to feel authentic while staying snappy took careful timing orchestration with async/await.</p>
            <p>The window manager supports dragging, resizing, minimize/maximize, and z-index stacking — all in about 100 lines of TypeScript.</p>
        `
    },
    {
        title: 'ADHD Detection with XGBoost and FLAML',
        date: 'May 2025',
        excerpt: 'Published research on a dual-model framework for ADHD prediction using multimodal data fusion, achieving AUC scores of 0.84.',
        content: `
            <h2>ADHD Detection with XGBoost and FLAML</h2>
            <p>This paper presents a machine learning architecture that predicts ADHD and biological sex from multimodal inputs. The framework uses XGBoost for tabular features and FLAML for automated model selection.</p>
            <p>The model achieved an AUC of 0.84 for ADHD prediction and 0.77 for gender classification — competitive results that led to publication in MDPI's Computer Sciences & Mathematics Forum.</p>
            <p><strong>Key Findings:</strong> Combining imaging-derived features with automated model selection yields more robust ADHD detection than single-model approaches.</p>
        `
    },
    {
        title: 'Alzheimer\'s Detection Using Deep Learning',
        date: 'April 2025',
        excerpt: 'Comparative analysis of CNN architectures for multi-class Alzheimer\'s classification using brain MRI scans.',
        content: `
            <h2>Alzheimer's Detection Using Deep Learning</h2>
            <p>This study compares six deep learning architectures — CNN, VGG16, ResNet50, DenseNet201, InceptionV3, and EfficientNet-B1 — for stage-wise Alzheimer's disease classification.</p>
            <p>The key insight: carefully tuned 2D CNN architectures are sufficient for accurate multi-class classification from MRI scans, challenging the assumption that deeper models always perform better.</p>
        `
    },
    {
        title: 'Knowledge Graph-Based RAG for Generative AI',
        date: 'March 2025',
        excerpt: 'Building a Knowledge Graph-based Retrieval Augmented Generation (RAG) assistant for improved contextual AI responses.',
        content: `
            <h2>Knowledge Graph-Based RAG Assistant</h2>
            <p>Retrieval Augmented Generation (RAG) is powerful, but most implementations use flat vector search. I built a system that integrates Knowledge Graphs to provide structured context, significantly improving the relevance of AI-generated responses.</p>
            <p>The KG acts as a semantic backbone, ensuring the model retrieves conceptually related information even when exact keywords don't match.</p>
        `
    }
];

function openBlog() {
    let html = '<div class="blog-list">';
    blogPosts.forEach((post, i) => {
        html += `
            <div class="blog-post" data-index="${i}">
                <h3>${post.title}</h3>
                <div class="blog-meta">${post.date}</div>
                <div class="blog-excerpt">${post.excerpt}</div>
            </div>
        `;
    });
    html += '</div>';

    createWindow('Blog / Articles', html, 520, 450);

    setTimeout(() => {
        document.querySelectorAll('.blog-post').forEach(el => {
            el.addEventListener('click', () => {
                const idx = parseInt((el as HTMLElement).getAttribute('data-index') || '0');
                const post = blogPosts[idx];
                if (post) {
                    createWindow(post.title, `<div class="content-page">${post.content}</div>`, 550, 500);
                }
            });
        });
    }, 100);
}

// ============ Analytics ============
function trackPageView() {
    try {
        const data = {
            url: window.location.href,
            referrer: document.referrer || '(direct)',
            timestamp: new Date().toISOString(),
            screen: `${screen.width}x${screen.height}`,
            userAgent: navigator.userAgent.slice(0, 100),
        };
        const views = JSON.parse(localStorage.getItem('page-views') || '[]');
        views.push(data);
        if (views.length > 100) views.shift();
        localStorage.setItem('page-views', JSON.stringify(views));
    } catch {
        // analytics failure should not break the app
    }
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

        if (id === 'menu') {
            openMenuWindow();
            return;
        }

        if (id === 'flappy-bird') {
            openFlappyBird();
            return;
        }

        if (id === 'contact') {
            openContactForm();
            return;
        }

        if (id === 'terminal') {
            openTerminal();
            return;
        }

        if (id === 'blog') {
            openBlog();
            return;
        }

        let content = 'Content Will be added here';
        if (id === 'this-pc') {
            content = `
        <div class="content-page">
          <div style="margin-bottom: 16px;">
            <h2 style="margin: 0 0 4px 0; font-size: 16px;">Hi, I'm Shashank 👋</h2>
            <p style="margin: 0; font-size: 13px; color: #333;">I'm a Software Developer and this is my OS Based Portfolio</p>
          </div>

          <p><strong>How to use this OS Portfolio:</strong></p>
          <ul style="padding-left: 20px; margin-top: 8px;">
            <li><strong>This PC</strong> — You're here! A quick intro to the system.</li>
            <li><strong>Files</strong> — Browse folders, open wallpapers, and change the desktop background.</li>
            <li><strong>Resume</strong> — View my professional background and skills.</li>
            <li><strong>GitHub</strong> — Check out my projects and open-source work.</li>
            <li><strong>Research</strong> — My published scientific papers and contributions.</li>
            <li><strong>Paint</strong> — A simple drawing app to doodle around.</li>
            <li><strong>Calendar</strong> — Check today's date and time.</li>
            <li><strong>Trash</strong> — Where bugs and unused files go.</li>
          </ul>
        </div>
      `;
            createWindow('This PC', content, 500, 420);
            return;
        }

        if (id === 'resume') {
            content = `
                <div class="content-page">
                    <header class="resume-header">
                        <h1 class="resume-name">Shashank Shetgeri</h1>
                        <p class="resume-detail">shashankshetgeri@gmail.com | 9480128298 | <a href="https://www.linkedin.com/in/shashank-shetgeri-2434232b3/" target="_blank" style="color: #007bff;">LinkedIn</a> | <a href="https://github.com/spro047" target="_blank" style="color: #007bff;">GitHub</a> | Belgaum, Karnataka</p>
                    </header>

                    <section class="resume-section">
                        <h2 class="resume-section-title">Introduction</h2>
                        <p style="margin: 4px 0;">Computer Science Engineering student with hands-on experience in Web Designing, Artificial Intelligence, and Machine Learning through internships, projects, and research publications. Skilled in C/C++, with experience in developing responsive web applications and AI-driven healthcare solutions. Passionate about building scalable, high-impact systems and applying modern technologies to solve real-world problems.</p>
                    </section>

                    <section class="resume-section">
                        <h2 class="resume-section-title">Skills</h2>
                        <p class="resume-tech-label"><strong>Languages:</strong> C/C++</p>
                        <p class="resume-tech-label"><strong>Web Tools:</strong> Elementor, Wix</p>
                        <p class="resume-tech-label"><strong>DevOps &amp; Cloud:</strong> Docker, AWS, Git, GitHub</p>
                        <p class="resume-tech-label"><strong>Databases:</strong> MongoDB</p>
                    </section>

                    <section class="resume-section">
                        <h2 class="resume-section-title">Internships</h2>
                        <div class="resume-row">
                            <span>Technology Intern, Webrook – Remote</span>
                            <span>Jun 2025 – Aug 2025</span>
                        </div>
                        <ul class="resume-list">
                            <li>Designed and optimized responsive websites using Elementor and Wix, enhancing user experience across desktop and mobile platforms.</li>
                        </ul>
                        <div class="resume-row">
                            <span>Software Intern, Eyesec Cyber Security Solutions Pvt. Ltd. – Belagavi</span>
                            <span>Jan 2024 – Apr 2024</span>
                        </div>
                        <ul class="resume-list">
                            <li>Gained hands-on experience in cybersecurity by identifying security vulnerabilities and applying secure software development practices.</li>
                        </ul>
                        <div class="resume-row">
                            <span>Student Intern, Eyesec Cyber Security Solutions Pvt. Ltd. – Belagavi</span>
                            <span>Jan 2023 – Jul 2023</span>
                        </div>
                        <ul class="resume-list">
                            <li>Worked on Full Stack Development technologies. Assisted in developing and testing applications while gaining practical exposure to real-world project workflows.</li>
                        </ul>
                    </section>

                    <section class="resume-section">
                        <h2 class="resume-section-title">Projects</h2>
                        <div class="resume-row">
                            <span>Gender-Aware ADHD Detection Framework Using XGBoost and FLAML</span>
                            <span>WiDS Datathon 2025</span>
                        </div>
                        <ul class="resume-list">
                            <li>Developed a dual-model ADHD prediction framework using XGBoost and FLAML, achieving AUC scores of 0.77 for gender classification and 0.84 for ADHD prediction, leading to an MDPI research publication.</li>
                        </ul>
                        <div class="resume-row">
                            <span>Alzheimer's Disease Detection Using Deep Learning</span>
                        </div>
                        <ul class="resume-list">
                            <li>Developed and evaluated CNN, VGG16, ResNet50, DenseNet201, InceptionV3, and EfficientNet-B1 models for multi-class Alzheimer's disease classification using brain MRI scans.</li>
                        </ul>
                        <div class="resume-row">
                            <span>Knowledge Graph-Based Generative AI Assistant</span>
                        </div>
                        <ul class="resume-list">
                            <li>Built a Knowledge Graph-based RAG assistant to enhance contextual information retrieval and improve the relevance of AI-generated responses.</li>
                        </ul>
                        <div class="resume-row">
                            <span>Inventory Management System</span>
                        </div>
                        <ul class="resume-list">
                            <li>Developed and containerized an inventory management system using Docker and AWS, enabling scalable deployment and streamlined application management.</li>
                        </ul>
                    </section>

                    <section class="resume-section">
                        <h2 class="resume-section-title">Education</h2>
                        <div class="resume-row">
                            <span>KLE Technological University, Dr. M. S. Sheshgiri Campus</span>
                            <span>2024 – 2027</span>
                        </div>
                        <div class="resume-sub">Bachelor of Engineering (B.E.) in Computer Science and Engineering</div>
                        <div class="resume-row">
                            <span>KLS Shri Vasantrao Polytechnic</span>
                            <span>2021 – 2024</span>
                        </div>
                        <div class="resume-sub">Diploma in Computer Science and Engineering</div>
                    </section>

                    <section class="resume-section">
                        <h2 class="resume-section-title">Publications &amp; Achievement</h2>
                        <div class="resume-row">
                            <span>Gender-Aware ADHD Detection Framework Combining XGBoost and FLAML Models</span>
                            <span>Comput. Sci. Math. Forum (MDPI), 2025</span>
                        </div>
                        <ul class="resume-list">
                            <li>Published research on ADHD prediction using XGBoost, FLAML with multi-modal data fusion.</li>
                        </ul>
                        <div class="resume-row">
                            <span>Comparative Deep Neural Study For Stage-Wise Alzheimer's Disease Detection Using Brain MRI</span>
                            <span>Accepted / Publication Pending</span>
                        </div>
                        <ul class="resume-list">
                            <li>Conducted a comparative analysis of CNN, VGG16, ResNet50, DenseNet201, InceptionV3, and EfficientNet-B1 models for Alzheimer's stage classification using MRI scans.</li>
                        </ul>
                        <ul class="resume-list" style="margin-top: 8px;">
                            <li>Won 1st Place in Best DevOps Project Competition.</li>
                            <li>Solved 100+ DSA problems on LeetCode.</li>
                        </ul>
                    </section>
                </div>
            `;
            createWindow('Resume', content, 500, 500);
            return;
        }

        if (id === 'research') {
            content = `
                <div class="content-page">
                    <div class="research-paper">
                        <h2 class="research-title">Gender-Aware ADHD Detection Framework Combining XGBoost and FLAML Models</h2>
                        <p class="research-abstract"><strong>Abstract:</strong> A machine learning architecture is introduced to predict attention deficit hyperactivity disorder (ADHD) and biological sex from multimodal inputs. The problem sidesteps the clinical task of early ADHD detection and adds prediction of sex as a meta-feature to enhance robustness. Findings show that combining imaging-derived features and automated model selection yields a robust method of ADHD detection, underscoring the utility of multimodal data fusion in neuropsychiatric studies.</p>
                        <p class="research-keywords"><strong>Keywords:</strong> ADHD prediction; brain connectome; XGBoost; FLAML; machine learning</p>
                        <a href="https://www.mdpi.com/2813-0324/12/1/6" target="_blank" class="research-link">READ PAPER →</a>
                    </div>

                    <div class="research-paper">
                        <h2 class="research-title">Comparative Deep Neural Study For Stage-Wise Alzheimer's Disease Detection</h2>
                        <p class="research-abstract"><strong>Abstract:</strong> Alzheimer's disease(AD) is a progressive neurological condition in which reliable recognition of disease stage is important for planning treatment and follow up. This study investigates four stages using structural brain MRI from an ADNI-based dataset. The results show that carefully tuned 2D CNN architectures are sufficient for accurate stage-wise AD classification from MRI.</p>
                        <p class="research-keywords"><strong>Keywords:</strong> Alzheimer's disease(AD), ADNI, CNN, DenseNet201, VGG16, Multi-Class Classification.</p>
                    </div>
                </div>
            `;
            createWindow('Research Papers', content, 650, 500);
            return;
        }

        if (id === 'paint') {
            openPaint();
            return;
        }

        if (id === 'calendar') {
            const now = new Date();
            const month = now.toLocaleString('default', { month: 'long' });
            const year = now.getFullYear();
            const today = now.getDate();

            // Generate simple calendar grid
            const firstDay = new Date(year, now.getMonth(), 1).getDay();
            const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();

            let calendarHtml = `
                <div class="calendar-widget">
                    <div class="calendar-header">
                        <h2>${month} ${year}</h2>
                        <div class="calendar-badge">Today</div>
                    </div>
                    <div class="calendar-grid">
                        ${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => `<div class="calendar-day-header">${d}</div>`).join('')}
                        ${Array(firstDay).fill(null).map(() => `<div class="calendar-empty"></div>`).join('')}
                        ${Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const isToday = day === today;
                return `
                                <div class="calendar-cell">
                                    <span${isToday ? ' class="calendar-today"' : ''}>${day}</span>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
            createWindow('Calendar', calendarHtml, 450, 400);
            return;
        }

        createWindow(label || 'Window', content);
    });
});

// Dock Drag and Drop Logic
const dock = document.querySelector('.dock') as HTMLElement;
let draggedItem: HTMLElement | null = null;

document.querySelectorAll('.dock-item').forEach(item => {
    const dockItem = item as HTMLElement;

    dockItem.addEventListener('dragstart', (e) => {
        draggedItem = dockItem;
        dockItem.classList.add('dragging');
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            // Set a ghost image or just let the browser handle it
            e.dataTransfer.setData('text/plain', dockItem.id);
        }
    });

    dockItem.addEventListener('dragend', () => {
        draggedItem = null;
        dockItem.classList.remove('dragging');
        document.querySelectorAll('.dock-item').forEach(i => i.classList.remove('drag-over'));
    });

    dockItem.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';

        if (dockItem !== draggedItem) {
            dockItem.classList.add('drag-over');
        }
    });

    dockItem.addEventListener('dragleave', () => {
        dockItem.classList.remove('drag-over');
    });

    dockItem.addEventListener('drop', (e) => {
        e.preventDefault();
        dockItem.classList.remove('drag-over');

        if (draggedItem && draggedItem !== dockItem) {
            const allItems = Array.from(dock.querySelectorAll('.dock-item'));
            const draggedIndex = allItems.indexOf(draggedItem);
            const targetIndex = allItems.indexOf(dockItem);

            if (draggedIndex < targetIndex) {
                dockItem.after(draggedItem);
            } else {
                dockItem.before(draggedItem);
            }

            // Trigger a small animation reflow
            draggedItem.style.animation = 'none';
            draggedItem.offsetHeight; // trigger reflow
            draggedItem.style.animation = '';
        }
    });
});

// Start the app
runBootSequence().then(transitionToDesktop);
