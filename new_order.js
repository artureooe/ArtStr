// =================== НАСТРОЙКИ ===================
const BOT_TOKEN = '8381986284:AAHhJWbm3b0dAep7lpIw2porfmQEt2-vvw0';
const ADMIN_IDS = [7725796090]; // Твой ID и других админов
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// =================== ОТПРАВКА ЗАКАЗОВ ===================
async function sendOrderToBot(orderData) {
    try {
        // Формируем сообщение для админов
        const messageText = `
🛒 *НОВЫЙ ЗАКАЗ!*\n
📦 *Товар:* ${orderData.product}
📊 *Количество:* ${orderData.quantity}
💰 *Сумма:* ${orderData.total} ${orderData.currency}
👤 *Username:* @${orderData.username}
💳 *Способ оплаты:* ${orderData.payment_method === 'crypto_bot' ? 'Crypto Bot' : 'BEP20'}
📅 *Время:* ${new Date().toLocaleString('ru-RU')}
        `.trim();

        // Отправляем каждому админу
        for (const adminId of ADMIN_IDS) {
            try {
                // Отправляем текстовое сообщение
                await fetch(`${API_URL}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: adminId,
                        text: messageText,
                        parse_mode: 'Markdown'
                    })
                });

                // Если есть скриншот - отправляем его
                if (orderData.screenshot && orderData.screenshot.startsWith('data:image')) {
                    // Отправляем фото
                    const formData = new FormData();
                    
                    // Преобразуем base64 в blob
                    const base64Data = orderData.screenshot.split(',')[1];
                    const byteCharacters = atob(base64Data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'image/jpeg' });
                    
                    // Создаем файл
                    const file = new File([blob], 'screenshot.jpg', { type: 'image/jpeg' });
                    formData.append('photo', file);
                    formData.append('chat_id', adminId);
                    formData.append('caption', '📸 Скриншот оплаты');

                    // Отправляем фото через formData
                    await fetch(`${API_URL}/sendPhoto`, {
                        method: 'POST',
                        body: formData
                    });
                }

            } catch (error) {
                console.error(`Ошибка отправки админу ${adminId}:`, error);
            }
        }

        return { success: true, message: 'Заказ отправлен админам!' };
        
    } catch (error) {
        console.error('Ошибка отправки заказа:', error);
        return { 
            success: false, 
            message: 'Ошибка отправки. Попробуй еще раз или напиши @N3_ART' 
        };
    }
}

// =================== ОБРАБОТКА ОТПРАВКИ ===================
async function handleOrderSubmission(orderData) {
    // Показываем загрузку
    showLoading();
    
    try {
        // Отправляем заказ
        const result = await sendOrderToBot(orderData);
        
        if (result.success) {
            // Показываем успех
            showSuccess();
            
            // Сохраняем в localStorage для истории
            saveOrderToHistory(orderData);
            
            // Сбрасываем форму
            setTimeout(() => {
                resetOrderForm();
                hideLoading();
            }, 3000);
            
        } else {
            // Показываем ошибку
            showError(result.message);
            hideLoading();
        }
        
    } catch (error) {
        console.error('Ошибка обработки заказа:', error);
        showError('Произошла ошибка. Напиши @N3_ART');
        hideLoading();
    }
}

// =================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===================
function showLoading() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;
    }
}

function hideLoading() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить заказ';
        submitBtn.disabled = false;
    }
}

function showSuccess() {
    // Создаем модальное окно успеха
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
        <div class="success-content">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>✅ Заказ отправлен!</h3>
            <p>Админы получили твой заказ. Ожидай доставку в течение 15 минут.</p>
            <p><strong>Следи за уведомлениями в этом чате!</strong></p>
            <button onclick="closeSuccessModal()" class="success-btn">OK</button>
        </div>
    `;
    
    // Стили
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s;
    `;
    
    const content = modal.querySelector('.success-content');
    content.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        max-width: 400px;
        width: 90%;
        animation: slideUp 0.3s;
    `;
    
    document.body.appendChild(modal);
}

function showError(message) {
    alert(`❌ ${message}`);
}

function closeSuccessModal() {
    const modal = document.querySelector('.success-modal');
    if (modal) {
        modal.remove();
    }
}

function saveOrderToHistory(orderData) {
    try {
        // Получаем историю из localStorage
        let history = JSON.parse(localStorage.getItem('artstars_orders') || '[]');
        
        // Добавляем новый заказ
        history.unshift({
            ...orderData,
            timestamp: new Date().toISOString(),
            status: 'pending'
        });
        
        // Сохраняем только последние 10 заказов
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        
        localStorage.setItem('artstars_orders', JSON.stringify(history));
    } catch (error) {
        console.error('Ошибка сохранения истории:', error);
    }
}

function resetOrderForm() {
    // Находим форму и сбрасываем
    const form = document.querySelector('form');
    if (form) form.reset();
    
    // Сбрасываем переменные
    if (window.currentProduct) window.currentProduct = 'stars';
    if (window.currentPremium) window.currentPremium = 3;
    if (window.currentPayment) window.currentPayment = null;
    if (window.screenshot) window.screenshot = null;
    
    // Обновляем интерфейс
    if (typeof updateCalculator === 'function') updateCalculator();
    if (typeof updateSubmitButton === 'function') updateSubmitButton();
}

// =================== ИНТЕГРАЦИЯ С ФОРМОЙ ===================
// Эта функция будет вызываться из script.js при отправке формы
function submitOrderFromForm(orderData) {
    return handleOrderSubmission(orderData);
}

// =================== ДЛЯ ТЕСТИРОВАНИЯ ===================
// Функция для теста отправки (можно удалить в продакшене)
async function testOrderSubmission() {
    const testOrder = {
        product: 'Звезды',
        quantity: 1000,
        total: 1450,
        currency: 'RUB',
        username: 'test_user',
        payment_method: 'crypto_bot',
        screenshot: null
    };
    
    console.log('Тестовая отправка заказа...');
    const result = await handleOrderSubmission(testOrder);
    console.log('Результат:', result);
}

// Экспортируем функции для использования в других файлах
if (typeof window !== 'undefined') {
    window.sendOrderToBot = sendOrderToBot;
    window.handleOrderSubmission = handleOrderSubmission;
    window.submitOrderFromForm = submitOrderFromForm;
    window.testOrderSubmission = testOrderSubmission;
}

console.log('✅ New Order Module loaded!');
