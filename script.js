// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    // Загрузка темы
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Инициализация переменных
    window.currentProduct = 'stars';
    window.currentPremium = 3;
    window.currentPayment = null;
    window.screenshot = null;
    
    // Настройка калькулятора
    setupCalculator();
    
    // Настройка загрузки файла
    setupFileUpload();
    
    // Обновить кнопку отправки
    updateSubmitButton();
});

// Тема
document.getElementById('themeBtn').addEventListener('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeBtn i');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Выбор товара
function selectProduct(product) {
    window.currentProduct = product;
    
    // Обновить визуальное выделение
    document.querySelectorAll('.product-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    event.currentTarget.classList.add('selected');
    
    // Показать/скрыть выбор премиума
    const premiumSelector = document.getElementById('premiumSelector');
    if (product === 'premium') {
        premiumSelector.style.display = 'grid';
        updateCalculator();
        document.getElementById('quantity').disabled = true;
        document.getElementById('quantitySlider').disabled = true;
    } else {
        premiumSelector.style.display = 'none';
        document.getElementById('quantity').disabled = false;
        document.getElementById('quantitySlider').disabled = false;
    }
    
    // Обновить калькулятор
    updateCalculator();
}

// Выбор премиума
function selectPremium(months) {
    window.currentPremium = months;
    
    // Обновить визуальное выделение
    document.querySelectorAll('.premium-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    event.currentTarget.classList.add('selected');
    
    // Обновить калькулятор
    updateCalculator();
}

// Настройка калькулятора
function setupCalculator() {
    const quantityInput = document.getElementById('quantity');
    const slider = document.getElementById('quantitySlider');
    
    quantityInput.addEventListener('input', function() {
        let value = parseInt(this.value);
        
        if (window.currentProduct === 'stars') {
            value = Math.max(100, Math.min(25000, value));
        } else if (window.currentProduct === 'ton') {
            value = Math.max(2, Math.min(165, value));
        }
        
        this.value = value;
        slider.value = value;
        updateCalculator();
    });
    
    slider.addEventListener('input', function() {
        quantityInput.value = this.value;
        updateCalculator();
    });
}

// Обновление калькулятора
function updateCalculator() {
    const quantity = parseInt(document.getElementById('quantity').value);
    let total = 0;
    let rateText = '';
    let currency = '₽';
    
    switch(window.currentProduct) {
        case 'stars':
            const starRate = 1.45;
            total = quantity * starRate;
            rateText = `${starRate}₽ / шт`;
            currency = '₽';
            break;
            
        case 'premium':
            const premiumPrices = {3: 15, 6: 19, 12: 28};
            total = premiumPrices[window.currentPremium];
            rateText = `${window.currentPremium} месяцев`;
            currency = 'USDT';
            break;
            
        case 'ton':
            const tonRate = 149;
            total = quantity * tonRate;
            rateText = `${tonRate}₽ / TON`;
            currency = '₽';
            break;
    }
    
    // Обновить интерфейс
    document.getElementById('totalAmount').textContent = 
        window.currentProduct === 'premium' 
            ? `${total} ${currency}`
            : `${total.toLocaleString('ru-RU')} ${currency}`;
    
    document.getElementById('rateText').textContent = rateText;
    
    // Обновить метку
    let label = 'Количество:';
    if (window.currentProduct === 'stars') label = 'Звёзды:';
    if (window.currentProduct === 'ton') label = 'TON:';
    document.getElementById('quantityLabel').textContent = label;
    
    // Обновить ограничения
    if (window.currentProduct === 'stars') {
        document.getElementById('quantity').min = 100;
        document.getElementById('quantity').max = 25000;
        document.getElementById('quantitySlider').min = 100;
        document.getElementById('quantitySlider').max = 25000;
    } else if (window.currentProduct === 'ton') {
        document.getElementById('quantity').min = 2;
        document.getElementById('quantity').max = 165;
        document.getElementById('quantitySlider').min = 2;
        document.getElementById('quantitySlider').max = 165;
    }
    
    updateSubmitButton();
}

// Выбор способа оплаты
function selectPayment(method) {
    window.currentPayment = method;
    
    // Обновить визуальное выделение
    document.querySelectorAll('.payment-method').forEach(payment => {
        payment.classList.remove('selected');
    });
    
    event.currentTarget.classList.add('selected');
    
    // Показать соответствующие детали
    const cryptoBotInfo = document.getElementById('cryptoBotInfo');
    const bep20Info = document.getElementById('bep20Info');
    
    if (method === 'crypto_bot') {
        cryptoBotInfo.style.display = 'block';
        bep20Info.style.display = 'none';
    } else {
        cryptoBotInfo.style.display = 'none';
        bep20Info.style.display = 'block';
    }
    
    updateSubmitButton();
}

// Открыть Crypto Bot
function openCryptoBot() {
    let url = '';
    
    switch(window.currentProduct) {
        case 'stars':
            url = 'http://t.me/send?start=IVokAO7ctuXg';
            break;
        case 'premium':
            switch(window.currentPremium) {
                case 3: url = 'http://t.me/send?start=IV5IHNwgpM4N'; break;
                case 6: url = 'http://t.me/send?start=IVeOFirLP2TH'; break;
                case 12: url = 'http://t.me/send?start=IVnDUj6uGHGb'; break;
            }
            break;
        case 'ton':
            url = 'http://t.me/send?start=IVSio1teZ6JJ';
            break;
    }
    
    if (url) {
        window.open(url, '_blank');
    }
}

// Копировать кошелёк
function copyWallet() {
    const wallet = '0x798236f6980A595FE823b595d71816Dc713fAFdE';
    
    navigator.clipboard.writeText(wallet).then(() => {
        const btn = event.currentTarget;
        const originalHTML = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.style.background = 'var(--success)';
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
        }, 2000);
    });
}

