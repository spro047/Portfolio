import { createWindow } from '../window-manager';

export function openPaint() {
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
