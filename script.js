// Fireworks Canvas Setup
const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Audio Setup
let soundEnabled = true;
let fireworkSound = null;

// Preload the firework explosion sound
function initAudio() {
    if (!fireworkSound) {
        fireworkSound = new Audio('assets/fireworkblast-106275.mp3');
        fireworkSound.volume = 0.5;
    }
}

function playFireworkSound() {
    if (!soundEnabled || !fireworkSound) return;

    // Clone the audio to allow overlapping sounds
    const soundClone = fireworkSound.cloneNode();
    soundClone.volume = 0.3 + Math.random() * 0.3; // Vary volume slightly
    soundClone.playbackRate = 0.9 + Math.random() * 0.2; // Vary pitch slightly
    soundClone.play().catch(() => {}); // Ignore errors if user hasn't interacted yet
}

function playCelebrationSound() {
    if (!soundEnabled) return;

    // Play firework sound for celebration too
    playFireworkSound();
}

// Firework Classes
class Particle {
    constructor(x, y, color, velocity, decay, gravity) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
        this.decay = decay;
        this.gravity = gravity;
        this.trail = [];
        this.maxTrail = 5;
    }

    update() {
        this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
        if (this.trail.length > this.maxTrail) {
            this.trail.shift();
        }

        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
    }

    draw() {
        // Draw trail
        this.trail.forEach((point, index) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${point.alpha * (index / this.maxTrail) * 0.5})`;
            ctx.fill();
        });

        // Draw particle
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha * 0.3})`;
        ctx.fill();
    }
}

class Firework {
    constructor(x, targetY, color) {
        this.x = x;
        this.y = canvas.height;
        this.targetY = targetY;
        this.color = color;
        this.velocity = { x: 0, y: -12 - Math.random() * 4 };
        this.particles = [];
        this.exploded = false;
        this.alpha = 1;
    }

    update() {
        if (!this.exploded) {
            this.y += this.velocity.y;
            this.velocity.y += 0.15;

            if (this.velocity.y >= 0 || this.y <= this.targetY) {
                this.explode();
            }
        }

        this.particles = this.particles.filter(p => p.alpha > 0);
        this.particles.forEach(p => p.update());
    }

    explode() {
        this.exploded = true;
        playFireworkSound();

        const particleCount = 80 + Math.floor(Math.random() * 40);
        const explosionType = Math.floor(Math.random() * 3);

        for (let i = 0; i < particleCount; i++) {
            let angle, speed;

            if (explosionType === 0) {
                // Circle explosion
                angle = (Math.PI * 2 / particleCount) * i;
                speed = 4 + Math.random() * 4;
            } else if (explosionType === 1) {
                // Random explosion
                angle = Math.random() * Math.PI * 2;
                speed = Math.random() * 8;
            } else {
                // Double ring
                angle = (Math.PI * 2 / (particleCount / 2)) * i;
                speed = i < particleCount / 2 ? 3 + Math.random() * 2 : 6 + Math.random() * 2;
            }

            this.particles.push(new Particle(
                this.x,
                this.y,
                this.color,
                {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                },
                0.015 + Math.random() * 0.01,
                0.05
            ));
        }
    }

