// --- ИНТЕГРАЦИЯ С ВАШЕЙ ОПУБЛИКОВАННОЙ ТАБЛИЦЕЙ (ИСПРАВЛЕНО) ---
// Мы используем специальный формат tsv для опубликованных ссылок, чтобы обойти любые ошибки парсинга
const SPREADSHEET_URL = 'https://google.com';

async function fetchObjectsFromSheet() {
    const catalogGrid = document.getElementById('catalogGrid');
    if (!catalogGrid) return;

    try {
        const response = await fetch(SPREADSHEET_URL);
        const text = await response.text();
        
        // Разбиваем полученную таблицу на строки и ячейки
        const lines = text.split('\n');
        catalogGrid.innerHTML = ''; 

        // Перебираем строки, пропуская первую строку с заголовками (title, price...)
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // Пропускаем пустые строки
            
            const columns = lines[i].split('\t');
            
            const title = columns[0] ? columns[0].trim() : 'Без названия';
            const price = columns[1] ? columns[1].trim() : '0';
            const desc = columns[2] ? columns[2].trim() : '';
            let image = columns[3] ? columns[3].trim() : '';
            const tag = columns[4] ? columns[4].trim() : 'Объект';

            // Автоматическое исправление ссылок Яндекс Диска
            if (image.includes('disk.yandex.ru')) {
                image = image.replace('/i/', '/download/');
            }

            // Форматируем цену для красивого вида
            let formattedPrice = price;
            if (!isNaN(price.replace(/\s/g, ''))) {
                formattedPrice = Number(price.replace(/\s/g, '')).toLocaleString('ru-RU') + ' ₽';
            } else {
                formattedPrice = price + ' ₽';
            }

            const cardHTML = `
                <div class="apartment-card">
                    <div class="card-image" style="background-image: url('${image}')">
                        <span class="card-tag">${tag}</span>
                    </div>
                    <div class="card-info">
                        <h3>${title}</h3>
                        <p class="card-price">${formattedPrice}</p>
                        <p class="card-desc">${desc}</p>
                        <button class="btn-view" onclick="openModal('${title}')">Узнать подробнее</button>
                    </div>
                </div>
            `;
            catalogGrid.insertAdjacentHTML('beforeend', cardHTML);
        }
    } catch (error) {
        console.error('Ошибка выгрузки каталога:', error);
        catalogGrid.innerHTML = '<p style="color: var(--gray); text-align: center; grid-column: 1/-1;">Не удалось загрузить объекты.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchObjectsFromSheet();

    // --- ЛОГИКА МОДАЛЬНОГО ОКНА ДЛЯ ЗАЯВОК ---
    const modal = document.getElementById('realtyModal');
    const modalName = document.getElementById('modalObjectName');
    const closeBtn = document.getElementById('closeModalBtn');

    window.openModal = (objectTitle) => {
        modalName.textContent = objectTitle;
        modal.style.display = 'flex';
    };

    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // --- ЛОГИКА ЧАТА С ИИ-АССИСТЕНТОМ ---
    const aiButton = document.getElementById('aiButton');
    const aiChatWindow = document.getElementById('aiChatWindow');
    const closeAiChat = document.getElementById('closeAiChat');
    const aiInput = document.getElementById('aiInput');
    const sendAiMessage = document.getElementById('sendAiMessage');
    const aiChatBody = document.querySelector('.ai-chat-body');

    aiButton.addEventListener('click', () => {
        const isOpen = aiChatWindow.style.display === 'flex';
        aiChatWindow.style.display = isOpen ? 'none' : 'flex';
    });
    closeAiChat.addEventListener('click', (e) => {
        e.stopPropagation();
        aiChatWindow.style.display = 'none';
    });

    function handleAiSend() {
        const text = aiInput.value.trim();
        if (!text) return;
        appendMessage(text, 'user');
        aiInput.value = '';
        setTimeout(() => {
            appendMessage(generateAiResponse(text), 'bot');
        }, 800);
    }

    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.textContent = text;
        aiChatBody.appendChild(msgDiv);
        aiChatBody.scrollTop = aiChatBody.scrollHeight;
    }

    function generateAiResponse(input) {
        const query = input.toLowerCase();
        if (query.includes('привет') || query.includes('здравствуй')) {
            return "Приветствую! Я виртуальный аналитик Александра Громова. Ищете квартиру для жизни или инвестиций?";
        }
        if (query.includes('цен') || query.includes('сколько стоит') || query.includes('бюджет')) {
            return "Александр работает с объектами от 40 млн ₽. Подсказать стоимость квадратного метра в Сити?";
        }
        if (query.includes('сити') || query.includes('апартамент') || query.includes('центр')) {
            return "В Москва-Сити сейчас есть 3 закрытых пентхауса с окупаемостью от 9% годовых. Оставьте заявку на презентацию!";
        }
        return "Отличный запрос. Я передал критерии Александра Громову. Оставьте контакты в форме на сайте, и он свяжется с вами лично!";
    }

    sendAiMessage.addEventListener('click', handleAiSend);
    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAiSend();
    });
});

function handleFormSubmit(event) {
    event.preventDefault();
    alert('Заявка принята! Александр Громов свяжется с вами в течение 10 минут.');
    event.target.reset();
}

function handleModalSubmit(event) {
    event.preventDefault();
    alert('Запрос принят! Персональная презентация отправлена.');
    document.getElementById('realtyModal').style.display = 'none';
    event.target.reset();
}
