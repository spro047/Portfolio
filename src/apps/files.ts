import { createWindow } from '../window-manager';

export function openFilesWindow() {
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

    setTimeout(() => {
        document.getElementById('folder-wallpaper')?.addEventListener('click', async () => {
            const { openWallpaperFolder } = await import('../desktop');
            openWallpaperFolder();
        });
        document.getElementById('folder-documents')?.addEventListener('click', () => {
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
                document.getElementById('file-resume-pdf')?.addEventListener('dblclick', async () => {
                    const { showNotification } = await import('../desktop');
                    showNotification('Open the Resume from the dock to view it.', 'info');
                });
            }, 100);
        });
        document.getElementById('folder-paints')?.addEventListener('click', () => {
            openPaintsFolder();
        });
        document.getElementById('folder-projects')?.addEventListener('click', () => {
            openProjectsFolder();
        });
    }, 100);
}

export function openPaintsFolder() {
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

export function openProjectsFolder() {
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
