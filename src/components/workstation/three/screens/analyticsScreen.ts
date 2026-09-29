/** Financial and trading analytics dashboard. */
export function renderAnalyticsScreen(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Background
  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 0, w, h);

  // Header Ticker Bar
  ctx.fillStyle = '#111722';
  ctx.fillRect(0, 0, w, 40);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('MONIS CAPITAL TERMINAL', 16, 25);

  const tickers = [
    { symbol: 'BTC/USD', price: '$94,820', chg: '+4.85%', up: true },
    { symbol: 'ETH/USD', price: '$3,485', chg: '+2.14%', up: true },
    { symbol: 'NVDA', price: '$148.60', chg: '+6.20%', up: true },
    { symbol: 'BALI-VILLA-INDEX', price: '1,420.5', chg: '+1.05%', up: true }
  ];

  tickers.forEach((t, i) => {
    const tx = 220 + i * 190;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`${t.symbol}  ${t.price}`, tx, 25);
    ctx.fillStyle = t.up ? '#10b981' : '#ef4444';
    ctx.fillText(t.chg, tx + 130, 25);
  });

  // Main Candlestick Chart Area
  const chartX = 20;
  const chartY = 56;
  const chartW = w - 240;
  const chartH = h - 130;

  ctx.fillStyle = '#0e131d';
  ctx.fillRect(chartX, chartY, chartW, chartH);
  ctx.strokeStyle = '#1e2638';
  ctx.lineWidth = 1;
  ctx.strokeRect(chartX, chartY, chartW, chartH);

  // Horizontal Grid Lines
  for (let gy = chartY + 30; gy < chartY + chartH; gy += 45) {
    ctx.strokeStyle = '#161e2e';
    ctx.beginPath();
    ctx.moveTo(chartX, gy);
    ctx.lineTo(chartX + chartW, gy);
    ctx.stroke();
  }

  // Draw Candlesticks
  const numCandles = 32;
  const cWidth = (chartW - 40) / numCandles;
  let lastClose = 220;

  for (let i = 0; i < numCandles; i++) {
    const cx = chartX + 20 + i * cWidth;
    const isUp = Math.sin(i * 0.7 + 1.2) > -0.2;
    const candleH = Math.abs(Math.sin(i * 1.5)) * 40 + 15;
    const topY = chartY + 50 + lastClose + (isUp ? -candleH : 10);
    const wickHigh = topY - Math.random() * 18;
    const wickLow = topY + candleH + Math.random() * 18;

    ctx.strokeStyle = isUp ? '#10b981' : '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + cWidth / 2, wickHigh);
    ctx.lineTo(cx + cWidth / 2, wickLow);
    ctx.stroke();

    ctx.fillStyle = isUp ? '#10b981' : '#ef4444';
    ctx.fillRect(cx + 2, topY, cWidth - 4, Math.max(4, candleH));

    lastClose += isUp ? -12 : 10;
    lastClose = Math.max(20, Math.min(chartH - 90, lastClose));
  }

  // Right Side Order Book
  const obX = w - 200;
  ctx.fillStyle = '#0e131d';
  ctx.fillRect(obX, chartY, 180, chartH);
  ctx.strokeStyle = '#1e2638';
  ctx.strokeRect(obX, chartY, 180, chartH);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('LIVE ORDER DEPTH', obX + 12, chartY + 22);

  for (let row = 0; row < 10; row++) {
    const ry = chartY + 40 + row * 22;
    const isAsk = row < 5;
    ctx.fillStyle = isAsk ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';
    const depthW = Math.random() * 80 + 30;
    ctx.fillRect(obX + 175 - depthW, ry - 12, depthW, 18);

    ctx.fillStyle = isAsk ? '#f87171' : '#34d399';
    ctx.font = '10px monospace';
    ctx.fillText((94800 + (4 - row) * 15).toFixed(0), obX + 12, ry);

    ctx.fillStyle = '#cbd5e1';
    ctx.fillText((Math.random() * 2 + 0.2).toFixed(2), obX + 120, ry);
  }

  // Bottom Volume & Metric Strip
  ctx.fillStyle = '#111722';
  ctx.fillRect(chartX, h - 60, chartW, 45);
  ctx.fillStyle = '#38bdf8';
  ctx.font = '10px monospace';
  ctx.fillText('24H VOL: $1.42B  ·  RSI(14): 64.2  ·  MACD: BULLISH DIVERGENCE  ·  STATUS: HIGH LIQUIDITY', chartX + 16, h - 34);
}
