// Глобальные переменные
let currentProduct = 'stars';
let currentPremium = 3;
let currentPayment = 'crypto_bot';
let screenshot = null;

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    // Настройка темы
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Настройка кнопки темы
    document.getElementById('themeBtn').addEventListener('click', toggleTheme);
    
    // Настройка калькулятора
    setupCalculator();
    
    // Настройка загрузки файла
    setupFileUpload();
    
    // Настройка валидации
    setupValidation();
    
    // Обновить кнопку отправки
    updateSubmitButton();
});

// Тема
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeBtn i');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Выбор товара
function selectProduct(product) {
    currentProduct = product;
    
    // Обновить визуальное выделение
    document.querySelectorAll('.product-card').forEach(card => {
        card.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Показать/скрыть выбор премиума
    const premiumSelector = document.getElementById('premiumSelector');
    const quantityInput = document.getElementById('quantity');
    const quantitySlider = document.getElementById('quantitySlider');
    
    if (product === 'premium') {
        premiumSelector.style.display = 'grid';
        quantityInput.disabled = true;
        quantitySlider.disabled = true;
        updateCalculator();
    } else {
        premiumSelector.style.display = 'none';
        quantityInput.disabled = false;
        quantitySlider.disabled = false;
        
        // Обновить метку и ограничения
        let label = 'Количество:';
        let min = 100;
        let max = 25000;
        let step = 100;
        let value = 1000;
        
        if (product === 'stars') {
            label = 'Количество звёзд:';
            min = 100;
            max = 25000;
            step = 100;
            value = 1000;
        } else if (product === 'ton') {
            label = 'Количество TON:';
            min = 2;
            max = 165;
            step = 1;
            value = 5;
        }
        
        document.getElementById('quantityLabel').textContent = label;
        quantityInput.min = min;
        quantityInput.max = max;
        quantityInput.step = step;
        quantityInput.value = value;
        quantitySlider.min = min;
        quantitySlider.max = max;
        quantitySlider.step = step;
        quantitySlider.value = value;
        
        updateCalculator();
    }
}

// Выбор премиума
function selectPremium(months) {
    currentPremium = months;
    
    // Обновить визуальное выделение
    document.querySelectorAll('.premium-option').forEach(option => {
        option.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    updateCalculator();
}

// Настройка калькулятора
function setupCalculator() {
    const quantityInput = document.getElementById('quantity');
    const slider = document.getElementById('quantitySlider');
    
    quantityInput.addEventListener('input', function() {
        let value = parseInt(this.value) || 0;
        
        if (currentProduct === 'stars') {
            value = Math.max(100, Math.min(25000, value));
        } else if (currentProduct === 'ton') {
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
    const quantity = parseInt(document.getElementById('quantity').value) || 0;
    let total = 0;
    let rateText = '';
    let currency = '₽';
    
    switch(currentProduct) {
        case 'stars':
            const starRate = 1.45;
            total = quantity * starRate;
            rateText = `${starRate}₽ / шт`;
            currency = '₽';
            break;
            
        case 'premium':
            const premiumPrices = {3: 15, 6: 19, 12: 28};
            total = premiumPrices[currentPremium];
            rateText = `${currentPremium} месяцев`;
            currency = 'USDT';
            break;
            
        case 'ton':
            const tonRate = 149;
            total = quantity * tonRate;
            rateText = `${tonRate}₽ / TON`;
            currency = '₽';
            break;
    }
    
    // Форматируем сумму
    let formattedTotal;
    if (currentProduct === 'premium') {
        formattedTotal = `${total} ${currency}`;
    } else {
        formattedTotal = `${total.toLocaleString('ru-RU')} ${currency}`;
    }
    
    // Обновить интерфейс
    document.getElementById('totalAmount').textContent = formattedTotal;
    document.getElementById('rateText').textContent = rateText;
}

// Выбор способа оплаты
function selectPayment(method) {
    currentPayment = method;
    
    // Обновить визуальное выделение
    document.querySelectorAll('.payment-method').forEach(payment => {
        payment.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Показать соответствующие детали
    const cryptoBotInfo = document.getElementById('cryptoBotInfo');
    const bep20Info = document.getElementById('bep20Info');
    
    cryptoBotInfo.style.display = method === 'crypto_bot' ? 'block' : 'none';
    bep20Info.style.display = method === 'bep20' ? 'block' : 'none';
}

// Открыть Crypto Bot
function openCryptoBot() {
    let url = '';
    
    switch(currentProduct) {
        case 'stars':
            url = 'http://t.me/send?start=IVokAO7ctuXg';
            break;
        case 'premium':
            switch(currentPremium) {
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
        btn.style.background = '#34C759';
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Ошибка копирования:', err);
        alert('Не удалось скопировать. Скопируйте вручную: ' + wallet);
    });
}

// Загрузка файла
function setupFileUpload() {
    const input = document.getElementById('screenshotInput');
    const uploadArea = document.getElementById('uploadArea');
    
    uploadArea.addEventListener('click', () => {
        input.click();
    });
    
    input.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение (JPG, PNG, etc.)');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('Файл слишком большой. Максимальный размер: 5MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        screenshot = e.target.result;
        
        document.getElementById('imagePreview').src = screenshot;
        document.getElementById('previewContainer').style.display = 'block';
        document.getElementById('uploadArea').style.display = 'none';
        
        updateSubmitButton();
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    screenshot = null;
    document.getElementById('screenshotInput').value = '';
    document.getElementById('previewContainer').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    updateSubmitButton();
}

// Настройка валидации
function setupValidation() {
    const usernameInput = document.getElementById('username');
    
    usernameInput.addEventListener('input', function() {
        let value = this.value.trim();
        // Убираем @ в начале
        if (value.startsWith('@')) {
            value = value.substring(1);
            this.value = value;
        }
        // Убираем пробелы
        value = value.replace(/\s+/g, '');
        this.value = value;
        
        updateSubmitButton();
    });
}

// Обновление кнопки отправки
function updateSubmitButton() {
    const username = document.getElementById('username').value.trim();
    const submitBtn = document.getElementById('submitBtn');
    
    const isReady = username && 
                    username.length >= 3 &&
                    currentPayment && 
                    screenshot;
    
    submitBtn.disabled = !isReady;
}

// Вспомогательные функции для заказа
function getProductName() {
    switch(currentProduct) {
        case 'stars': return 'Звезды';
        case 'premium': return `Premium ${currentPremium} мес`;
        case 'ton': return 'TON';
        default: return 'Товар';
    }
}

function calculateTotal() {
    const quantity = parseInt(document.getElementById('quantity').value) || 0;
    
    switch(currentProduct) {
        case 'stars':
            return quantity * 1.45;
        case 'premium':
            const prices = {3: 15, 6: 19, 12: 28};
            return prices[currentPremium];
        case 'ton':
            return quantity * 149;
        default:
            return 0;
    }
}

function getCurrency() {
    if (currentProduct === 'premium') return 'USDT';
    return 'RUB';
}

// Отправка заказа
function submitOrder() {
    const quantity = parseInt(document.getElementById('quantity').value) || 0;
    const username = document.getElementById('username').value.trim();
    
    // Проверка данных
    if (!username || username.length < 3) {
        alert('❌ Введите правильный username (минимум 3 символа)');
        return;
    }
    
    if (!currentPayment) {
        alert('❌ Выберите способ оплаты');
        return;
    }
    
    if (!screenshot) {
        alert('❌ Загрузите скриншот оплаты');
        return;
    }
    
    // Создаем объект заказа
    const orderData = {
        product: getProductName(),
        quantity: currentProduct === 'premium' ? currentPremium : quantity,
        total: calculateTotal(),
        currency: getCurrency(),
        username: username,
        payment_method: currentPayment,
        payment_name: currentPayment === 'crypto_bot' ? 'Crypto Bot' : 'BEP20',
        screenshot: screenshot,
        timestamp: new Date().toLocaleString('ru-RU')
    };
    
    console.log('Отправка заказа:', orderData);
    
    // Отправляем заказ
    sendOrderToBot(orderData);
}

// Показываем успех
function showSuccess() {
    document.getElementById('successModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('successModal').style.display = 'none';
    
    // Можно сбросить форму
    // resetForm();
                                   }
