(function() {
    var heartsContainer = document.getElementById('hearts');
    if (!heartsContainer) return;
    var emojis = ['💕','💖','💗','💓','💝','✨','💫'];
    for (var i = 0; i < 15; i++) {
        (function(i) {
            setTimeout(function() {
                var h = document.createElement('div');
                h.className = 'heart';
                h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                h.style.left = Math.random() * 100 + 'vw';
                h.style.animationDuration = (6 + Math.random() * 8) + 's';
                h.style.animationDelay = (Math.random() * 5) + 's';
                h.style.fontSize = (0.8 + Math.random() * 1.2) + 'rem';
                heartsContainer.appendChild(h);
            }, i * 400);
        })(i);
    }
})();