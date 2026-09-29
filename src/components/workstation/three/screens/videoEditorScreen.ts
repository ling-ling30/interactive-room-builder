/** Creative 4K video editor UI (timeline, waveforms, footage preview). */
export function renderVideoEditorScreen(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Background
  ctx.fillStyle = '#14161b';
  ctx.fillRect(0, 0, w, h);

  // Top App Bar
  ctx.fillStyle = '#1c1f26';
  ctx.fillRect(0, 0, w, 32);
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('Monis Cut Pro Studio  —  Bali_Villa_Cinematic_4K_Recut.prproj', 16, 21);

  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(w - 24, 16, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.fillText('4K 60FPS · ProRes 422 HQ', w - 180, 20);

  // Layout Division:
  // Upper Half (h = 0 to ~320): Media Bin (left 280px) | Program Monitor (middle/right)
  // Media Bin (Left)
  const mediaW = 260;
  const upperH = Math.round(h * 0.52);

  ctx.fillStyle = '#181b22';
  ctx.fillRect(0, 32, mediaW, upperH - 32);
  ctx.strokeStyle = '#272c38';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 32, mediaW, upperH - 32);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('PROJECT MEDIA & BINS', 14, 52);

  const clips = [
    { title: 'Scene01_Drone_Canggu.mov', dur: '00:12:40', color: '#38bdf8' },
    { title: 'Scene02_Desk_Ergonomics.mov', dur: '00:08:15', color: '#10b981' },
    { title: 'Scene03_Villa_Pool_Sunset.braw', dur: '00:24:02', color: '#f59e0b' },
    { title: 'Soundtrack_LoFi_Chill.wav', dur: '03:14:00', color: '#ec4899' },
    { title: 'Voiceover_Nomad_Story.wav', dur: '01:45:10', color: '#a855f7' },
  ];

  clips.forEach((c, idx) => {
    const y = 72 + idx * 36;
    ctx.fillStyle = '#1f242e';
    ctx.fillRect(10, y, mediaW - 20, 28);
    ctx.fillStyle = c.color;
    ctx.fillRect(12, y + 4, 4, 20);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '10px monospace';
    ctx.fillText(c.title, 24, y + 18);
    ctx.fillStyle = '#64748b';
    ctx.fillText(c.dur, mediaW - 65, y + 18);
  });

  // Program Playback Monitor (Center & Right)
  const monitorX = mediaW;
  const monitorW = w - mediaW;
  ctx.fillStyle = '#0a0c10';
  ctx.fillRect(monitorX, 32, monitorW, upperH - 32);

  // Simulated 4K footage inside program monitor (Tropical Bali sunset gradient with pool & palms)
  const footageX = monitorX + 16;
  const footageY = 44;
  const footageW = monitorW - 32;
  const footageH = upperH - 56;

  const grad = ctx.createLinearGradient(footageX, footageY, footageX, footageY + footageH);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(0.4, '#ea580c');
  grad.addColorStop(0.7, '#fbbf24');
  grad.addColorStop(1, '#064e3b');
  ctx.fillStyle = grad;
  ctx.fillRect(footageX, footageY, footageW, footageH);

  // Silhouetted palm trees & villa roofline
  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.moveTo(footageX, footageY + footageH);
  ctx.lineTo(footageX + 60, footageY + footageH - 40);
  ctx.lineTo(footageX + 180, footageY + footageH - 35);
  ctx.lineTo(footageX + 320, footageY + footageH);
  ctx.fill();

  // Playhead overlay & TC on footage
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(footageX + 12, footageY + footageH - 32, 160, 22);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('REC ▶ 00:04:18:12', footageX + 20, footageY + footageH - 17);

  // Bottom Half: MULTI-TRACK TIMELINE
  const timelineY = upperH;
  const timelineH = h - timelineY;
  ctx.fillStyle = '#161920';
  ctx.fillRect(0, timelineY, w, timelineH);

  // Timeline Ruler Bar
  ctx.fillStyle = '#212631';
  ctx.fillRect(0, timelineY, w, 24);
  ctx.fillStyle = '#64748b';
  ctx.font = '9px monospace';
  for (let s = 0; s < 12; s++) {
    const rx = 100 + s * 75;
    ctx.fillText(`00:0${s}:00`, rx, timelineY + 16);
    ctx.fillRect(rx, timelineY + 18, 1, 6);
  }

  // Track Header & Clips
  const tracks = [
    { name: 'V2 (Overlays)', color: '#38bdf8', clips: [{ start: 160, len: 240, label: 'Title_LowerThird.mov' }] },
    { name: 'V1 (4K Drone)', color: '#0284c7', clips: [{ start: 100, len: 380, label: 'Drone_Sunset_Rec02' }, { start: 500, len: 420, label: 'Interior_Desk_4K' }] },
    { name: 'A1 (Dialogue)', color: '#10b981', clips: [{ start: 120, len: 320, label: 'Host_Mic_Clean' }, { start: 480, len: 350, label: 'Guest_Interview' }] },
    { name: 'A2 (LoFi Music)', color: '#a855f7', clips: [{ start: 100, len: 820, label: 'Bali_Chill_Sunset_Master' }] },
  ];

  tracks.forEach((track, tidx) => {
    const ty = timelineY + 28 + tidx * 38;
    // Track label
    ctx.fillStyle = '#1c202a';
    ctx.fillRect(0, ty, 90, 32);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(track.name, 10, ty + 20);

    // Track lane
    ctx.fillStyle = '#13151b';
    ctx.fillRect(92, ty, w - 92, 32);

    // Track clips
    track.clips.forEach(clip => {
      ctx.fillStyle = track.color;
      ctx.fillRect(clip.start, ty + 2, clip.len, 28);
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px monospace';
      ctx.fillText(clip.label, clip.start + 8, ty + 19);

      // Audio waveform lines inside audio tracks
      if (track.name.startsWith('A')) {
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        for (let wx = clip.start + 6; wx < clip.start + clip.len - 6; wx += 4) {
          const barH = Math.sin(wx * 0.1) * 10 + 10;
          ctx.fillRect(wx, ty + 16 - barH / 2, 2, barH);
        }
      }
    });
  });

  // Vertical Red Playhead Line
  const playheadX = 390;
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(playheadX, timelineY);
  ctx.lineTo(playheadX, h);
  ctx.stroke();

  // Playhead Head
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(playheadX - 6, timelineY);
  ctx.lineTo(playheadX + 6, timelineY);
  ctx.lineTo(playheadX, timelineY + 10);
  ctx.fill();
}