    draw() {
        if (!this.exploded) {
            // Draw rocket
            ctx.beginPath();
            ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, 1)`;
            ctx.fill();

            // Rocket trail
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + 20);
            ctx.strokeStyle = `rgba(${this.color}, 0.5)`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        this.particles.forEach(p => p.draw());
    }

    isDead() {
        return this.exploded && this.particles.length === 0;
    }
}

// Firework colors
const colors = [
    '255, 107, 53',   // Orange
    '255, 20, 147',   // Pink
    '255, 215, 0',    // Gold
    '0, 255, 127',    // Spring Green
    '0, 191, 255',    // Deep Sky Blue
    '255, 255, 255',  // White
    '148, 0, 211',    // Violet
    '255, 69, 0',     // Red Orange
];

let fireworks = [];
let autoLaunch = true;

function launchFirework(x, y) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const targetY = y || 100 + Math.random() * (canvas.height * 0.4);
    const launchX = x || Math.random() * canvas.width;
    fireworks.push(new Firework(launchX, targetY, color));
}

function launchMultipleFireworks(count = 5) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => launchFirework(), i * 200);
    }
}

// Animation loop
function animate() {
    ctx.fillStyle = 'rgba(10, 10, 46, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fireworks = fireworks.filter(f => !f.isDead());
    fireworks.forEach(f => {
        f.update();
        f.draw();
    });

    // Auto launch fireworks
    if (autoLaunch && Math.random() < 0.02) {
        launchFirework();
    }

    requestAnimationFrame(animate);
}

animate();

// Initial fireworks burst
setTimeout(() => launchMultipleFireworks(8), 500);

// Floating Emojis
const celebrationEmojis = ['🎉', '🎊', '✨', '🌟', '💫', '🎆', '🎇', '🥳', '🍾', '🥂'];

function createFloatingEmoji(x, y) {
    const container = document.getElementById('floatingEmojis');
    const emoji = document.createElement('div');
    emoji.className = 'floating-emoji';
    emoji.textContent = celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)];
    emoji.style.left = x + 'px';
    emoji.style.top = y + 'px';
    emoji.style.fontSize = (1.5 + Math.random() * 1.5) + 'rem';
    container.appendChild(emoji);

    setTimeout(() => emoji.remove(), 4000);
}

// Confetti burst
function createConfetti(x, y, count = 50) {
    const colors = ['#ff6b35', '#ff1493', '#ffd700', '#00ff7f', '#00bfff', '#9400d3'];

    for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = x + 'px';
        confetti.style.top = y + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

        const angle = Math.random() * Math.PI * 2;
        const velocity = 5 + Math.random() * 10;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity - 5;

        confetti.style.setProperty('--vx', vx + 'px');
        confetti.style.setProperty('--vy', vy + 'px');

        confetti.animate([
            { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
            { transform: `translate(${vx * 30}px, ${vy * 30 + 200}px) rotate(720deg)`, opacity: 0 }
        ], {
            duration: 2000 + Math.random() * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });

        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
    }
}

// Fortune Messages (Surprise!)
const fortunes = [
    "2026 brings you unexpected opportunities that will change your life for the better! 🌟",
    "Your creativity will reach new heights this year. Trust your unique vision! 🎨",
    "A meaningful connection awaits you in the coming months. Keep your heart open! 💝",
    "Financial abundance flows your way in 2026. Smart decisions lead to prosperity! 💰",
    "Your health journey takes a positive turn. Energy and vitality are yours! 💪",
    "A long-held dream finally becomes reality this year. Believe in yourself! ✨",
    "Travel and adventure are written in your stars for 2026. Pack your bags! ✈️",
    "Your kindness creates ripples that return as waves of joy. Keep spreading love! 🌊",
    "A mentor or guide appears when you need them most. Wisdom is coming! 📚",
    "2026 is YOUR year to shine. The spotlight finds you! 🌟",
    "Unexpected laughter and joy fill your days. Embrace every moment! 😄",
    "Your hard work pays off in spectacular ways. Success is inevitable! 🏆",
    "Love deepens and grows stronger than ever in 2026. Cherish your connections! ❤️",
    "A creative project brings you recognition and fulfillment. Start creating! 🎭",
    "Peace and harmony become your constant companions this year. Breathe deeply! 🕊️"
];

let usedFortunes = [];

function getRandomFortune() {
    if (usedFortunes.length >= fortunes.length) {
        usedFortunes = [];
    }

    let fortune;
    do {
        fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    } while (usedFortunes.includes(fortune));

    usedFortunes.push(fortune);
    return fortune;
}

// Event Listeners
document.getElementById('fireworkBtn').addEventListener('click', function(e) {
    initAudio();
    launchMultipleFireworks(10);

    // Create floating emojis around click
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            createFloatingEmoji(
                e.clientX + (Math.random() - 0.5) * 100,
                e.clientY + (Math.random() - 0.5) * 100
            );
        }, i * 100);
    }
});

document.getElementById('soundToggle').addEventListener('click', function() {
    initAudio();
    soundEnabled = !soundEnabled;
    const icon = document.getElementById('soundIcon');

    if (soundEnabled) {
        icon.textContent = '🔊';
        this.innerHTML = '<span class="btn-icon" id="soundIcon">🔊</span> Sound On';
        this.classList.remove('muted');
        playCelebrationSound();
    } else {
        icon.textContent = '🔇';
        this.innerHTML = '<span class="btn-icon" id="soundIcon">🔇</span> Sound Off';
        this.classList.add('muted');
    }
});

document.getElementById('surpriseBtn').addEventListener('click', function(e) {
    initAudio();
    const fortuneCard = document.getElementById('fortuneCard');
    const fortuneText = document.getElementById('fortuneText');

    fortuneCard.classList.remove('hidden');
    fortuneText.textContent = getRandomFortune();

    setTimeout(() => {
        fortuneCard.classList.add('visible');
    }, 10);

    // Celebration effects
    createConfetti(e.clientX, e.clientY, 80);
    launchMultipleFireworks(5);
    playCelebrationSound();

    // Float emojis
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            createFloatingEmoji(
                Math.random() * window.innerWidth,
                window.innerHeight
            );
        }, i * 150);
    }

    this.style.display = 'none';
});

document.getElementById('newFortune').addEventListener('click', function(e) {
    initAudio();
    const fortuneText = document.getElementById('fortuneText');
    const fortuneCard = document.getElementById('fortuneCard');

    // Animate card flip
    fortuneCard.style.transform = 'scale(0.9) rotateY(90deg)';

    setTimeout(() => {
        fortuneText.textContent = getRandomFortune();
        fortuneCard.style.transform = 'scale(1) rotateY(0deg)';
    }, 300);

    playCelebrationSound();
    createConfetti(e.clientX, e.clientY, 30);
});

// Click anywhere for fireworks
canvas.style.pointerEvents = 'auto';
canvas.addEventListener('click', function(e) {
    initAudio();
    launchFirework(e.clientX, e.clientY * 0.3);
    createFloatingEmoji(e.clientX, e.clientY);
});

// Periodic floating emojis
setInterval(() => {
    if (Math.random() < 0.3) {
        createFloatingEmoji(
            Math.random() * window.innerWidth,
            window.innerHeight
        );
    }
}, 2000);

// Keyboard shortcut for more fireworks
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        initAudio();
        launchMultipleFireworks(15);
    }
});

console.log('🎆 Happy New Year 2026! Press SPACE for extra fireworks!');
