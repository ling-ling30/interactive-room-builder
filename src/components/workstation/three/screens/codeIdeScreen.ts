/** Full-stack developer IDE (VS Code dark). */
export function renderCodeIdeScreen(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Background
  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(0, 0, w, h);

  // Activity Bar (Far Left 48px)
  ctx.fillStyle = '#333333';
  ctx.fillRect(0, 0, 48, h);
  ctx.fillStyle = '#ffffff';
  // Explorer icon & git icon dots
  ctx.fillRect(16, 20, 16, 14);
  ctx.fillStyle = '#858585';
  ctx.fillRect(16, 50, 16, 14);
  ctx.fillRect(16, 80, 16, 14);

  // File Explorer Sidebar (Width 180px)
  ctx.fillStyle = '#252526';
  ctx.fillRect(48, 0, 180, h);
  ctx.fillStyle = '#bbbbbb';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('EXPLORER', 62, 26);

  const files = [
    '📁 src',
    '  📁 components',
    '    ⚡ Workstation3D.tsx',
    '    ⚡ VirtualScreen.ts',
    '    📄 styles.css',
    '  📁 types',
    '    🔷 workstation.ts',
    '  ⚙️ vite.config.ts',
    '  📦 package.json'
  ];
  files.forEach((f, idx) => {
    ctx.fillStyle = f.includes('Workstation3D') ? '#38bdf8' : '#cccccc';
    ctx.font = '10px monospace';
    ctx.fillText(f, 56, 54 + idx * 24);
  });

  // Editor Tabs Header
  const editorX = 228;
  const editorW = w - editorX;
  ctx.fillStyle = '#2d2d2d';
  ctx.fillRect(editorX, 0, editorW, 36);

  // Active Tab
  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(editorX, 0, 200, 36);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(editorX, 0, 200, 2);
  ctx.fillStyle = '#ffffff';
  ctx.font = '11px monospace';
  ctx.fillText('⚡ Workstation3D.tsx', editorX + 16, 22);

  // Code Editor Area
  const codeLines = [
    { num: 1, tokens: [{ text: "import", col: '#c586c0' }, { text: " * as THREE ", col: '#9cdcfe' }, { text: "from", col: '#c586c0' }, { text: " 'three';", col: '#ce9178' }] },
    { num: 2, tokens: [{ text: "import", col: '#c586c0' }, { text: " { WorkstationConfig } ", col: '#4ec9b0' }, { text: "from", col: '#c586c0' }, { text: " '../types/workstation';", col: '#ce9178' }] },
    { num: 3, tokens: [] },
    { num: 4, tokens: [{ text: "// Initialize Motorized Standing Desk Controller", col: '#6a9955' }] },
    { num: 5, tokens: [{ text: "export class", col: '#569cd6' }, { text: " MonisWorkstationEngine {", col: '#4ec9b0' }] },
    { num: 6, tokens: [{ text: "  private", col: '#569cd6' }, { text: " deskHeightM: ", col: '#9cdcfe' }, { text: "number", col: '#4ec9b0' }, { text: " = ", col: '#d4d4d4' }, { text: "0.75;", col: '#b5cea8' }] },
    { num: 7, tokens: [{ text: "  private", col: '#569cd6' }, { text: " dualMotors: ", col: '#9cdcfe' }, { text: "boolean", col: '#4ec9b0' }, { text: " = ", col: '#d4d4d4' }, { text: "true;", col: '#569cd6' }] },
    { num: 8, tokens: [] },
    { num: 9, tokens: [{ text: "  public setElevation", col: '#dcdcaa' }, { text: "(targetCm: ", col: '#9cdcfe' }, { text: "number", col: '#4ec9b0' }, { text: "): ", col: '#d4d4d4' }, { text: "void", col: '#569cd6' }, { text: " {", col: '#d4d4d4' }] },
    { num: 10, tokens: [{ text: "    this.deskHeightM = targetCm / 100;", col: '#9cdcfe' }] },
    { num: 11, tokens: [{ text: "    this.animateLiftingColumns(targetCm);", col: '#dcdcaa' }] },
    { num: 12, tokens: [{ text: "    console.log(", col: '#dcdcaa' }, { text: "`Workstation elevated to ${targetCm}cm`", col: '#ce9178' }, { text: ");", col: '#d4d4d4' }] },
    { num: 13, tokens: [{ text: "  }", col: '#d4d4d4' }] },
    { num: 14, tokens: [] },
    { num: 15, tokens: [{ text: "  public mountUltrawideScreen", col: '#dcdcaa' }, { text: "(): ", col: '#9cdcfe' }, { text: "THREE.Mesh", col: '#4ec9b0' }, { text: " {", col: '#d4d4d4' }] },
    { num: 16, tokens: [{ text: "    const curvedRatio = 21 / 9;", col: '#9cdcfe' }] },
    { num: 17, tokens: [{ text: "    return createCurvedDisplayGeometry(curvedRatio);", col: '#dcdcaa' }] },
    { num: 18, tokens: [{ text: "  }", col: '#d4d4d4' }] },
    { num: 19, tokens: [{ text: "}", col: '#d4d4d4' }] },
  ];

  const codeStartY = 56;
  codeLines.forEach((line, idx) => {
    const y = codeStartY + idx * 24;
    // Line Number
    ctx.fillStyle = '#858585';
    ctx.font = '11px monospace';
    ctx.fillText(line.num.toString().padStart(2, ' '), editorX + 16, y);

    // Code Tokens
    let curX = editorX + 50;
    line.tokens.forEach(tok => {
      ctx.fillStyle = tok.col;
      ctx.font = '11px monospace';
      ctx.fillText(tok.text, curX, y);
      curX += ctx.measureText(tok.text).width;
    });
  });

  // Bottom Status Bar
  ctx.fillStyle = '#007acc';
  ctx.fillRect(0, h - 22, w, 22);
  ctx.fillStyle = '#ffffff';
  ctx.font = '10px monospace';
  ctx.fillText('  git(main*)  ✓ 0 errors  TypeScript 5.8  UTF-8  LF  Bali-Canggu: 18ms', 10, h - 7);
}
