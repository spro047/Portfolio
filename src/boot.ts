export const asciiLogo = `
  ██████  ██   ██  █████  ███████ ██   ██  █████  ███    ██ ██   ██ 
 ██       ██   ██ ██   ██ ██      ██   ██ ██   ██ ████   ██ ██  ██  
  █████   ███████ ███████ ███████ ███████ ███████ ██ ██  ██ █████   
      ██  ██   ██ ██   ██      ██ ██   ██ ██   ██ ██  ██ ██ ██  ██  
  ██████  ██   ██ ██   ██ ███████ ██   ██ ██   ██ ██   ████ ██   ██ 
  
          S Y S T E M   L O A D I N G   -   V E R S I O N   2 . 0
`;

const bootMessages = [
    { text: "Initializing NUKE Kernel...", type: 'info' as const },
    { text: "CPU: Intel Core i9-12900K @ 5.2GHz", type: 'ok' as const },
    { text: "RAM: 64GB DDR5 4800MHz [PASSED]", type: 'ok' as const },
    { text: "NVMe: Samsung 980 Pro 2TB [MOUNTED]", type: 'ok' as const },
    { text: "Security: Encrypted SSL Tunnel established", type: 'ok' as const },
    { text: "Loading OS Micro-kernel extensions...", type: 'info' as const },
    { text: "User 'SHASHANK SHETGERI' logged in via terminal.", type: 'ok' as const },
    { text: "Starting Pulse Desktop Environment...", type: 'info' as const }
];

async function addTerminalLine(message: string, statusType?: string) {
    const terminalContent = document.getElementById('terminal-content');
    if (!terminalContent) return;

    const line = document.createElement('div');
    line.className = 'terminal-line';

    let statusHtml = '';
    if (statusType === 'ok') statusHtml = '<span class="status-tag status-ok">[ OK ]</span>';
    else if (statusType === 'info') statusHtml = '<span class="status-tag status-info">[INFO]</span>';
    else if (statusType === 'warn') statusHtml = '<span class="status-tag status-warn">[WARN]</span>';

    line.innerHTML = `${statusHtml}<span class="line-text"></span>`;
    terminalContent.appendChild(line);

    const textSpan = line.querySelector('.line-text');
    return new Promise<void>((resolve) => {
        let i = 0;
        const interval = setInterval(() => {
            if (i < message.length) {
                if (textSpan) textSpan.textContent += message[i];
                i++;
            } else {
                clearInterval(interval);
                resolve();
            }
        }, 12);
    });
}

export async function runBootSequence(): Promise<void> {
    const monitorScreen = document.getElementById('screen');
    const terminalContent = document.getElementById('terminal-content');
    const loadingContainer = document.getElementById('loading-container');
    const loadingBar = document.getElementById('loading-bar');
    const loadingPercentage = document.getElementById('loading-percentage');

    monitorScreen?.classList.add('boot-anim');

    const logoDiv = document.createElement('pre');
    logoDiv.className = 'ascii-logo';
    logoDiv.textContent = asciiLogo;
    terminalContent?.appendChild(logoDiv);
    await new Promise(r => setTimeout(r, 600));

    for (const msg of bootMessages) {
        await addTerminalLine(msg.text, msg.type);
        await new Promise(r => setTimeout(r, 150));
    }

    if (loadingContainer) loadingContainer.classList.remove('hidden');
    let progress = 0;
    const startTime = Date.now();
    const duration = 2500;

    return new Promise<void>((resolve) => {
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            progress = Math.min((elapsed / duration) * 100, 100);

            if (loadingBar) loadingBar.style.width = `${progress}%`;
            if (loadingPercentage) loadingPercentage.textContent = `${Math.floor(progress)}%`;

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(resolve, 400);
            }
        }, 50);
    });
}
