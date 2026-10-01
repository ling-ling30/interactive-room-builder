import * as THREE from 'three';
import type { VirtualScreenTheme } from '../../../types/workstation';
import { renderVideoEditorScreen } from './screens/videoEditorScreen';
import { renderCodeIdeScreen } from './screens/codeIdeScreen';
import { renderAnalyticsScreen } from './screens/analyticsScreen';
import { renderNatureWallpaperScreen } from './screens/natureWallpaperScreen';
import { renderCyberTerminalScreen } from './screens/cyberTerminalScreen';

// Cache generated textures so switching is instantaneous
const textureCache = new Map<string, THREE.CanvasTexture>();

export function getVirtualScreenTexture(theme: VirtualScreenTheme, width = 1024, height = 576): THREE.CanvasTexture {
  const cacheKey = `${theme}_${width}x${height}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const fallbackTex = new THREE.CanvasTexture(canvas);
    return fallbackTex;
  }

  switch (theme) {
    case 'video_editor':
      renderVideoEditorScreen(ctx, width, height);
      break;
    case 'code_ide':
      renderCodeIdeScreen(ctx, width, height);
      break;
    case 'analytics':
      renderAnalyticsScreen(ctx, width, height);
      break;
    case 'cyber_terminal':
      renderCyberTerminalScreen(ctx, width, height);
      break;
    case 'nature_wallpaper':
    default:
      renderNatureWallpaperScreen(ctx, width, height);
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}
