
// ============================================
// EMAILJS CONFIGURATION
// ============================================
const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_g411knq',      
    TEMPLATE_ID: 'template_g7g5nrk',    
    PUBLIC_KEY: 'jhxfGC6sBE5RpWi74'     
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

// ============================================
// GLOBAL VARIABLES
// ============================================
let openTime = null;
let noClickCount = 0;
let matchedItems = new Set(); // Track matched items
const totalItems = 7;
let draggedElement = null;

// Store connection lines for each match
let connections = {};

// ============================================
// SCREEN NAVIGATION
// ============================================
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen with fade animation
    setTimeout(() => {
        document.getElementById(screenId).classList.add('active');
    }, 100);
}

// ============================================
// SCREEN 1: GREETING & START BUTTON
// ============================================
document.getElementById('startBtn').addEventListener('click', function() {
    // Record the time when she opened the link
    openTime = new Date().toLocaleString();
    
    // Send first EmailJS notification
    sendOpenNotification();
    
    // Move to game screen
    showScreen('screen2');
    
    // Initialize game after screen is visible
    setTimeout(initializeGame, 200);
});

// Send notification when the link is opened
function sendOpenNotification() {
    const templateParams = {
        message: 'She opened the Valentine invitation',
        timestamp: openTime,
        to_name: 'You'  // Can customize this
    };
    
    emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
    ).then(
        function(response) {
            console.log('Open notification sent!', response.status, response.text);
        },
        function(error) {
            console.log('Failed to send notification...', error);
        }
    );
}

// ============================================
// SCREEN 2: DRAG AND DROP GAME WITH LINE CONNECTIONS
// ============================================

function initializeGame() {
    const dragItems = document.querySelectorAll('.drag-item');
    const dropTargets = document.querySelectorAll('.drop-target');
    
    // Add drag event listeners to draggable items
    dragItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        
        // Touch support for mobile
        item.addEventListener('touchstart', handleTouchStart, {passive: false});
        item.addEventListener('touchmove', handleTouchMove, {passive: false});
        item.addEventListener('touchend', handleTouchEnd, {passive: false});
    });
    
    // Add drop event listeners to drop targets
    dropTargets.forEach(target => {
        target.addEventListener('dragover', handleDragOver);
        target.addEventListener('dragleave', handleDragLeave);
        target.addEventListener('drop', handleDrop);
    });
}

// === DRAG HANDLERS ===
function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    this.classList.add('drag-over');
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    e.preventDefault();
    this.classList.remove('drag-over');
    
    // Check if the match is correct
    const draggedMatch = draggedElement.getAttribute('data-match');
    const targetMatch = this.getAttribute('data-match');
    
    if (draggedMatch === targetMatch) {
        // Correct match!
        handleCorrectMatch(draggedElement, this);
    } else {
        // Wrong match - shake animation
        shakeElement(draggedElement);
    }
    
    return false;
}

// === TOUCH HANDLERS FOR MOBILE ===
let touchStartX, touchStartY;
let touchElement = null;
let isDragging = false;

function handleTouchStart(e) {
    touchElement = this;
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    isDragging = true;
    this.classList.add('dragging');
}

function handleTouchMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const currentX = touch.clientX;
    const currentY = touch.clientY;
    
    // Visual feedback (optional - could move a clone)
}

function handleTouchEnd(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    isDragging = false;
    this.classList.remove('dragging');
    
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Check if dropped on a drop target
    if (dropTarget && dropTarget.classList.contains('drop-target')) {
        const draggedMatch = touchElement.getAttribute('data-match');
        const targetMatch = dropTarget.getAttribute('data-match');
        
        if (draggedMatch === targetMatch) {
            handleCorrectMatch(touchElement, dropTarget);
        } else {
            shakeElement(touchElement);
        }
    }
    
    touchElement = null;
}

// === HANDLE CORRECT MATCH ===
function handleCorrectMatch(dragItem, dropTarget) {
    const matchId = dragItem.getAttribute('data-match');
    
    // Check if already matched
    if (matchedItems.has(matchId)) {
        return;
    }
    
    // Mark as matched
    matchedItems.add(matchId);
    dragItem.classList.add('matched');
    dropTarget.classList.add('filled');
    
    // Draw connection line
    drawConnectionLine(dragItem, dropTarget, matchId);
    
    // Check if all items are matched
    if (matchedItems.size === totalItems) {
        // Show the Next button
        setTimeout(() => {
            document.getElementById('nextBtn').style.display = 'block';
        }, 500);
    }
}

