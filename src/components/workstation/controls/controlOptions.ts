import type {
  DeskMat,
  FrameColor,
  KeyboardVariant,
  LightTemperature,
  MonitorSetup,
  MouseVariant,
  TabletopFinish,
  VirtualScreenTheme,
  WorkstationConfig,
} from '../../../types/workstation';

/** Props shared by every controls tab. */
export interface ControlsTabProps {
  config: WorkstationConfig;
  onChange: (updates: Partial<WorkstationConfig>) => void;
}

export const DESK_HEIGHT_MIN_CM = 70;
export const DESK_HEIGHT_MAX_CM = 118;

export const HEIGHT_PRESETS = [
  { label: 'Ergo Sit', height: 74, icon: '🪑' },
  { label: 'Deep Focus', height: 78, icon: '💻' },
  { label: 'Active Stand', height: 104, icon: '🧍' },
  { label: 'Tall Stand', height: 112, icon: '⚡' },
];

export const FINISH_OPTIONS: { id: TabletopFinish; label: string; bg: string; border: string }[] = [
  { id: 'walnut', label: 'Dark Walnut', bg: '#3d2516', border: '#5a3822' },
  { id: 'oak', label: 'Natural Oak', bg: '#c49a64', border: '#dfb57e' },
  { id: 'bamboo', label: 'Bamboo Fiber', bg: '#c8985c', border: '#e2b378' },
  { id: 'carbon_black', label: 'Carbon Black', bg: '#1c1e24', border: '#333846' },
  { id: 'white', label: 'Pure White', bg: '#f3f4f6', border: '#d1d5db' },
];

export const FRAME_OPTIONS: { id: FrameColor; label: string; color: string }[] = [
  { id: 'black', label: 'Matte Black', color: '#12141a' },
  { id: 'space_grey', label: 'Space Grey', color: '#475569' },
  { id: 'white', label: 'Arctic White', color: '#f1f5f9' },
];

export const DESK_WIDTHS_CM = [120, 140, 160];

export const MONITOR_SETUPS: { id: MonitorSetup; label: string; desc: string; icon: string }[] = [
  { id: 'ultrawide_34', label: '34" Curved Ultrawide', desc: '21:9 cinematic workflow & video timeline', icon: '🖥️' },
  { id: 'dual_27', label: 'Dual 27" 4K Displays', desc: 'Side-by-side angled multi-tasking', icon: '💻' },
  { id: 'laptop_plus_27', label: '27" + Laptop Riser', desc: 'External monitor with MacBook sidecar', icon: '📱' },
  { id: 'single_27', label: 'Single 27" Studio', desc: 'Clean minimalist centered display', icon: '📺' },
];

export const SCREEN_THEMES: { id: VirtualScreenTheme; label: string; icon: string; desc: string; color: string }[] = [
  { id: 'video_editor', label: 'Creative 4K Video Editor', icon: '🎬', desc: 'Multi-track timeline, waveforms & footage preview', color: '#38bdf8' },
  { id: 'code_ide', label: 'Developer Dark IDE', icon: '💻', desc: 'VS Code TypeScript workspace & file explorer', color: '#10b981' },
  { id: 'analytics', label: 'Financial Trading Terminal', icon: '📈', desc: 'Real-time candlestick chart & order book', color: '#f59e0b' },
  { id: 'nature_wallpaper', label: 'Bali Sunset Wallpaper', icon: '🌴', desc: 'Lush twilight sky, palm silhouettes & widget dock', color: '#ec4899' },
];

export const LIGHT_TEMPERATURES: LightTemperature[] = ['off', 'warm_3000k', 'neutral_4500k', 'cool_6500k'];

export const DESK_MAT_OPTIONS: { id: DeskMat; label: string; col: string }[] = [
  { id: 'felt_charcoal', label: 'Charcoal Felt', col: '#27272a' },
  { id: 'felt_grey', label: 'Heather Grey Felt', col: '#52525b' },
  { id: 'leather_tan', label: 'Saddle Leather', col: '#92400e' },
  { id: 'leather_black', label: 'Black Leather', col: '#18181b' },
];

export const KEYBOARD_OPTIONS: { id: KeyboardVariant; label: string }[] = [
  { id: 'mechanical_compact', label: '75% Mechanical Keyboard (Linear Red)' },
  { id: 'mechanical_full', label: 'Full Mechanical + Numpad' },
  { id: 'apple_magic', label: 'Slim Aluminum Chiclet' },
];

export const MOUSE_OPTIONS: { id: MouseVariant; label: string }[] = [
  { id: 'precision_mx', label: 'Precision Contoured MX Mouse' },
  { id: 'ergonomic_vertical', label: '57° Vertical Ergonomic Mouse' },
];
