import { createWindow } from './window-manager';
import { openTerminal } from './apps/terminal';
import { openPaint } from './apps/paint';
import { openFlappyBird } from './apps/flappy-bird';
import { openCalculator } from './apps/calculator';
import { openContactForm } from './apps/contact';
import { openMenuWindow } from './apps/menu';
import { openFilesWindow, openProjectsFolder } from './apps/files';

// DOM Refs
const monitorScreen = document.getElementById('screen');
const bootTerminal = document.getElementById('boot-terminal');
const desktop = document.getElementById('desktop');
const currentTime = document.getElementById('current-time');

// ============ Notification System ============
export function showNotification(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
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

// ============ Clock ============
function updateClock() {
    if (currentTime) {
        const now = new Date();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const day = days[now.getDay()];
        const date = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        currentTime.textContent = `${day} ${date} ${time} [BAT 98%]`;
    }
}

// ============ Wallpaper ============
export function setDesktopWallpaper(url: string) {
    if (desktop) {
        desktop.style.backgroundImage = `url('${url}')`;
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

export function openWallpaperFolder() {
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

    setTimeout(() => {
        document.querySelectorAll('.wallpaper-item').forEach(item => {
            item.addEventListener('dblclick', () => {
                const path = item.getAttribute('data-path');
                if (path) setDesktopWallpaper(path);
            });
        });
    }, 100);
}

// ============ Dark Mode ============
let darkMode = localStorage.getItem('dark-mode') === 'true';

function toggleDarkMode() {
    darkMode = !darkMode;
    const toggle = document.getElementById('dark-mode-toggle');
    if (desktop) desktop.classList.toggle('dark-mode', darkMode);
    if (toggle) toggle.innerHTML = darkMode
        ? '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7.5 1.5C4.5 1.5 2 4 2 7s2.5 5.5 5.5 5.5c.5 0 1-.1 1.5-.2-2-.8-3.5-3-3.5-5.3s1.5-4.5 3.5-5.3c-.5-.1-1-.2-1.5-.2z" fill="currentColor"/></svg>'
        : '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="3" fill="currentColor"/><path d="M7 0v2M7 12v2M0 7h2M12 7h2M2 2l1.5 1.5M10.5 10.5L12 12M2 12l1.5-1.5M10.5 3.5L12 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
    localStorage.setItem('dark-mode', String(darkMode));
    showNotification(darkMode ? 'Dark Mode enabled' : 'Light Mode enabled', 'info');
}

// ============ Context Menu ============
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

export function openSearch() {
    if (searchOverlay) { searchOverlay.remove(); searchOverlay = null; return; }

    const overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.innerHTML = `
        <div class="search-input-wrapper">
            <span class="search-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.5"/><path d="M9.5 9.5L13 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span>
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
        openProjectsFolder();
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

export function startScreensaverTimer() {
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

['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
    document.addEventListener(event, deactivateScreensaver);
});

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

// ============ Dock Click Handlers ============
function setupDockHandlers() {
    document.querySelectorAll('.dock-item').forEach(item => {
        item.addEventListener('click', () => {
            const label = item.getAttribute('data-label');
            const id = item.id;
            let content = 'Content Will be added here';

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

            if (id === 'projects') {
                openProjectsFolder();
                return;
            }

            if (id === 'this-pc') {
                const content = `
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
                const content = `
                    <div class="content-page">
                        <header class="resume-header">
                            <h1 class="resume-name">Shashank Shetgeri</h1>
                            <p class="resume-detail">shashankshetgeri@gmail.com | 9480128298 | <a href="https://www.linkedin.com/in/shashank-shetgeri-2434232b3/" target="_blank" style="color: #007bff;">LinkedIn</a> | <a href="https://github.com/spro047" target="_blank" style="color: #007bff;">GitHub</a> | Belgaum, Karnataka</p>
                        </header>
                        <section class="resume-section">
                            <h2 class="resume-section-title">Introduction</h2>
                            <p style="margin: 4px 0;">Computer Science Engineering student with hands-on experience in Web Designing, Artificial Intelligence, and Machine Learning through internships, projects, and research publications.</p>
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
                            <div class="resume-row"><span>Technology Intern, Webrook – Remote</span><span>Jun 2025 – Aug 2025</span></div>
                            <ul class="resume-list"><li>Designed and optimized responsive websites using Elementor and Wix.</li></ul>
                            <div class="resume-row"><span>Software Intern, Eyesec Cyber Security – Belagavi</span><span>Jan 2024 – Apr 2024</span></div>
                            <ul class="resume-list"><li>Gained hands-on experience in cybersecurity and secure development practices.</li></ul>
                            <div class="resume-row"><span>Student Intern, Eyesec Cyber Security – Belagavi</span><span>Jan 2023 – Jul 2023</span></div>
                            <ul class="resume-list"><li>Worked on Full Stack Development technologies and real-world project workflows.</li></ul>
                        </section>
                        <section class="resume-section">
                            <h2 class="resume-section-title">Projects</h2>
                            <div class="resume-row"><span>Gender-Aware ADHD Detection Framework Using XGBoost and FLAML</span><span>WiDS Datathon 2025</span></div>
                            <ul class="resume-list"><li>Developed a dual-model ADHD prediction framework achieving AUC scores of 0.77 and 0.84.</li></ul>
                            <div class="resume-row"><span>Alzheimer's Disease Detection Using Deep Learning</span></div>
                            <ul class="resume-list"><li>Evaluated CNN, VGG16, ResNet50, DenseNet201, InceptionV3, and EfficientNet-B1 for AD classification.</li></ul>
                            <div class="resume-row"><span>Knowledge Graph-Based Generative AI Assistant</span></div>
                            <ul class="resume-list"><li>Built a Knowledge Graph-based RAG assistant to enhance contextual information retrieval.</li></ul>
                            <div class="resume-row"><span>Inventory Management System</span></div>
                            <ul class="resume-list"><li>Developed and containerized an inventory management system using Docker and AWS.</li></ul>
                        </section>
                        <section class="resume-section">
                            <h2 class="resume-section-title">Education</h2>
                            <div class="resume-row"><span>KLE Technological University, Dr. M. S. Sheshgiri Campus</span><span>2024 – 2027</span></div>
                            <div class="resume-sub">Bachelor of Engineering (B.E.) in Computer Science and Engineering</div>
                            <div class="resume-row"><span>KLS Shri Vasantrao Polytechnic</span><span>2021 – 2024</span></div>
                            <div class="resume-sub">Diploma in Computer Science and Engineering</div>
                        </section>
                        <section class="resume-section">
                            <h2 class="resume-section-title">Publications &amp; Achievement</h2>
                            <div class="resume-row"><span>Gender-Aware ADHD Detection Framework Combining XGBoost and FLAML</span><span>Comput. Sci. Math. Forum (MDPI), 2025</span></div>
                            <ul class="resume-list"><li>Published research on ADHD prediction using XGBoost, FLAML with multi-modal data fusion.</li></ul>
                            <div class="resume-row"><span>Comparative Deep Neural Study For Stage-Wise Alzheimer's Disease Detection</span><span>Accepted / Publication Pending</span></div>
                            <ul class="resume-list"><li>Conducted a comparative analysis of deep learning models for AD stage classification using MRI.</li></ul>
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
                const content = `
                    <div class="content-page">
                        <div class="research-paper">
                            <h2 class="research-title">Gender-Aware ADHD Detection Framework Combining XGBoost and FLAML Models</h2>
                            <p class="research-abstract"><strong>Abstract:</strong> A machine learning architecture is introduced to predict ADHD and biological sex from multimodal inputs. Findings show that combining imaging-derived features and automated model selection yields a robust method of ADHD detection.</p>
                            <p class="research-keywords"><strong>Keywords:</strong> ADHD prediction; brain connectome; XGBoost; FLAML; machine learning</p>
                            <a href="https://www.mdpi.com/2813-0324/12/1/6" target="_blank" class="research-link">READ PAPER →</a>
                        </div>
                        <div class="research-paper">
                            <h2 class="research-title">Comparative Deep Neural Study For Stage-Wise Alzheimer's Disease Detection</h2>
                            <p class="research-abstract"><strong>Abstract:</strong> This study investigates four stages using structural brain MRI from an ADNI-based dataset. Results show that carefully tuned 2D CNN architectures are sufficient for accurate stage-wise AD classification.</p>
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

                const firstDay = new Date(year, now.getMonth(), 1).getDay();
                const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();

                const calendarHtml = `
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
                    return `<div class="calendar-cell"><span${isToday ? ' class="calendar-today"' : ''}>${day}</span></div>`;
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
}

// ============ Dock Drag and Drop ============
const dock = document.querySelector('.dock') as HTMLElement;
let draggedItem: HTMLElement | null = null;

function setupDockDragDrop() {
    document.querySelectorAll('.dock-item').forEach(item => {
        const dockItem = item as HTMLElement;

        dockItem.addEventListener('dragstart', (e) => {
            draggedItem = dockItem;
            dockItem.classList.add('dragging');
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
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

                draggedItem.style.animation = 'none';
                draggedItem.offsetHeight;
                draggedItem.style.animation = '';
            }
        });
    });
}

// ============ Transition to Desktop ============
export function transitionToDesktop() {
    // Stop CRT flicker effect
    monitorScreen?.classList.remove('boot-anim');
    bootTerminal!.classList.add('hidden');
    desktop!.classList.remove('hidden');
    updateClock();
    setInterval(updateClock, 1000);

    setupContextMenu();
    setupDockHandlers();
    setupDockDragDrop();

    if (darkMode) desktop?.classList.add('dark-mode');
    const darkToggle = document.getElementById('dark-mode-toggle');
    if (darkToggle) darkToggle.innerHTML = darkMode
        ? '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7.5 1.5C4.5 1.5 2 4 2 7s2.5 5.5 5.5 5.5c.5 0 1-.1 1.5-.2-2-.8-3.5-3-3.5-5.3s1.5-4.5 3.5-5.3c-.5-.1-1-.2-1.5-.2z" fill="currentColor"/></svg>'
        : '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="3" fill="currentColor"/><path d="M7 0v2M7 12v2M0 7h2M12 7h2M2 2l1.5 1.5M10.5 10.5L12 12M2 12l1.5-1.5M10.5 3.5L12 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

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
