"use strict";

document.addEventListener('DOMContentLoaded', () => {

    /* ==============================================
       ПРАКТИЧЕСКАЯ 13: ИГРА + СЛАЙДЕР
       ============================================== */

    const slider = document.getElementById('slider');
    const thumb = slider ? slider.querySelector('.slider-thumb') : null;
    const sliderValue = document.getElementById('sliderValue');
    const timeEstimate = document.getElementById('timeEstimate');
    
    // Элементы игры
    const field = document.getElementById('field');
    const ball = document.getElementById('ball');
    const coordsDisplay = document.getElementById('clickCoords');

    // --- ПЕРЕМЕННЫЕ ФИЗИКИ ИГРЫ ---
    let gameState = {
        isRunning: false,
        posX: 0, posY: 0,       
        vx: 3, vy: 3,           
        mouseX: 0, mouseY: 0,   
        animationFrameId: null  
    };

    const GAME_CONFIG = {
        baseSpeed: 2,         
        maxSpeed: 10,         
        evasionRadius: 80,    
        evasionForce: 0.5,    
        friction: 0.96        
    };

    // --- ЛОГИКА СЛАЙДЕР ---
    if (thumb) {
        thumb.onmousedown = function(event) {
            event.preventDefault();
            let shiftX = event.clientX - thumb.getBoundingClientRect().left;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);

            function onMouseMove(event) {
                let newLeft = event.clientX - shiftX - slider.getBoundingClientRect().left;
                if (newLeft < 0) newLeft = 0;
                let rightEdge = slider.offsetWidth - thumb.offsetWidth;
                if (newLeft > rightEdge) newLeft = rightEdge;

                thumb.style.left = newLeft + 'px';
                
                let percent = Math.round(newLeft / rightEdge * 50);
                if(sliderValue) sliderValue.textContent = percent;

                let time = 30 + percent; 
                timeEstimate.textContent = `Примерное время стрижки: ${time} мин.`;

                // Запуск игры при длинных волосах
                if (percent > 30) {
                    if (!gameState.isRunning) {
                        startGame(); 
                    }
                } else {
                    if (gameState.isRunning) {
                        stopGame(); 
                    }
                }
            }

            function onMouseUp() {
                document.removeEventListener('mouseup', onMouseUp);
                document.removeEventListener('mousemove', onMouseMove);
            }
        };
        thumb.ondragstart = function() { return false; };
    }

    // --- ЛОГИКА ИГРЫ ---
    function startGame() {
        if (!field || !ball) return;
        field.style.display = 'block';
        setTimeout(() => field.style.opacity = '1', 10);
        
        gameState.posX = field.clientWidth / 2 - ball.offsetWidth / 2;
        gameState.posY = field.clientHeight / 2 - ball.offsetHeight / 2;
        gameState.vx = (Math.random() > 0.5 ? 1 : -1) * GAME_CONFIG.baseSpeed;
        gameState.vy = (Math.random() > 0.5 ? 1 : -1) * GAME_CONFIG.baseSpeed;
        gameState.isRunning = true;

        field.addEventListener('mousemove', trackMouse);
        gameLoop();
    }

    function stopGame() {
        if (!field) return;
        field.style.opacity = '0';
        setTimeout(() => { 
            if (field.style.opacity === '0') field.style.display = 'none'; 
        }, 500);
        
        gameState.isRunning = false;
        if (gameState.animationFrameId) {
            cancelAnimationFrame(gameState.animationFrameId);
        }
        field.removeEventListener('mousemove', trackMouse);
        ball.classList.remove('scared');
    }

    function trackMouse(e) {
        let fieldRect = field.getBoundingClientRect();
        gameState.mouseX = e.clientX - fieldRect.left;
        gameState.mouseY = e.clientY - fieldRect.top;
    }

    function gameLoop() {
        if (!gameState.isRunning) return;

        let ballCenterX = gameState.posX + ball.offsetWidth / 2;
        let ballCenterY = gameState.posY + ball.offsetHeight / 2;
        let dx = gameState.mouseX - ballCenterX;
        let dy = gameState.mouseY - ballCenterY;
        let distanceToMouse = Math.sqrt(dx*dx + dy*dy);

        if (distanceToMouse < GAME_CONFIG.evasionRadius) {
            ball.classList.add('scared'); 
            gameState.vx -= (dx / distanceToMouse) * GAME_CONFIG.evasionForce;
            gameState.vy -= (dy / distanceToMouse) * GAME_CONFIG.evasionForce;
        } else {
            ball.classList.remove('scared');
        }

        gameState.vx *= GAME_CONFIG.friction;
        gameState.vy *= GAME_CONFIG.friction;

        let currentSpeed = Math.sqrt(gameState.vx*gameState.vx + gameState.vy*gameState.vy);
        if (currentSpeed > GAME_CONFIG.maxSpeed) {
            gameState.vx = (gameState.vx / currentSpeed) * GAME_CONFIG.maxSpeed;
            gameState.vy = (gameState.vy / currentSpeed) * GAME_CONFIG.maxSpeed;
        }
        if (currentSpeed < GAME_CONFIG.baseSpeed && currentSpeed > 0.1) {
             gameState.vx = (gameState.vx / currentSpeed) * GAME_CONFIG.baseSpeed;
             gameState.vy = (gameState.vy / currentSpeed) * GAME_CONFIG.baseSpeed;
        }

        gameState.posX += gameState.vx;
        gameState.posY += gameState.vy;

        let fieldWidth = field.clientWidth;
        let fieldHeight = field.clientHeight;

        if (gameState.posX + ball.offsetWidth >= fieldWidth) {
            gameState.posX = fieldWidth - ball.offsetWidth; 
            gameState.vx *= -1; 
        } else if (gameState.posX <= 0) {
            gameState.posX = 0;
            gameState.vx *= -1;
        }

        if (gameState.posY + ball.offsetHeight >= fieldHeight) {
            gameState.posY = fieldHeight - ball.offsetHeight;
            gameState.vy *= -1;
        } else if (gameState.posY <= 0) {
            gameState.posY = 0;
            gameState.vy *= -1;
        }

        ball.style.left = gameState.posX + 'px';
        ball.style.top = gameState.posY + 'px';

        gameState.animationFrameId = requestAnimationFrame(gameLoop);
    }

    if (ball) {
        ball.onmousedown = function(event) {
            event.stopPropagation(); 
            if (!gameState.isRunning) return;

            gameState.isRunning = false;
            cancelAnimationFrame(gameState.animationFrameId);
            field.removeEventListener('mousemove', trackMouse);
            ball.classList.remove('scared');

            ball.style.backgroundColor = "#28a745"; 
            ball.textContent = "✓"; 
            ball.style.transform = "scale(1.2)";
            ball.style.cursor = "default";
            
            setTimeout(() => {
                alert("Попался! Промокод LONGHAIR20 активирован! (Скидка 20%)");
                const couponInput = document.getElementById('couponInput');
                if(couponInput) couponInput.value = "LONGHAIR20";

                setTimeout(() => {
                   stopGame();
                   setTimeout(() => {
                        ball.style.backgroundColor = ""; 
                        ball.textContent = "-20%";
                        ball.style.transform = "";
                        ball.style.cursor = "crosshair";
                   }, 500)
                }, 1000);
            }, 100);
        };
    }

    /* ==============================================
       13.2. УВЕДОМЛЕНИЯ И КОЛОКОЛЬЧИК
       ============================================== */
    
    function showNotification({html, className}) {
        let div = document.createElement('div');
        div.className = className || "notification-toast";
        div.innerHTML = `${html} <span class="notification-close">×</span>`;
        document.body.append(div);
        setTimeout(() => { if(div) div.remove() }, 5000); // Показываем 5 секунд
    }

    // Закрытие уведомлений (делегирование)
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('notification-close')) {
            let notification = event.target.closest('.notification-toast');
            if (notification) notification.remove();
        }
    });

    // Логика уведомлений
    const notifyBtn = document.getElementById('notifyBtn');
    const notifyBadge = document.getElementById('notifyCounter');
    let notificationCount = 0;
    let hasNewNotification = false; // Флаг, что есть непрочитанное

    // --- ИЗМЕНЕНИЕ: Уведомление приходит ТОЛЬКО ОДИН РАЗ через 5 секунд ---
    setTimeout(() => {
        notificationCount = 1;
        hasNewNotification = true;
        
        // Обновляем значок
        if (notifyBadge) {
            notifyBadge.textContent = notificationCount;
            notifyBadge.style.transform = "scale(1.2)";
            setTimeout(() => notifyBadge.style.transform = "scale(1)", 200);
        }

        // Анимация колокольчика
        if (notifyBtn) {
            notifyBtn.style.color = '#d4af37'; // Подсвечиваем золотым
        }

        // Показываем всплывающее сообщение
        showNotification({ html: "🔥 Акция: Стрижка + Борода = Скидка 15%" });
        
    }, 5000); // Задержка 5 секунд после загрузки

    // --- ОБРАБОТЧИК КЛИКА НА КОЛОКОЛЬЧИК ---
    if (notifyBtn) {
        notifyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Эффект нажатия
            notifyBtn.style.transform = "scale(0.9)";
            setTimeout(() => notifyBtn.style.transform = "scale(1)", 150);

            if (hasNewNotification) {
                // Если есть новое - показываем и сбрасываем
                showNotification({ html: "🔥 Акция: Стрижка + Борода = Скидка 15.(Не суммируется с промокодами)" });
                
                // Сброс счетчика
                notificationCount = 0;
                hasNewNotification = false;
                if (notifyBadge) notifyBadge.textContent = "0";
                notifyBtn.style.color = ''; // Убираем подсветку
            } else {
                // Если новых нет
                showNotification({ html: "Новых уведомлений нет." });
            }
        });
    }
    /* ==============================================
       13.3. ПАРАЛЛАКС И СКРОЛЛ
       ============================================== */
    window.addEventListener('scroll', function() {
        const hero = document.getElementById('hero');
        if (hero) {
            let scrollPosition = window.scrollY;
            if (scrollPosition < hero.offsetHeight) {
                 hero.style.backgroundPosition = `center ${scrollPosition * 0.5}px`;
            }
        }

        const backBtn = document.getElementById('backToTop');
        if (backBtn) {
            if (window.scrollY > 300) {
                backBtn.style.display = 'block';
            } else {
                backBtn.style.display = 'none';
            }
        }
    });

    const backBtn = document.getElementById('backToTop');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    /* ==============================================
       ПРАКТИЧЕСКАЯ 14: ИНТЕРФЕЙСЫ
       ============================================== */

    // 14.1. Перехват ссылок
    const contents = document.getElementById('contents');
    if (contents) {
        contents.onclick = function(event) {
            let target = event.target.closest('a');
            if (target && contents.contains(target)) {
                let href = target.getAttribute('href');
                if (!confirm(`Вы переходите на внешний ресурс: ${href}. Продолжить?`)) {
                    event.preventDefault();
                }
            }
        };
    }

    // 14.2. Галерея
    const thumbsContainer = document.getElementById('thumbsContainer');
    const mainImage = document.getElementById('mainImage');
    
    if (thumbsContainer && mainImage) {
        thumbsContainer.onclick = function(event) {
            let thumb = event.target.closest('.thumb');
            if (!thumb) return;
            let thumbs = thumbsContainer.querySelectorAll('.thumb');
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            let fullSrc = thumb.dataset.full || thumb.src;
            mainImage.src = fullSrc;
            mainImage.style.opacity = 0;
            setTimeout(() => mainImage.style.opacity = 1, 50); 
            event.preventDefault();
        }
    }

    // 14.3. Выбор мастера
    const styleList = document.getElementById('styleList');
    if (styleList) {
        styleList.onmousedown = function(event) { event.preventDefault(); };
        styleList.onclick = function(event) {
            let item = event.target.closest('.selectable-item');
            if (!item) return;
            if (!event.ctrlKey && !event.metaKey) {
                let selected = styleList.querySelectorAll('.selected');
                selected.forEach(li => li.classList.remove('selected'));
            }
            item.classList.toggle('selected');
        }
    }

    /* ==============================================
       14.5. КОРЗИНА, DRAG'N'DROP И КУПОНЫ
       ============================================== */
    
    let servicesArray = []; 
    let currentDiscount = 0; 

    const cartContainer = document.getElementById('cart-items');
    const totalValueSpan = document.getElementById('cartTotalValue');
    const oldPriceSpan = document.getElementById('oldPrice');
    
    function renderCart() {
        if (!cartContainer) return;
        
        cartContainer.innerHTML = servicesArray.length ? '' : '<p style="width:100%; text-align:center; color:#aaa; margin-top:20px; pointer-events: none;"><i class="fas fa-inbox fa-3x" style="opacity: 0.3; margin-bottom: 10px;"></i><br>Перетащите услуги сюда</p>';
        
        let total = 0;
        
        servicesArray.forEach((item, index) => {
            total += item.price;
            let el = document.createElement('div');
            el.className = 'cart-item';
            el.style.cssText = "display:flex; justify-content:space-between; width:100%; padding:10px; border-bottom:1px solid #eee; background: white; margin-bottom: 5px; border-radius: 5px; pointer-events: auto;"; 
            el.innerHTML = `
                <span>${item.name}</span>
                <strong>${item.price} ₽</strong>
                <button onclick="removeService(${index})" style="background:none; border:none; color:red; cursor:pointer; font-weight:bold;">&times;</button>
            `;
            cartContainer.append(el);
        });

        if (currentDiscount > 0 && total > 0) {
            let discountedTotal = Math.round(total * (1 - currentDiscount));
            if(oldPriceSpan) {
                oldPriceSpan.style.display = "inline";
                oldPriceSpan.textContent = total + " ₽";
            }
            if(totalValueSpan) {
                totalValueSpan.textContent = discountedTotal;
                totalValueSpan.style.color = "#28a745"; 
            }
        } else {
            if(oldPriceSpan) oldPriceSpan.style.display = "none";
            if(totalValueSpan) {
                totalValueSpan.textContent = total;
                totalValueSpan.style.color = "";
            }
        }
    }
    
    window.removeService = function(index) {
        servicesArray.splice(index, 1);
        renderCart();
    };
    
    const clearCartBtn = document.getElementById('clearCartBtn');
    if(clearCartBtn) clearCartBtn.onclick = (e) => { 
        e.preventDefault(); 
        servicesArray = []; 
        renderCart(); 
    };

    // Купоны
    const couponInput = document.getElementById('couponInput');
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    const couponMessage = document.getElementById('couponMessage');

    const validCoupons = {
        'FASHION10': 0.10, 
        'BARBER': 0.15,    
        'VIP': 0.20,       
        'STYLE': 0.05,
        'LONGHAIR20': 0.20
    };

    if(applyCouponBtn) {
        applyCouponBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            let code = couponInput.value.trim().toUpperCase();
            
            if (servicesArray.length === 0) {
                showCouponMessage("Сначала добавьте услуги в корзину!", "red");
                return;
            }

            if (currentDiscount > 0) {
                showCouponMessage("Купон уже применен.", "#d4af37");
                return;
            }

            if (validCoupons.hasOwnProperty(code)) {
                currentDiscount = validCoupons[code];
                let percent = currentDiscount * 100;
                showCouponMessage(`Купон применен! Скидка ${percent}%`, "#28a745"); 
                renderCart(); 
                couponInput.disabled = true;
                applyCouponBtn.disabled = true;
                applyCouponBtn.textContent = "✓";
            } else {
                showCouponMessage("Неверный промокод", "red");
                couponInput.style.borderColor = "red";
                setTimeout(() => couponInput.style.borderColor = "#ddd", 500);
            }
        });
    }

    function showCouponMessage(text, color) {
        if(!couponMessage) return;
        couponMessage.textContent = text;
        couponMessage.style.color = color;
        couponMessage.style.opacity = 1;
        if(color === "red") {
            setTimeout(() => { couponMessage.style.opacity = 0; }, 3000);
        }
    }

    // --- ЛОГИКА ПЕРЕТАСКИВАНИЯ (FIXED + NO DUPLICATES) ---
    const draggables = document.querySelectorAll('.draggable-item');
    const dropZone = document.querySelector('.droppable');

    draggables.forEach(item => {
        item.ondragstart = function() { return false; };

        item.onmousedown = function(event) {
            if (event.button !== 0) return;

            let shiftX = event.clientX - item.getBoundingClientRect().left;
            let shiftY = event.clientY - item.getBoundingClientRect().top;

            let clone = item.cloneNode(true);
            
            clone.style.position = 'fixed'; 
            clone.style.zIndex = 9999;
            clone.style.width = item.offsetWidth + 'px';
            clone.style.height = item.offsetHeight + 'px';
            clone.classList.add('dragging'); 
            clone.style.pointerEvents = 'none'; 
            
            document.body.append(clone);

            function moveAt(clientX, clientY) {
                clone.style.left = clientX - shiftX + 'px';
                clone.style.top = clientY - shiftY + 'px';
            }

            moveAt(event.clientX, event.clientY);

            function onMouseMove(e) {
                moveAt(e.clientX, e.clientY);

                let elemBelow = document.elementFromPoint(e.clientX, e.clientY);
                if (!elemBelow) return;

                let droppableBelow = elemBelow.closest('.droppable');

                if (droppableBelow) {
                    droppableBelow.classList.add('droppable-hover');
                } else {
                    if (dropZone) dropZone.classList.remove('droppable-hover');
                }
            }

            document.addEventListener('mousemove', onMouseMove);

            clone.onmouseup = null;
            
            document.onmouseup = function(e) {
                document.removeEventListener('mousemove', onMouseMove);
                document.onmouseup = null; 

                let elemBelow = document.elementFromPoint(e.clientX, e.clientY);
                let droppableBelow = elemBelow ? elemBelow.closest('.droppable') : null;

                if (dropZone) dropZone.classList.remove('droppable-hover');

                if (droppableBelow) {
                    let name = item.getAttribute('data-name');
                    let price = parseInt(item.getAttribute('data-price'));

                    // Проверка на дубликаты
                    const exists = servicesArray.some(s => s.name === name);

                    if (exists) {
                        showNotification({html: `Услуга "${name}" уже добавлена!`, className: 'notification-toast'});
                        clone.remove();
                        return;
                    }
                    
                    servicesArray.push({name, price});
                    renderCart();

                    clone.style.transition = "0.2s ease-out";
                    clone.style.transform = "scale(0.1)";
                    clone.style.opacity = "0";
                    setTimeout(() => clone.remove(), 200);
                } else {
                    clone.remove();
                }
            };
        };
    });

    /* ==============================================
       ДОПОЛНИТЕЛЬНО
       ============================================== */
    
    // Рисование
    const drawBtn = document.getElementById('drawModeBtn');
    let isDrawing = false;
    if (drawBtn) {
        drawBtn.addEventListener('click', () => {
            isDrawing = !isDrawing;
            drawBtn.style.backgroundColor = isDrawing ? '#d4af37' : '#222';
            drawBtn.style.color = isDrawing ? '#fff' : '#d4af37';
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            const dot = document.createElement('div');
            dot.className = 'trail';
            dot.style.left = e.pageX + 'px';
            dot.style.top = e.pageY + 'px';
            dot.style.background = `hsl(${Math.random()*50 + 40}, 80%, 60%)`; 
            document.body.appendChild(dot);
            setTimeout(() => dot.remove(), 800);
        });
    }

    // Вход
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            let login = prompt("Вход для персонала.\nВведите ID сотрудника:", "");
            if (login === "admin") {
                alert("Доступ разрешен. Добро пожаловать.");
            }
        });
    }
});