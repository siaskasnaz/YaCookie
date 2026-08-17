const form = document.getElementById('contactForm');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');
const statusDiv = document.getElementById('status');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    if (!email || !message) {
        showStatus('Заполните оба поля', 'error');
        return;
    }
    if (!email.includes('@') || !email.includes('.')) {
        showStatus('Введите корректный email', 'error');
        return;
    }

    submitBtn.disabled = true;
    showStatus('Отправка...', 'loading');

    setTimeout(() => {
        try {
            let messages = JSON.parse(localStorage.getItem('messages')) || [];
            messages.push({
                email: email,
                message: message,
                timestamp: new Date().toLocaleString('ru-RU')
            });
            localStorage.setItem('messages', JSON.stringify(messages));

            showStatus('Cookie успешно отправлены боту!', 'success');
            form.reset();
        } catch (err) {
            showStatus('Ошибка отправки', 'error');
        } finally {
            submitBtn.disabled = false;
        }
    }, 1000);
});

function showStatus(text, type) {
    statusDiv.textContent = text;
    statusDiv.className = type;
    statusDiv.style.display = 'block';
}
