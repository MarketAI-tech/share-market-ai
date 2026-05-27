// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    
    // Animate hamburger icon
    const spans = mobileMenuBtn.querySelectorAll('span');
    if (navLinks.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const spans = mobileMenuBtn.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// Smooth scrolling for anchor links (fallback for browsers that don't support scroll-behavior: smooth)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70, // Adjust for fixed header
                behavior: 'smooth'
            });
        }
    });
});

// Simple entrance animations for product cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.product-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `all 0.5s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Learning Hub - Tab Switching
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        // Update active tab button
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update active panel
        tabPanels.forEach(panel => {
            if (panel.id === targetTab) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
        
        // Reset any expanded cards in other panels to keep it clean
        document.querySelectorAll('.concept-card.expanded').forEach(card => {
            if (!card.closest('.tab-panel.active')) {
                card.classList.remove('expanded');
                const content = card.querySelector('.card-content');
                if (content) content.style.maxHeight = null;
            }
        });
    });
});

// Learning Hub - Card Expand/Collapse
const conceptCards = document.querySelectorAll('.concept-card');

conceptCards.forEach(card => {
    const header = card.querySelector('.card-header');
    const content = card.querySelector('.card-content');
    
    header.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const isExpanded = card.classList.contains('expanded');
        
        if (isExpanded) {
            card.classList.remove('expanded');
            content.style.maxHeight = null;
        } else {
            card.classList.add('expanded');
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
});

// ==========================================
// Corporate Action Calculator Integration
// ==========================================

let activeCalcTab = 'dividend';

const calcTabButtons = document.querySelectorAll('.calc-tab-btn');
const calcPanels = document.querySelectorAll('.calc-panel');

function switchCalcTab(tab) {
    activeCalcTab = tab;
    
    // Toggle Active tab button
    calcTabButtons.forEach(btn => {
        if (btn.getAttribute('data-calc-tab') === tab) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Toggle Active panel
    calcPanels.forEach(panel => {
        if (panel.id === `calc-${tab}-panel`) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });

    // Run active calculations
    triggerCalculation();
}

calcTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-calc-tab');
        switchCalcTab(tab);
    });
});

// Format currency
function fmtRupees(amt) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(amt);
}

// Trigger active calculations based on selected tab
function triggerCalculation() {
    if (activeCalcTab === 'dividend') {
        runCalcDividend();
    } else if (activeCalcTab === 'bonus') {
        runCalcBonus();
    } else if (activeCalcTab === 'split') {
        runCalcSplit();
    }
}

