// ===== НАСТРОЙКИ GITHUB (обязательно замените на свои) =====
const GITHUB_TOKEN = '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';          // Personal Access Token (classic) с правами repo
const REPO_OWNER = 'siaskasnaz';                 // ваш логин на GitHub
const REPO_NAME = 'YaCookie-messages';           // имя ПРИВАТНОГО репозитория
const FILE_PATH = 'messages.json';              // имя файла для хранения сообщений
const BRANCH = 'main';                          // основная ветка

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С GITHUB API =====

// Получение текущего содержимого файла
async function getFileContent() {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    if (response.status === 404) {
        return null; // файл ещё не создан
    }
    if (!response.ok) {
        throw new Error(`Ошибка чтения: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    const content = atob(data.content);
    return {
        sha: data.sha,
        content: JSON.parse(content)
    };
}

// Обновление или создание файла
async function updateFile(contentArray, sha = null) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const payload = {
        message: 'Новое сообщение с сайта',
        content: btoa(JSON.stringify(contentArray, null, 2)),
        branch: BRANCH
    };
    if (sha) {
        payload.sha = sha;
    }
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Ошибка записи: ${err.message || response.statusText}`);
    }
    return await response.json();
}

// ===== ЛОГИКА ФОРМЫ =====
const form = document.getElementById('contactForm');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');
const statusDiv = document.getElementById('status');

form.addEventListener('submit', async (e) => {
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
    showStatus('Сохранение...', 'loading');

    try {
        // 1. Получить текущие сообщения
        let fileData = await getFileContent();
        let messages = [];
        let sha = null;
        if (fileData) {
            messages = fileData.content;
            sha = fileData.sha;
            if (!Array.isArray(messages)) {
                messages = [];
            }
        }
        // 2. Добавить новое
        messages.push({
            email: email,
            message: message,
            timestamp: new Date().toISOString()
        });
        // 3. Обновить файл
        await updateFile(messages, sha);

        showStatus('✅ Сообщение сохранено в приватном репозитории!', 'success');
        form.reset();
    } catch (error) {
        showStatus('❌ Ошибка: ' + error.message, 'error');
        console.error(error);
    } finally {
        submitBtn.disabled = false;
    }
});

function showStatus(text, type) {
    statusDiv.textContent = text;
    statusDiv.className = type;
    statusDiv.style.display = 'block';
}