// === DRAW SVG LINE BETWEEN DRAG ITEM AND DROP TARGET ===
function drawConnectionLine(dragItem, dropTarget, matchId) {
    const svg = document.getElementById('connectionLines');
    const gameArea = document.querySelector('.game-area');
    
    // Get positions relative to game area
    const dragRect = dragItem.getBoundingClientRect();
    const dropRect = dropTarget.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();
    
    // Calculate centers of each element
    const x1 = dragRect.left - gameRect.left + dragRect.width / 2;
    const y1 = dragRect.top - gameRect.top + dragRect.height / 2;
    const x2 = dropRect.left - gameRect.left + dropRect.width / 2;
    const y2 = dropRect.top - gameRect.top + dropRect.height / 2;
    
    // Create SVG line element
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#ff6b9d'); // Soft romantic pink
    line.setAttribute('stroke-width', '3');
    line.setAttribute('stroke-linecap', 'round');
    line.classList.add('connection-line');
    line.setAttribute('data-match', matchId);
    
    // Add to SVG
    svg.appendChild(line);
    
    // Store for potential redraw on resize
    connections[matchId] = { dragItem, dropTarget, line };
}

// === SHAKE ANIMATION FOR WRONG MATCH ===
function shakeElement(element) {
    element.style.animation = 'shake 0.5s';
    setTimeout(() => {
        element.style.animation = '';
    }, 500);
}

// === REDRAW LINES ON WINDOW RESIZE ===
window.addEventListener('resize', () => {
    // Redraw all connection lines
    Object.keys(connections).forEach(matchId => {
        const { dragItem, dropTarget, line } = connections[matchId];
        
        const gameArea = document.querySelector('.game-area');
        const dragRect = dragItem.getBoundingClientRect();
        const dropRect = dropTarget.getBoundingClientRect();
        const gameRect = gameArea.getBoundingClientRect();
        
        const x1 = dragRect.left - gameRect.left + dragRect.width / 2;
        const y1 = dragRect.top - gameRect.top + dragRect.height / 2;
        const x2 = dropRect.left - gameRect.left + dropRect.width / 2;
        const y2 = dropRect.top - gameRect.top + dropRect.height / 2;
        
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
    });
});

// Next button click handler
document.getElementById('nextBtn').addEventListener('click', function() {
    showScreen('screen3');
});

// ============================================
// SCREEN 3: VALENTINE QUESTION
// ============================================
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
let yesBtnScale = 1;

// NO button click handler
noBtn.addEventListener('click', function() {
    noClickCount++;
    
    // Increase YES button size
    yesBtnScale += 0.3;
    yesBtn.style.transform = `scale(${yesBtnScale})`;
    yesBtn.style.transition = 'transform 0.3s ease';
    
    // After 4 clicks, make YES button full screen
    if (noClickCount >= 4) {
        yesBtn.style.position = 'fixed';
        yesBtn.style.top = '0';
        yesBtn.style.left = '0';
        yesBtn.style.width = '100vw';
        yesBtn.style.height = '100vh';
        yesBtn.style.borderRadius = '0';
        yesBtn.style.zIndex = '1000';
        yesBtn.style.transform = 'scale(1)';
        yesBtn.textContent = 'Yes, hehe';
        
        // Hide NO button
        noBtn.style.display = 'none';
    }
});

// YES button click handler
yesBtn.addEventListener('click', function() {
    showScreen('screen4');
});

// ============================================
// SCREEN 4: SWEET MESSAGE & FINISH
// ============================================
document.getElementById('finishBtn').addEventListener('click', function() {
    // Send final EmailJS notification with all data
    sendFinalNotification();
    
    // Show a thank you alert (optional)
    setTimeout(() => {
        alert('💕 Happy Valentine\'s Day! 💕');
    }, 500);
});

// Send final notification with all collected data
function sendFinalNotification() {
    const templateParams = {
        message: 'She completed the Valentine site',
        open_time: openTime,
        final_answer: 'YES',
        no_click_count: noClickCount,
        to_name: 'You'  // Can customize this
    };
    
    emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
    ).then(
        function(response) {
            console.log('Final notification sent!', response.status, response.text);
        },
        function(error) {
            console.log('Failed to send final notification...', error);
        }
    );
}

// ============================================
// MOBILE OPTIMIZATION
// ============================================
// Prevent zoom on double tap (iOS)
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// ============================================
// CONSOLE LOG FOR DEBUGGING
// ============================================
console.log('Valentine\'s Day Web App Loaded! 💕');
console.log('Remember to replace EmailJS credentials in script.js');
console.log('Image order (left): cat, fries, donut, flower, ice cream, kwek kwek, chocolate');
console.log('Word order (right): donut, fries, cat, kwek kwek, flower, chocolate, ice cream');