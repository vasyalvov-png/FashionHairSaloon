"use strict";

document.addEventListener('DOMContentLoaded', () => {

    /* ==============================================
       ПРАКТИЧЕСКАЯ 13: РАЗМЕРЫ, ПРОКРУТКА, КООРДИНАТЫ
       ============================================== */

    // 13.1. Центрирование картинки (Игра: Поймай скидку)
    const field = document.getElementById('field');
    const ball = document.getElementById('ball');
    const coordsDisplay = document.getElementById('clickCoords');

    if (field && ball) {
        function centerBall() {
            let left = Math.round(field.clientWidth / 2 - ball.offsetWidth / 2);
            let top = Math.round(field.clientHeight / 2 - ball.offsetHeight / 2);
            ball.style.left = left + 'px';
            ball.style.top = top + 'px';
        }

        // Центрируем при загрузке
        setTimeout(centerBall, 100); // Небольшая задержка для рендера

        // При клике на поле двигаем "скидку"
        field.onclick = function(event) {
            let clientX = event.clientX;
            let clientY = event.clientY;
            let pageX = event.pageX;
            let pageY = event.pageY;

            if (event.target === ball) {
                alert("Поздравляем! Ваша скидка 10% активирована.");
                ball.style.backgroundColor = "#28a745"; // Зеленый цвет успеха
                ball.textContent = "✓";
                return;
            }

            // Перемещаем "скидку" в точку клика (демонстрация работы с координатами)
            // Но чтобы было интересно, центрируем элемент относительно точки клика
            let fieldRect = field.getBoundingClientRect();
            let relativeX = clientX - fieldRect.left - (ball.offsetWidth / 2);
            let relativeY = clientY - fieldRect.top - (ball.offsetHeight / 2);

            // Ограничиваем рамками
            if (relativeX < 0) relativeX = 0;
            if (relativeY < 0) relativeY = 0;
            if (relativeX > field.clientWidth - ball.offsetWidth) relativeX = field.clientWidth - ball.offsetWidth;
            if (relativeY > field.clientHeight - ball.offsetHeight) relativeY = field.clientHeight - ball.offsetHeight;

            ball.style.left = relativeX + 'px';
            ball.style.top = relativeY + 'px';

            coordsDisplay.textContent = `Окно: ${clientX}:${clientY} | Док: ${pageX}:${pageY}`;
        }
    }

    // 13.2. Уведомления с кнопкой закрытия
    function showNotification({html, className}) {
        let div = document.createElement('div');
        div.className = className || "notification-toast";
        div.innerHTML = `${html} <span class="notification-close">×</span>`;
        document.body.append(div);
        setTimeout(() => { if(div) div.remove() }, 4000);
    }

    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('notification-close')) {
            let notification = event.target.closest('.notification-toast');
            if (notification) notification.remove();
        }
    });

    // Демонстрация уведомления при загрузке
    setTimeout(() => {
        showNotification({ html: "Акция: Стрижка + Борода = Скидка 15%" });
    }, 2000);


    // 13.3. Параллакс для Hero
    window.addEventListener('scroll', function() {
        const hero = document.getElementById('hero');
        if (hero) {
            let scrollPosition = window.scrollY;
            hero.style.backgroundPositionY = (scrollPosition * 0.5) + 'px';
        }

        // 13.4. Кнопка "Наверх"
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
            setTimeout(() => mainImage.style.opacity = 1, 50); // Плавное появление
            event.preventDefault();
        }
    }

    // 14.3. Выбор мастера (Список с выделением)
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

    // 14.4. Слайдер (Длина волос)
    const slider = document.getElementById('slider');
    const thumb = slider ? slider.querySelector('.slider-thumb') : null;
    const sliderValue = document.getElementById('sliderValue');

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
                
                // Расчет см (0 - 50 см)
                let percent = Math.round(newLeft / rightEdge * 50);
                if(sliderValue) sliderValue.textContent = percent;
            }

            function onMouseUp() {
                document.removeEventListener('mouseup', onMouseUp);
                document.removeEventListener('mousemove', onMouseMove);
            }
        };
        thumb.ondragstart = function() { return false; };
    }

    // 14.5. Drag'n'Drop в корзину
    let servicesArray = []; 
    const cartContainer = document.getElementById('cart-items');
    const totalValueSpan = document.getElementById('cartTotalValue');
    
    function renderCart() {
        if (!cartContainer) return;
        cartContainer.innerHTML = servicesArray.length ? '' : '<p style="width:100%; text-align:center; color:#aaa; margin-top:20px;"><i class="fas fa-inbox fa-3x" style="opacity: 0.3; margin-bottom: 10px;"></i><br>Перетащите услуги сюда</p>';
        
        let total = 0;
        servicesArray.forEach((item, index) => {
            total += item.price;
            let el = document.createElement('div');
            el.className = 'cart-item';
            el.style.cssText = "display:flex; justify-content:space-between; width:100%; padding:10px; border-bottom:1px solid #eee;";
            el.innerHTML = `
                <span>${item.name}</span>
                <strong>${item.price} ₽</strong>
                <button onclick="removeService(${index})" style="background:none; border:none; color:red; cursor:pointer;">&times;</button>
            `;
            cartContainer.append(el);
        });
        if(totalValueSpan) totalValueSpan.textContent = total;
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

    const draggables = document.querySelectorAll('.draggable-item');
    
    draggables.forEach(item => {
        item.onmousedown = function(event) {
            // Клонируем элемент
            let clone = item.cloneNode(true);
            clone.classList.add('dragging');
            clone.style.width = item.offsetWidth + 'px'; // Фикс размера
            document.body.append(clone);

            moveAt(event.pageX, event.pageY);

            function moveAt(pageX, pageY) {
                clone.style.left = pageX - clone.offsetWidth / 2 + 'px';
                clone.style.top = pageY - clone.offsetHeight / 2 + 'px';
            }

            function onMouseMove(event) {
                moveAt(event.pageX, event.pageY);
                clone.hidden = true;
                let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
                clone.hidden = false;
                if (!elemBelow) return;
                let droppableBelow = elemBelow.closest('.droppable');
                if (droppableBelow) {
                    droppableBelow.classList.add('droppable-hover');
                } else {
                    document.querySelectorAll('.droppable').forEach(el => el.classList.remove('droppable-hover'));
                }
            }

            document.addEventListener('mousemove', onMouseMove);

            clone.onmouseup = function(event) {
                document.removeEventListener('mousemove', onMouseMove);
                clone.hidden = true;
                let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
                clone.hidden = false;
                let droppableBelow = elemBelow ? elemBelow.closest('.droppable') : null;

                if (droppableBelow) {
                    let name = item.getAttribute('data-name');
                    let price = parseInt(item.getAttribute('data-price'));
                    servicesArray.push({name, price});
                    renderCart();
                    droppableBelow.classList.remove('droppable-hover');
                    // Эффект исчезновения
                    clone.style.transition = "0.3s";
                    clone.style.opacity = "0";
                    clone.style.transform = "scale(0)";
                    setTimeout(() => clone.remove(), 300);
                } else {
                    clone.remove();
                }
            };
        };
        item.ondragstart = function() { return false; };
    });

    // Рисование (Easter Egg)
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
            dot.style.background = `hsl(${Math.random()*360}, 70%, 60%)`; // Разноцветный шлейф
            document.body.appendChild(dot);
            setTimeout(() => dot.remove(), 800);
        });
    }

    // Login (Практическая 9)
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            let login = prompt("Вход для персонала.\nВведите ID сотрудника:", "");
            if (login === "admin") {
                alert("Добро пожаловать в систему управления.");
            }
        });
    }
});