// Dividend Calculation
function runCalcDividend() {
    const shares = parseFloat(document.getElementById('c-div-shares').value) || 0;
    const price = parseFloat(document.getElementById('c-div-price').value) || 0.1;
    const divType = document.getElementById('c-div-type').value;
    const divVal = parseFloat(document.getElementById('c-div-val').value) || 0;
    const fvGroup = document.getElementById('c-div-fv-group');

    let divPerShare = divVal;
    if (divType === 'percentage') {
        if(fvGroup) fvGroup.style.display = 'block';
        const fv = parseFloat(document.getElementById('c-div-fv').value) || 10;
        divPerShare = fv * (divVal / 100);
        const label = document.getElementById('c-div-val-label');
        const prefix = document.getElementById('c-div-val-prefix');
        if(label) label.innerText = 'Dividend Declared (%)';
        if(prefix) prefix.innerText = '%';
    } else {
        if(fvGroup) fvGroup.style.display = 'none';
        const label = document.getElementById('c-div-val-label');
        const prefix = document.getElementById('c-div-val-prefix');
        if(label) label.innerText = 'Dividend Per Share (₹)';
        if(prefix) prefix.innerText = '₹';
    }

    const totalPayout = shares * divPerShare;
    const divYield = (divPerShare / price) * 100;
    const totalVal = shares * price;

    // Inject metrics
    const grid = document.getElementById('c-results-metric-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="calc-result-box">
                <div class="calc-result-value">${fmtRupees(divPerShare)}</div>
                <div class="calc-result-label">Dividend Per Share</div>
            </div>
            <div class="calc-result-box">
                <div class="calc-result-value" style="color: var(--success);">${fmtRupees(totalPayout)}</div>
                <div class="calc-result-label">Total Cash Payout</div>
            </div>
            <div class="calc-result-box">
                <div class="calc-result-value">${divYield.toFixed(2)}%</div>
                <div class="calc-result-label">Dividend Yield</div>
            </div>
            <div class="calc-result-box">
                <div class="calc-result-value">${fmtRupees(totalVal)}</div>
                <div class="calc-result-label">Total Portfolio Value</div>
            </div>
        `;
    }

    // Inject explanations
    const expEn = document.getElementById('c-explanation-en');
    const expHi = document.getElementById('c-explanation-hi');
    if (expEn) {
        expEn.innerHTML = `
            You will receive a total cash dividend of <strong>${fmtRupees(totalPayout)}</strong> for your <strong>${shares} shares</strong>, paid at <strong>${fmtRupees(divPerShare)} per share</strong>. This cash will be credited directly to your bank account. Your Dividend Yield stands at <strong>${divYield.toFixed(2)}%</strong> relative to the current market price of ${fmtRupees(price)}.
        `;
    }
    if (expHi) {
        expHi.innerHTML = `
            Aapko aapke <strong>${shares} shares</strong> par total <strong>${fmtRupees(totalPayout)}</strong> ka cash dividend milega, jo ki <strong>${fmtRupees(divPerShare)} per share</strong> ke hisab se hai. Ye paisa seedhe aapke bank account me transfer kiya jayega. Aapka Dividend Yield <strong>${divYield.toFixed(2)}%</strong> hai, yaani aapke stock investment par itna extra cash return mila hai!
        `;
    }
}

// Bonus Calculation
function runCalcBonus() {
    const shares = parseFloat(document.getElementById('c-bonus-shares').value) || 0;
    const price = parseFloat(document.getElementById('c-bonus-price').value) || 0.1;
    const ratioA = parseFloat(document.getElementById('c-bonus-ratio-a').value) || 1;
    const ratioB = parseFloat(document.getElementById('c-bonus-ratio-b').value) || 1;

    const newShares = Math.floor(shares / ratioB) * ratioA;
    const totalShares = shares + newShares;
    
    const exPrice = (price * ratioB) / (ratioA + ratioB);
    const totalValBefore = shares * price;

    const grid = document.getElementById('c-results-metric-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="calc-result-box">
                <div class="calc-result-value" style="color: var(--success);">${newShares}</div>
                <div class="calc-result-label">Bonus Shares Received</div>
            </div>
            <div class="calc-result-box">
                <div class="calc-result-value">${totalShares}</div>
                <div class="calc-result-label">New Total Shares</div>
            </div>
            <div class="calc-result-box">
                <div class="calc-result-value">${fmtRupees(exPrice)}</div>
                <div class="calc-result-label">Ex-Bonus Share Price</div>
            </div>
            <div class="calc-result-box">
                <div class="calc-result-value">${fmtRupees(totalValBefore)}</div>
                <div class="calc-result-label">Total Portfolio Value</div>
            </div>
        `;
    }

    const expEn = document.getElementById('c-explanation-en');
    const expHi = document.getElementById('c-explanation-hi');
    if (expEn) {
        expEn.innerHTML = `
            With a bonus ratio of <strong>${ratioA}:${ratioB}</strong>, you will receive <strong>${newShares} free shares</strong> for your existing <strong>${shares} shares</strong>. Your total share quantity will increase to <strong>${totalShares} shares</strong>. The share price will adjust from <strong>${fmtRupees(price)}</strong> to <strong>${fmtRupees(exPrice)} per share</strong>. Your total portfolio value remains identical at <strong>${fmtRupees(totalValBefore)}</strong>.
        `;
    }
    if (expHi) {
        expHi.innerHTML = `
            <strong>${ratioA}:${ratioB}</strong> Bonus Ratio ke mutabik, aapko aapke <strong>${shares} shares</strong> par bilkul free me <strong>${newShares} naye shares</strong> milenge. Isse aapki total quantity badh kar <strong>${totalShares} shares</strong> ho jayegi. Price ratio ke hisab se adjust ho kar <strong>${fmtRupees(price)}</strong> se kam ho kar <strong>${fmtRupees(exPrice)} per share</strong> ho jayega. **Aapki total investment value (${fmtRupees(totalValBefore)}) bilkul same rahegi!**
        `;
    }
}

