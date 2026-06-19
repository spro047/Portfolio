export interface WindowEntry {
    id: string;
    title: string;
    minimized: boolean;
    element: HTMLElement;
}

export const windowRegistry: WindowEntry[] = [];

export function syncTaskbar() {
    // Taskbar UI was removed; function retained for registry bookkeeping
    windowRegistry.filter(w => document.body.contains(w.element));
}

let highestZIndex = 1000;

export function createWindow(title: string, content: string, width?: number, height?: number): string {
    const windowId = `win-${Date.now()}`;
    const win = document.createElement('div');
    win.className = 'window focusable-window';
    win.id = windowId;

    const winWidth = width || 400;
    const winHeight = height || 300;

    if (width) win.style.width = `${width}px`;
    if (height) win.style.height = `${height}px`;

    const monitorScreen = document.getElementById('screen');
    if (monitorScreen) {
        const screenWidth = monitorScreen.clientWidth;
        const screenHeight = monitorScreen.clientHeight;

        const centerX = (screenWidth - winWidth) / 2;
        const centerY = (screenHeight - winHeight) / 2;

        const offset = (Math.random() - 0.5) * 40;

        win.style.top = `${centerY + offset}px`;
        win.style.left = `${centerX + offset}px`;
    }

    win.style.zIndex = (++highestZIndex).toString();

    win.innerHTML = `
    <div class="window-header">
      <div class="window-title">${title}</div>
      <div class="window-controls">
        <div class="control minimize" onclick="this.closest('.window').classList.toggle('minimized')"></div>
        <div class="control maximize" onclick="this.closest('.window').classList.toggle('maximized')"></div>
        <div class="control close" onclick="this.closest('.window').remove()"></div>
      </div>
    </div>
    <div class="window-content">
      ${content}
    </div>
  `;

    win.addEventListener('mousedown', () => {
        win.style.zIndex = (++highestZIndex).toString();
    });

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

    header.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        isDragging = true;
        offsetX = touch.clientX - win.offsetLeft;
        offsetY = touch.clientY - win.offsetTop;
        win.style.zIndex = (++highestZIndex).toString();
        e.preventDefault();
    }, { passive: false });

    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    win.appendChild(resizer);

    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        e.stopPropagation();
        e.preventDefault();
    });

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
            const w = e.clientX - win.offsetLeft;
            const h = e.clientY - win.offsetTop;

            if (w > 200) win.style.width = `${w}px`;
            if (h > 150) win.style.height = `${h}px`;
        }
    }

    function handleTouchMove(e: TouchEvent) {
        const touch = e.touches[0];
        if (isDragging) {
            win.style.left = `${touch.clientX - offsetX}px`;
            win.style.top = `${touch.clientY - offsetY}px`;
        } else if (isResizing) {
            const w = touch.clientX - win.offsetLeft;
            const h = touch.clientY - win.offsetTop;

            if (w > 200) win.style.width = `${w}px`;
            if (h > 150) win.style.height = `${h}px`;
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

    const windowContainer = document.getElementById('window-container');
    windowContainer?.appendChild(win);

    const entry: WindowEntry = { id: windowId, title, minimized: false, element: win };
    windowRegistry.push(entry);
    syncTaskbar();

    const observer = new MutationObserver(() => {
        if (!document.body.contains(win)) {
            const idx = windowRegistry.findIndex(w => w.id === windowId);
            if (idx !== -1) windowRegistry.splice(idx, 1);
            syncTaskbar();
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return windowId;
}

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
