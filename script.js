// --- ИНТЕГРАЦИЯ С ВАШЕЙ GOOGLE ТАБЛИЦЕЙ ---
const SHEET_ID = '1vRxp_DgpWaW_EdGioUzRVe81YWIiSNTsX5kbq0FibgyfxEnqsJOuOVcMzKyPUy3XcpSfco2BXHHohLe';
const SHEET_TITLE = 'Лист1'; 
const SPREADSHEET_URL = `https://google.com{SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_TITLE}`;

async function fetchObjectsFromSheet() {
    const catalogGrid = document.getElementById('catalogGrid');
    if (!catalogGrid) return;

    try {
        const response = await fetch(SPREADSHEET_URL);
        const text = await response.text();
        const jsonData = JSON.parse(text.substr(47).slice(0, -2));
        const rows = jsonData.table.rows;
        
        catalogGrid.innerHTML = ''; 

        rows.forEach(row => {
            if (!row.c || !row.c[0]) return; // Пропускаем пустые строки

            const title = row.c[0] ? row.c[0].v : 'Без названия';
            const price = row.c[1] ? row.c[1].v : 0;
            const desc = row.c[2] ? row.c[2].v : '';
            let image = row.c[3] ? row.c[3].v : '';
            const tag = row.c[4] ? row.c[4].v : 'Объект';

            if (image.includes('disk.yandex.ru')) {
                image = image.replace('/i/', '/download/');
            }

            const formattedPrice = typeof price === 'number' 
                ? price.toLocaleString('ru-RU') + ' ₽' 
                : price + ' ₽';

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
        });
    } catch (error) {
        console.error('Ошибка выгрузки каталога:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Вызов функции загрузки квартир из таблицы
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
        return "Отличный запрос. Я передал критерии Александру Громову. Оставьте контакты в форме на сайте, и он свяжется с вами лично!";
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
