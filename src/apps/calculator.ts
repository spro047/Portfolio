import { createWindow } from '../window-manager';

export function openCalculator() {
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
