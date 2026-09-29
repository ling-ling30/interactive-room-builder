/** Serene Bali sunset wallpaper with widget dock. */
export function renderNatureWallpaperScreen(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Rich tropical sunset gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#0f172a'); // Twilight navy
  grad.addColorStop(0.35, '#312e81'); // Indigo
  grad.addColorStop(0.65, '#ea580c'); // Vibrant sunset amber
  grad.addColorStop(0.85, '#f59e0b'); // Golden hour
  grad.addColorStop(1, '#064e3b'); // Lush jungle green
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Golden Sun sphere setting
  const sunGrad = ctx.createRadialGradient(w / 2, h * 0.65, 10, w / 2, h * 0.65, 120);
  sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  sunGrad.addColorStop(0.3, 'rgba(254, 215, 170, 0.7)');
  sunGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.65, 120, 0, Math.PI * 2);
  ctx.fill();

  // Tropical palm silhouettes on sides
  ctx.fillStyle = '#060910';
  // Left palm tree
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.quadraticCurveTo(80, h * 0.5, 140, h * 0.25);
  ctx.lineTo(130, h * 0.25);
  ctx.quadraticCurveTo(70, h * 0.5, 0, h);
  ctx.fill();

  // Palm leaves
  for (let leaf = 0; leaf < 6; leaf++) {
    const angle = (leaf * Math.PI) / 4 - 0.4;
    ctx.beginPath();
    ctx.moveTo(140, h * 0.25);
    ctx.quadraticCurveTo(
      140 + Math.cos(angle) * 90,
      h * 0.25 + Math.sin(angle) * 70,
      140 + Math.cos(angle) * 130,
      h * 0.25 + Math.sin(angle) * 110 + 20
    );
    ctx.stroke();
  }

  // Modern Minimalist Desktop Widgets
  // Center Clock
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.font = '300 68px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('16:42', w / 2, h * 0.38);

  ctx.font = '500 14px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillText('Tuesday, September 29 · Canggu, Bali · 29°C Warm Breeze', w / 2, h * 0.44);
  ctx.textAlign = 'left';

  // Frosted Apple-style Dock at bottom
  const dockW = 380;
  const dockH = 46;
  const dockX = (w - dockW) / 2;
  const dockY = h - 60;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(dockX, dockY, dockW, dockH, 18);
  ctx.fill();
  ctx.stroke();

  // Dock App Icons
  const appColors = ['#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];
  appColors.forEach((color, i) => {
    const iconX = dockX + 22 + i * 48;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(iconX, dockY + 8, 30, 30, 8);
    ctx.fill();
  });
}
