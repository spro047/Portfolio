import { createWindow } from '../window-manager';

export function openTerminal() {
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