// Загрузка файла
function setupFileUpload() {
    const input = document.getElementById('screenshotInput');
    const uploadArea = document.getElementById('uploadArea');
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--accent)';
        uploadArea.style.background = 'rgba(0, 122, 255, 0.05)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '';
        uploadArea.style.background = '';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        uploadArea.style.background = '';
        
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
    
    input.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        window.screenshot = e.target.result;
        
        document.getElementById('imagePreview').src = window.screenshot;
        document.getElementById('previewContainer').style.display = 'block';
        document.getElementById('uploadArea').style.display = 'none';
        
        updateSubmitButton();
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    window.screenshot = null;
    document.getElementById('screenshotInput').value = '';
    document.getElementById('previewContainer').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    updateSubmitButton();
}

// Обновление кнопки отправки
function updateSubmitButton() {
    const username = document.getElementById('username').value.trim();
    const submitBtn = document.getElementById('submitBtn');
    
    const isReady = username && 
                    window.currentPayment && 
                    window.screenshot;
    
    submitBtn.disabled = !isReady;
}

// Отправка заказа
function submitOrder() {
    const quantity = parseInt(document.getElementById('quantity').value);
    const username = document.getElementById('username').value.trim();
    
    if (!username || !window.currentPayment || !window.screenshot) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    // Создать объект заказа
    const order = {
        type: 'new_order',
        data: {
            product: getProductName(),
            quantity: window.currentProduct === 'premium' ? window.currentPremium : quantity,
            total: calculateTotal(),
            currency: getCurrency(),
            username: username,
            payment_method: window.currentPayment,
            screenshot: window.screenshot
        }
    };
    
    // Отправить в Telegram бота
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify(order));
    } else {
        // Для тестирования вне Telegram
        console.log('Order:', order);
        alert('Заказ отправлен в консоль для тестирования');
    }
    
    // Показать модальное окно
    showSuccessModal();
}

// Вспомогательные функции
function getProductName() {
    switch(window.currentProduct) {
        case 'stars': return 'Звезды';
        case 'premium': return `Premium ${window.currentPremium} мес`;
        case 'ton': return 'TON';
        default: return '';
    }
}

function calculateTotal() {
    const quantity = parseInt(document.getElementById('quantity').value);
    
    switch(window.currentProduct) {
        case 'stars':
            return quantity * 1.45;
        case 'premium':
            const prices = {3: 15, 6: 19, 12: 28};
            return prices[window.currentPremium];
        case 'ton':
            return quantity * 149;
        default:
            return 0;
    }
}

function getCurrency() {
    if (window.currentProduct === 'premium') return 'USDT';
    return 'RUB';
}

// Модальное окно
function showSuccessModal() {
    document.getElementById('successModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('successModal').style.display = 'none';
    
    // Сбросить форму
    resetForm();
}

function resetForm() {
    // Сброс выбора товара
    window.currentProduct = 'stars';
    window.currentPremium = 3;
    window.currentPayment = null;
    window.screenshot = null;
    
    // Сброс UI
    document.querySelectorAll('.product-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector('.star-card').classList.add('selected');
    
    document.querySelectorAll('.premium-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector('.premium-option').classList.add('selected');
    
    document.querySelectorAll('.payment-method').forEach(payment => {
        payment.classList.remove('selected');
    });
    
    // Сброс полей
    document.getElementById('quantity').value = 1000;
    document.getElementById('quantitySlider').value = 1000;
    document.getElementById('username').value = '';
    
    // Сброс оплаты
    document.getElementById('cryptoBotInfo').style.display = 'block';
    document.getElementById('bep20Info').style.display = 'none';
    
    // Сброс скриншота
    removeImage();
    
    // Обновить калькулятор
    updateCalculator();
    updateSubmitButton();
}

// Слушатель для username
document.getElementById('username').addEventListener('input', updateSubmitButton);
