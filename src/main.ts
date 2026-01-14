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
    { text: "User 'Shashank' logged in via terminal.", type: 'ok' },
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

        createWindow(label || 'Window', content);
    });
});

// Start the app
runBootSequence().then(transitionToDesktop);
