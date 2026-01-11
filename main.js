// Tạo particles hoa mai vàng bay
for (let i = 0; i < 30; i++) {
  const particle = document.createElement('div');
  particle.className = 'particle';
  particle.style.left = Math.random() * 100 + '%';
  particle.style.animationDuration = Math.random() * 5 + 8 + 's';
  particle.style.animationDelay = Math.random() * 5 + 's';
  particle.style.width = Math.random() * 8 + 8 + 'px';
  particle.style.height = particle.style.width;
  document.body.appendChild(particle);
}
