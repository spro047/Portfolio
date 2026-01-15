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
    bootTerminal!.classList.add('hidden');
    desktop!.classList.remove('hidden');
    updateClock();
    setInterval(updateClock, 1000);

    // Auto-open This PC window
    const thisPCContent = `
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
    createWindow('This PC', thisPCContent);
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
        <div class="control minimize"></div>
        <div class="control maximize"></div>
        <div class="control close" onclick="this.closest('.window').remove()"></div>
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

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            win.style.left = `${e.clientX - offsetX}px`;
            win.style.top = `${e.clientY - offsetY}px`;
        } else if (isResizing) {
            const width = e.clientX - win.offsetLeft;
            const height = e.clientY - win.offsetTop;

            if (width > 200) win.style.width = `${width}px`;
            if (height > 150) win.style.height = `${height}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        isResizing = false;
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
                <img src="./img/Sub_folders.png" alt="Folder" />
                <span class="file-label">Wallpaper</span>
            </div>
            <div class="file-item folder-item">
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
        html += '<p style="text-align:center; width:100%; grid-column: 1/-1; padding: 20px;">No saved paints found.</p>';
    } else {
        paintNames.forEach(name => {
            html += `
                <div class="file-item paint-file-item" data-name="${name}">
                    <img src="${savedPaints[name]}" style="width:48px; height:48px; object-fit:cover; border:1px solid #000;" />
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
        { name: "Portfolio", description: "The Portfolio repository serves as a personal showcase of your skills, projects, and accomplishments, built using TypeScript and modern web development practices. It likely includes responsive design elements, interactive components, and organized sections for About, Projects, Skills, and Contact. The project demonstrates your ability to structure a complete frontend application, integrate styling frameworks or custom CSS, and deploy a web presence. It emphasizes your proficiency in web technologies, accessibility, and performance optimization. This portfolio acts as a central platform to present your work to potential employers or collaborators, highlighting coding standards, creativity, and user experience considerations." },
        { name: "Password_Manager_Project", description: "The Portfolio repository serves as a personal showcase of your skills, projects, and accomplishments, built using TypeScript and modern web development practices. It likely includes responsive design elements, interactive components, and organized sections for About, Projects, Skills, and Contact. The project demonstrates your ability to structure a complete frontend application, integrate styling frameworks or custom CSS, and deploy a web presence. It emphasizes your proficiency in web technologies, accessibility, and performance optimization. This portfolio acts as a central platform to present your work to potential employers or collaborators, highlighting coding standards, creativity, and user experience considerations." },
        { name: "XXS_Project", description: "XXS_Project (likely intended as XSS_Project) explores the concept of cross-site scripting vulnerabilities and defenses using Python. It probably contains examples of vulnerable code, exploitation techniques, and remediation practices such as sanitization and encoding. The project demonstrates your awareness of web security threats and the practical application of secure coding techniques. It may include test cases, demonstration scripts, and documentation explaining how various inputs can lead to script injection if unchecked. Through this repository, you illustrate an understanding of vulnerability assessment, secure backend handlers, and mitigation strategies essential for protecting web applications against client-side attacks." },
        { name: "Route_OP", description: "Route_OP appears to be a Python-based project focused on routing optimization, pathfinding, or operations involving network routes. It could implement algorithms such as Dijkstra’s, A* search, or graph traversal techniques to compute optimal paths. This repository shows your grasp of algorithm design, data structures, and efficient computation. It might include visualizations, sample datasets, and comparison of algorithm performance under different scenarios. The project illustrates analytical problem-solving skills and the ability to translate abstract computational concepts into working code. It is relevant to logistics, navigation systems, and operations research, reflecting an intersection of theory and practical implementation." },
        { name: "MRI_Project", description: "MRI_Project is a Jupyter Notebook repository likely focused on medical imaging analysis or machine learning with MRI data. It could include data preprocessing, visualization, and model training for classification or segmentation tasks. The project shows experience in scientific computing, use of libraries like NumPy, Pandas, and imaging tools, and potentially deep learning frameworks. It emphasizes handling complex multidimensional data, interpreting results, and documenting research steps. This repo demonstrates capabilities in data science, health-tech exploration, and reproducible analysis workflows. It reflects your interest in applying computational techniques to real-world scientific problems, bridging domain knowledge with technical execution." },
        { name: "Travel_Planner_Project", description: "The Travel_Planner_Project repository suggests a web-based itinerary planner built with HTML and potentially additional scripting for interactive features. It likely includes destination selection, scheduling, and personalized trip recommendations. The project demonstrates your ability to structure content, use forms, and design UX flow for planning travel. With static HTML or integrated logic, it may support dynamic suggestions, cost estimations, or user preferences. This repository showcases frontend development skills, attention to usability, and creative problem solving. It simulates a practical application idea that organizes travel plans, illustrating how you can communicate complex information clearly using intuitive interfaces and foundational web technologies." },
        { name: "Course_Reg", description: "Course_Reg, developed with EJS, appears to be a course registration system where users can select, register, or manage academic courses. The project likely includes form handling, server-side routing, and database integration to maintain student choices. Using EJS templates, it dynamically renders available courses and user feedback, demonstrating full-stack web development skills. It emphasizes real-world application logic, state persistence, and responsive interaction. The repository highlights your ability to construct educational tools that mirror real administrative tasks, incorporating backend processes and frontend rendering. This project displays competence in building structured web applications with templating engines and logic integration." },
        { name: "New_LeaderBoard", description: "New_LeaderBoard is a JavaScript repository that implements a scoring board application, where users’ scores are added, displayed, and sorted dynamically. It likely demonstrates DOM manipulation, event handling, and persistent state using local storage or APIs. The project showcases interactive interface development, real-time updates, and modular code organization. It might include features to reset, filter, or update scores seamlessly, emphasizing responsiveness and UX design. This repository serves as an example of managing application state in the browser, crafting user interactions, and applying core JavaScript concepts. It reflects foundational frontend engineering skills in building engaging web components." }
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
                    <div style="font-family: 'Inter', sans-serif; padding: 10px; color: #000;">
                        <h2 style="margin-bottom: 15px; border-bottom: 2px solid #000; font-weight: 800; text-transform: uppercase; font-size: 18px;">${name}</h2>
                        <p style="line-height: 1.6; font-size: 14px; text-align: justify;">${desc}</p>
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
                    <div class="paint-tool active" data-tool="pencil" title="Pencil">✎</div>
                    <div class="paint-tool" data-tool="brush" title="Brush">🖌</div>
                    <div class="paint-tool" data-tool="eraser" title="Eraser">⌫</div>
                    <div class="paint-tool" data-tool="line" title="Line">╱</div>
                    <div class="paint-tool" data-tool="rect" title="Rectangle">□</div>
                    <div class="paint-tool" data-tool="ellipse" title="Ellipse">○</div>
                    <div class="paint-tool" data-tool="picker" title="Color Picker">⚗</div>
                    <div class="paint-tool" data-tool="clear" title="Clear Canvas">⊗</div>
                    <div class="paint-tool" data-tool="undo" title="Undo">⟲</div>
                    <div class="paint-tool" data-tool="redo" title="Redo">⟳</div>
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
    const html = `
        <div class="calculator">
            <div class="calc-display" id="calc-display">0</div>
            <div class="calc-buttons">
                <!-- Row 1: Clear and Divide -->
                <div class="calc-btn btn-red" style="grid-column: span 3;" onclick="window.calcClear()">C</div>
                <div class="calc-btn btn-orange" onclick="window.calcOp('/')">/</div>
                
                <!-- Row 2: 7, 8, 9, Multiply -->
                <div class="calc-btn btn-grey" onclick="window.calcNum('7')">7</div>
                <div class="calc-btn btn-grey" onclick="window.calcNum('8')">8</div>
                <div class="calc-btn btn-grey" onclick="window.calcNum('9')">9</div>
                <div class="calc-btn btn-orange" onclick="window.calcOp('*')">×</div>
                
                <!-- Row 3: 4, 5, 6, Subtract -->
                <div class="calc-btn btn-grey" onclick="window.calcNum('4')">4</div>
                <div class="calc-btn btn-grey" onclick="window.calcNum('5')">5</div>
                <div class="calc-btn btn-grey" onclick="window.calcNum('6')">6</div>
                <div class="calc-btn btn-orange" onclick="window.calcOp('-')">-</div>
                
                <!-- Row 4: 1, 2, 3, Add -->
                <div class="calc-btn btn-grey" onclick="window.calcNum('1')">1</div>
                <div class="calc-btn btn-grey" onclick="window.calcNum('2')">2</div>
                <div class="calc-btn btn-grey" onclick="window.calcNum('3')">3</div>
                <div class="calc-btn btn-orange" onclick="window.calcOp('+')">+</div>
                
                <!-- Row 5: 0, Dot, Equal -->
                <div class="calc-btn btn-grey" onclick="window.calcNum('0')">0</div>
                <div class="calc-btn btn-grey" onclick="window.calcNum('.')">.</div>
                <div class="calc-btn btn-green" style="grid-column: span 2;" onclick="window.calcEqual()">=</div>
            </div>
        </div>
    `;

    createWindow('Calculator', html, 320, 480);

    // Calculator Logic
    let currentInput = '0';
    let previousInput = '';
    let operation: string | null = null;
    let shouldResetScreen = false;

    const updateDisplay = () => {
        const display = document.getElementById('calc-display');
        if (!display) return;

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

    (window as any).calcNum = (num: string) => {
        if (currentInput === '0' || shouldResetScreen) {
            currentInput = num;
            shouldResetScreen = false;
        } else {
            currentInput += num;
        }
        updateDisplay();
    };

    (window as any).calcOp = (op: string) => {
        if (operation !== null && !shouldResetScreen) {
            (window as any).calcEqual();
        }
        previousInput = currentInput;
        operation = op;
        shouldResetScreen = true;
        updateDisplay();
    };

    (window as any).calcClear = () => {
        currentInput = '0';
        previousInput = '';
        operation = null;
        shouldResetScreen = false;
        updateDisplay();
    };

    (window as any).calcEqual = () => {
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

        if (id === 'resume') {
            content = `
                <div style="font-family: 'Inter', sans-serif; color: #000; line-height: 1.4;">
                    <header style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
                        <h1 style="font-size: 24px; margin: 0; font-weight: 800;">Shashank Shetgeri</h1>
                        <p style="font-size: 11px; margin: 5px 0;">India • shashankshetgeri@gmail.com • +91 9480128298</p>
                        <p style="font-size: 11px; margin: 0;">linkedin.com/in/shashank-shetgeri • github.com/spro047</p>
                    </header>

                    <section style="margin-bottom: 15px;">
                        <h2 style="font-size: 14px; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 8px; font-weight: 800;">Education</h2>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700;">
                            <span>KLE Technological University, Dr. M. S. Sheshgiri Campus</span>
                            <span>Expected Apr 2027</span>
                        </div>
                        <div style="font-size: 12px; margin-bottom: 5px;">BE in Computer Science and Engineering</div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700;">
                            <span>KLS's Shri Vasantrao Polytechnic</span>
                            <span>Apr 2024</span>
                        </div>
                        <div style="font-size: 12px;">Diploma in Computer Science and Engineering</div>
                    </section>

                    <section style="margin-bottom: 15px;">
                        <h2 style="font-size: 14px; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 8px; font-weight: 800;">Experience</h2>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700;">
                            <span>Student Intern, Eyesec Cyber Security Solutions</span>
                            <span>Jan 2023 – July 2023</span>
                        </div>
                        <ul style="font-size: 11px; margin: 3px 0 8px 15px;">
                            <li>Focused on Data Science, AIML, and Full Stack technologies.</li>
                        </ul>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700;">
                            <span>Software Intern (Cyber Security), Eyesec</span>
                            <span>Jan 2024 – Apr 2024</span>
                        </div>
                        <ul style="font-size: 11px; margin: 3px 0 0 15px;">
                            <li>Practical exposure to threat modeling and application-level security.</li>
                        </ul>
                    </section>

                    <section style="margin-bottom: 15px;">
                        <h2 style="font-size: 14px; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 8px; font-weight: 800;">Projects</h2>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700;">
                            <span>Gender-Aware ADHD Detection Framework</span>
                            <span>WiDS Datathon 2025</span>
                        </div>
                        <ul style="font-size: 11px; margin: 3px 0 8px 15px;">
                            <li>Led a team of 6 to develop a dual-model ADHD prediction system using brain connectomes.</li>
                            <li>Gender classifier (XGBoost): AUC 0.77; ADHD predictor (FLAML): AUC 0.84.</li>
                        </ul>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700;">
                            <span>Automated XSS Vulnerability Scanner</span>
                            <span>Cyber Security Toolkit</span>
                        </div>
                        <ul style="font-size: 11px; margin: 3px 0 0 15px;">
                            <li>Developed a GUI-based tool that automates XSS detection in web applications.</li>
                            <li>Engineered payload injection using BeautifulSoup and Requests.</li>
                        </ul>
                    </section>

                    <section style="margin-bottom: 15px;">
                        <h2 style="font-size: 14px; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 8px; font-weight: 800;">Technologies</h2>
                        <p style="font-size: 11px; margin: 0;"><strong>Languages:</strong> Python, SQL, JavaScript, C, Java, HTML/CSS, PHP</p>
                        <p style="font-size: 11px; margin: 3px 0 0 0;"><strong>Tools:</strong> XGBoost, FLAML, Pandas, NumPy, Matplotlib, Scikit-learn, Git, Bootstrap</p>
                    </section>
                </div>
            `;
            createWindow('Resume', content, 600, 650);
            return;
        }

        if (id === 'research') {
            content = `
                <div style="font-family: 'Inter', sans-serif;">
                    <div style="margin-bottom: 25px; border-bottom: 2px solid #000; padding-bottom: 15px;">
                        <h2 style="font-size: 18px; color: #000; margin-bottom: 8px; font-weight: 800; text-transform: uppercase;">Gender-Aware ADHD Detection Framework Combining XGBoost and FLAML Models</h2>
                        <p style="font-size: 14px; color: #333; margin-bottom: 12px; line-height: 1.6;"><strong>Abstract:</strong> A machine learning architecture is introduced to predict attention deficit hyperactivity disorder (ADHD) and biological sex from multimodal inputs. The problem sidesteps the clinical task of early ADHD detection and adds prediction of sex as a meta-feature to enhance robustness. Findings show that combining imaging-derived features and automated model selection yields a robust method of ADHD detection, underscoring the utility of multimodal data fusion in neuropsychiatric studies.</p>
                        <p style="font-size: 13px; color: #555; margin-bottom: 12px;"><strong>Keywords:</strong> ADHD prediction; brain connectome; XGBoost; FLAML; machine learning</p>
                        <a href="https://www.mdpi.com/2813-0324/12/1/6" target="_blank" style="display: inline-block; background: #000; color: #fff; padding: 6px 12px; text-decoration: none; font-size: 12px; font-weight: bold; border-radius: 4px;">READ PAPER →</a>
                    </div>

                    <div>
                        <h2 style="font-size: 18px; color: #000; margin-bottom: 8px; font-weight: 800; text-transform: uppercase;">Comparative Deep Neural Study For Stage-Wise Alzheimer’s Disease Detection</h2>
                        <p style="font-size: 14px; color: #333; margin-bottom: 12px; line-height: 1.6;"><strong>Abstract:</strong> Alzheimer's disease(AD) is a progressive neurological condition in which reliable recognition of disease stage is important for planning treatment and follow up. This study investigates four stages using structural brain MRI from an ADNI-based dataset. The results show that carefully tuned 2D CNN architectures are sufficient for accurate stage-wise AD classification from MRI.</p>
                        <p style="font-size: 13px; color: #555;"><strong>Keywords:</strong> Alzheimer's disease(AD), ADNI, CNN, DenseNet201, VGG16, Multi-Class Classification.</p>
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
                <div style="font-family: 'Inter', sans-serif; height: 100%; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h2 style="margin: 0; font-weight: 800; color: #4285f4;">${month} ${year}</h2>
                        <div style="background: #4285f4; color: #fff; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold;">Today</div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: #eee; border: 1px solid #ddd;">
                        ${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => `<div style="background: #f8f9fa; padding: 10px 0; text-align: center; font-size: 11px; font-weight: 700; color: #70757a;">${d}</div>`).join('')}
                        ${Array(firstDay).fill(null).map(() => `<div style="background: #fff; height: 40px;"></div>`).join('')}
                        ${Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const isToday = day === today;
                return `
                                <div style="background: #fff; height: 40px; border: 1px solid #f1f3f4; padding: 4px; position: relative;">
                                    <span style="font-size: 12px; ${isToday ? 'background: #4285f4; color: #fff; width: 22px; height: 22px; line-height: 22px; border-radius: 50%; display: inline-block; text-align: center;' : ''}">${day}</span>
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
