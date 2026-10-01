/**
 * Cyberpunk Matrix / System Telemetry screen texture for monitor display
 */
export function renderCyberTerminalScreen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  // Deep CRT Dark Void
  ctx.fillStyle = '#05080f';
  ctx.fillRect(0, 0, width, height);

  // Top Neon Bar
  ctx.fillStyle = '#0a1322';
  ctx.fillRect(0, 0, width, 32);

  ctx.fillStyle = '#00f0ff';
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.fillText('TERMINAL // NODE_MONITOR // CORE_SYS_v4.8', 16, 21);

  ctx.fillStyle = '#ff0077';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('CPU 99.4% · 64GB DDR5 · RTX 4090 TI · 240Hz', width - 290, 21);

  // Side Navigation & System Gauges
  const sideW = 200;
  ctx.fillStyle = '#080d1a';
  ctx.fillRect(0, 32, sideW, height - 32);

  ctx.strokeStyle = '#00f0ff22';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 32, sideW, height - 32);

  // System Tree
  ctx.fillStyle = '#38bdf8';
  ctx.font = '11px monospace';
  const sysItems = [
    '▸ PROCESSES [Active: 142]',
    '▸ KERNEL_DAEMON [OK]',
    '▸ MEMORY_HEAP [62%]',
    '▸ GPU_VRAM [18.2GB]',
    '▸ NET_SOCKET [ONLINE]',
    '▸ CIPHER_KEY [VALID]',
    '▸ THREE_ENGINE [60 FPS]',
  ];
  sysItems.forEach((item, i) => {
    ctx.fillText(item, 14, 60 + i * 24);
  });

  // Main Terminal Window
  const termX = sideW + 12;
  const termY = 44;
  const termW = width - sideW - 24;
  const termH = height - 56;

  ctx.fillStyle = '#030509';
  ctx.fillRect(termX, termY, termW, termH);
  ctx.strokeStyle = '#00f0ff44';
  ctx.strokeRect(termX, termY, termW, termH);

  // Terminal Lines
  const lines = [
    { prefix: '[INIT]', text: 'Boot sequence initialized. Antigravity 3D Desk Studio v2.4', color: '#00f0ff' },
    { prefix: '[INFO]', text: 'Mounting virtual workspace: Herman Miller Aeron Remastered detected.', color: '#34d399' },
    { prefix: '[CALC]', text: 'Telescopic standing desk elevation synchronized to 75.0cm.', color: '#38bdf8' },
    { prefix: '[AUDIO]', text: 'Spatial stereo monitors online. Sample rate 96kHz / 24-bit.', color: '#f59e0b' },
    { prefix: '[LIGHT]', text: 'Desk illumination array active: 3000K warm spotlight at 85% flux.', color: '#fbbf24' },
    { prefix: '[INPUT]', text: 'Custom 75% Mechanical Keyboard polling at 8,000Hz.', color: '#ec4899' },
    { prefix: '[SYS]', text: 'All essential and accessory slots configured successfully.', color: '#10b981' },
    { prefix: '[EXEC]', text: 'antigravity --render-workspace --high-fidelity --fps=60', color: '#a78bfa' },
  ];

  lines.forEach((line, i) => {
    const y = termY + 32 + i * 28;
    ctx.fillStyle = line.color;
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText(`${line.prefix} `, termX + 16, y);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText(line.text, termX + 80, y);
  });

  // Animated-looking Memory Graphs / Data Waves
  const chartY = termY + termH - 120;
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < termW - 32; x += 10) {
    const waveY = chartY + Math.sin(x * 0.05) * 20 + Math.cos(x * 0.12) * 12;
    if (x === 0) ctx.moveTo(termX + 16 + x, waveY);
    else ctx.lineTo(termX + 16 + x, waveY);
  }
  ctx.stroke();

  // CRT Scanlines Overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 2);
  }
}
