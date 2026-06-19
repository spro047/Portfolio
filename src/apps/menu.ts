import { createWindow } from '../window-manager';
import { openCalculator } from './calculator';

export function openMenuWindow() {
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
            <img src="./img/Calculator_img.png" />
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
