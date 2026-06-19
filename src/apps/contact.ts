import { createWindow } from '../window-manager';

export function openContactForm() {
    const formId = 'contact-form-' + Date.now();

    const html = `
        <div class="contact-form">
            <div style="margin-bottom: 16px;">
                <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;color:#333;">Name</label>
                <input type="text" id="${formId}-name" class="contact-input" placeholder="Your name" required />
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;color:#333;">Email</label>
                <input type="email" id="${formId}-email" class="contact-input" placeholder="you@example.com" required />
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;color:#333;">Subject</label>
                <input type="text" id="${formId}-subject" class="contact-input" placeholder="What's this about?" />
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;color:#333;">Message</label>
                <textarea id="${formId}-message" class="contact-textarea" placeholder="Write your message..." required></textarea>
            </div>
            <div style="display:flex;gap:8px;justify-content:flex-end;">
                <button class="contact-btn contact-btn-cancel" id="${formId}-cancel">Cancel</button>
                <button class="contact-btn contact-btn-send" id="${formId}-send">Send</button>
            </div>
            <div id="${formId}-status" class="contact-status hidden"></div>
        </div>
    `;

    createWindow('Contact Me', html, 420, 440);

    setTimeout(() => {
        const sendBtn = document.getElementById(`${formId}-send`);
        const cancelBtn = document.getElementById(`${formId}-cancel`);
        const statusEl = document.getElementById(`${formId}-status`);

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                const win = cancelBtn.closest('.window');
                if (win) win.remove();
            });
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', async () => {
                const name = (document.getElementById(`${formId}-name`) as HTMLInputElement)?.value.trim();
                const email = (document.getElementById(`${formId}-email`) as HTMLInputElement)?.value.trim();
                const subject = (document.getElementById(`${formId}-subject`) as HTMLInputElement)?.value.trim();
                const message = (document.getElementById(`${formId}-message`) as HTMLTextAreaElement)?.value.trim();

                if (!name || name.length < 2) {
                    if (statusEl) { statusEl.textContent = 'Please enter your name (min 2 characters).'; statusEl.className = 'contact-status contact-error'; }
                    return;
                }
                if (!email || !email.includes('@')) {
                    if (statusEl) { statusEl.textContent = 'Please enter a valid email address.'; statusEl.className = 'contact-status contact-error'; }
                    return;
                }
                if (!message || message.length < 10) {
                    if (statusEl) { statusEl.textContent = 'Please write a message (min 10 characters).'; statusEl.className = 'contact-status contact-error'; }
                    return;
                }

                sendBtn.textContent = 'Sending...';
                (sendBtn as HTMLButtonElement).disabled = true;

                try {
                    const apiUrl = '/api/contact';
                    const res = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, subject, message }),
                    });

                    const data = await res.json();

                    if (res.ok) {
                        if (statusEl) {
                            statusEl.textContent = data.message || 'Message sent!';
                            statusEl.className = 'contact-status contact-success';
                        }
                        sendBtn.textContent = 'Sent!';
                        document.querySelectorAll(`[id^="${formId}"]`).forEach(el => {
                            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                                (el as HTMLInputElement).value = '';
                            }
                        });
                    } else {
                        const detail = data.details ? data.details.join(', ') : data.error || 'Something went wrong.';
                        if (statusEl) { statusEl.textContent = detail; statusEl.className = 'contact-status contact-error'; }
                        sendBtn.textContent = 'Send';
                        (sendBtn as HTMLButtonElement).disabled = false;
                    }
                } catch {
                    if (statusEl) { statusEl.textContent = 'Network error. Please try again later.'; statusEl.className = 'contact-status contact-error'; }
                    sendBtn.textContent = 'Send';
                    (sendBtn as HTMLButtonElement).disabled = false;
                }
            });
        }
    }, 50);
}
