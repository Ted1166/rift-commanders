// Particle effects for combat
export function createDamageParticles(x: number, y: number, damage: number) {
  const particles: HTMLDivElement[] = [];
  const colors = ['#00ff41', '#ff4141', '#ffff41'];

  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.className = 'damage-particle';
    particle.style.position = 'fixed';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = '4px';
    particle.style.height = '4px';
    particle.style.borderRadius = '50%';
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';

    const angle = (Math.PI * 2 * i) / 8;
    const velocity = 50 + Math.random() * 50;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;

    document.body.appendChild(particle);
    particles.push(particle);

    let progress = 0;
    const animate = () => {
      progress += 0.02;
      if (progress >= 1) {
        particle.remove();
        return;
      }

      const currentX = x + vx * progress;
      const currentY = y + vy * progress + (progress * progress * 200);
      const opacity = 1 - progress;

      particle.style.left = `${currentX}px`;
      particle.style.top = `${currentY}px`;
      particle.style.opacity = `${opacity}`;

      requestAnimationFrame(animate);
    };

    animate();
  }

  // Damage number
  const damageText = document.createElement('div');
  damageText.textContent = `-${damage}`;
  damageText.style.position = 'fixed';
  damageText.style.left = `${x}px`;
  damageText.style.top = `${y}px`;
  damageText.style.color = '#ff4141';
  damageText.style.fontSize = '24px';
  damageText.style.fontWeight = 'bold';
  damageText.style.fontFamily = 'monospace';
  damageText.style.pointerEvents = 'none';
  damageText.style.zIndex = '9999';
  damageText.style.textShadow = '0 0 10px rgba(255, 65, 65, 0.8)';

  document.body.appendChild(damageText);

  let textProgress = 0;
  const animateText = () => {
    textProgress += 0.015;
    if (textProgress >= 1) {
      damageText.remove();
      return;
    }

    const currentY = y - textProgress * 100;
    const opacity = 1 - textProgress;

    damageText.style.top = `${currentY}px`;
    damageText.style.opacity = `${opacity}`;

    requestAnimationFrame(animateText);
  };

  animateText();
}

// Screen shake effect
export function screenShake(duration: number = 300, intensity: number = 5) {
  const element = document.body;
  const originalTransform = element.style.transform;

  let startTime: number | null = null;

  const shake = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    if (elapsed < duration) {
      const x = (Math.random() - 0.5) * intensity;
      const y = (Math.random() - 0.5) * intensity;
      element.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(shake);
    } else {
      element.style.transform = originalTransform;
    }
  };

  requestAnimationFrame(shake);
}