// Split Calculation
function runCalcSplit() {
    const shares = parseFloat(document.getElementById('c-split-shares').value) || 0;
    const price = parseFloat(document.getElementById('c-split-price').value) || 0.1;
    const oldFV = parseFloat(document.getElementById('c-split-old-fv').value) || 10;
    const newFV = parseFloat(document.getElementById('c-split-new-fv').value) || 1;

    const splitFactor = oldFV / newFV;
    
    if (newFV >= oldFV) {
        const grid = document.getElementById('c-results-metric-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="calc-result-box" style="grid-column: span 2; border-color: red;">
                    <div class="calc-result-value" style="color: red; font-size: 1.1rem;">⚠️ Invalid Face Value Split</div>
                    <div class="calc-result-label">New FV must be lower than Old FV!</div>
                </div>
            `;
        }
        const expEn = document.getElementById('c-explanation-en');
        const expHi = document.getElementById('c-explanation-hi');
        if (expEn) expEn.innerText = 'Please select a New Face Value that is smaller than the Old Face Value to calculate stock split details.';
        if (expHi) expHi.innerText = 'Kripya New Face Value ko Old Face Value se chota chunein taaki stock split ka calculation ho sake.';
        return;
    }

    const totalShares = shares * splitFactor;
    const exPrice = price / splitFactor;
    const totalValBefore = shares * price;

    const grid = document.getElementById('c-results-metric-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="calc-result-box">
                <div class="calc-result-value" style="color: var(--success);">${splitFactor}x</div>
                <div class="calc-result-label">Split Multiplier</div>
            </div>
            <div class="calc-result-box">
                <div class="calc-result-value">${totalShares}</div>
                <div class="calc-result-label">New Total Shares</div>
            </div>
            <div class="calc-result-box">
                <div class="calc-result-value">${fmtRupees(exPrice)}</div>
                <div class="calc-result-label">Ex-Split Share Price</div>
            </div>
            <div class="calc-result-box">
                <div class="calc-result-value">${fmtRupees(totalValBefore)}</div>
                <div class="calc-result-label">Total Portfolio Value</div>
            </div>
        `;
    }

    const expEn = document.getElementById('c-explanation-en');
    const expHi = document.getElementById('c-explanation-hi');
    if (expEn) {
        expEn.innerHTML = `
            The stock split reduces Face Value from <strong>₹${oldFV}</strong> to <strong>₹${newFV}</strong> (split factor of <strong>${splitFactor}:1</strong>). Your <strong>${shares} shares</strong> will multiply to <strong>${totalShares} shares</strong>. The share price adjusts down from <strong>${fmtRupees(price)}</strong> to <strong>${fmtRupees(exPrice)} per share</strong>. Total investment value remains identical at <strong>${fmtRupees(totalValBefore)}</strong>.
        `;
    }
    if (expHi) {
        expHi.innerHTML = `
            Face Value <strong>₹${oldFV}</strong> se ghat kar <strong>₹${newFV}</strong> ho rahi hai, yaani split factor <strong>${splitFactor}:1</strong> hai. Aapke <strong>${shares} shares</strong> badh kar <strong>${totalShares} shares</strong> ho jayenge. Market price adjust ho kar <strong>${fmtRupees(price)}</strong> se ghat kar <strong>${fmtRupees(exPrice)} per share</strong> ho jayega. **Aapki total investment value (${fmtRupees(totalValBefore)}) par koi asar nahi padega!**
        `;
    }
}

// Bind calculator inputs
const bindCalcInputs = () => {
    // Dividend bindings
    const divInputs = ['c-div-shares', 'c-div-price', 'c-div-type', 'c-div-val', 'c-div-fv'];
    divInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', runCalcDividend);
    });

    // Bonus bindings
    const bonusInputs = ['c-bonus-shares', 'c-bonus-price', 'c-bonus-ratio-a', 'c-bonus-ratio-b'];
    bonusInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', runCalcBonus);
    });

    // Split bindings
    const splitInputs = ['c-split-shares', 'c-split-price', 'c-split-old-fv', 'c-split-new-fv'];
    splitInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', runCalcSplit);
    });
};

// Initialize Calculator on load
const initCalculator = () => {
    bindCalcInputs();
    triggerCalculation();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculator);
} else {
    initCalculator();
}
