import type {
  ChairColor,
  ChairModel,
  DeskMat,
  FrameColor,
  KeyboardVariant,
  KeycapTheme,
  LampVariant,
  LightTemperature,
  MonitorSetup,
  MouseVariant,
  PlantVariant,
  AccessorySlot3,
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
export const DESK_HEIGHT_MAX_CM = 120;

export const HEIGHT_PRESETS = [
  { label: 'Ergo Sit', height: 74, icon: '🪑' },
  { label: 'Deep Focus', height: 78, icon: '💻' },
  { label: 'Active Stand', height: 104, icon: '🧍' },
  { label: 'Tall Stand', height: 112, icon: '⚡' },
];

export const FINISH_OPTIONS: { id: TabletopFinish; label: string; bg: string; border: string; desc: string }[] = [
  { id: 'walnut', label: 'Dark Walnut', bg: '#3d2516', border: '#5a3822', desc: 'Solid American Walnut with rich chocolate grain' },
  { id: 'oak', label: 'Natural Oak', bg: '#c49a64', border: '#dfb57e', desc: 'Scandinavian blonde oak with satin polyurethane' },
  { id: 'bamboo', label: 'Bamboo Fiber', bg: '#c8985c', border: '#e2b378', desc: 'Eco-harvested strand-woven bamboo surface' },
  { id: 'carbon_black', label: 'Carbon Black', bg: '#1c1e24', border: '#333846', desc: 'Fingerprint-resistant matte obsidian finish' },
  { id: 'white', label: 'Pure White', bg: '#f3f4f6', border: '#d1d5db', desc: 'Clean architectural matte alpine white' },
];

export const FRAME_OPTIONS: { id: FrameColor; label: string; color: string }[] = [
  { id: 'black', label: 'Matte Black', color: '#12141a' },
  { id: 'space_grey', label: 'Space Grey', color: '#475569' },
  { id: 'white', label: 'Arctic White', color: '#f1f5f9' },
];

export const DESK_WIDTHS_CM = [120, 140, 160, 180];
export const DESK_DEPTHS_CM = [60, 70, 80];

export const CHAIR_OPTIONS: { id: ChairModel; label: string; desc: string; icon: string }[] = [
  { id: 'aeron_mesh', label: 'Aeron Remastered', desc: '8Z Pellicle breathable mesh & PostureFit SL', icon: '🪑' },
  { id: 'office_executive', label: 'Executive High-Back', desc: 'Full-grain contoured leather with padded lumbar', icon: '💼' },
  { id: 'gaming_racing', label: 'Pro Racing Bucket', desc: 'High-density cold cure foam & 4D armrests', icon: '🏎️' },
  { id: 'highback_mesh', label: 'Ergonomic Task Chair', desc: 'Active synchronized tilt with adjustable headrest', icon: '🧘' },
];

export const CHAIR_COLORS: { id: ChairColor; label: string; hex: string }[] = [
  { id: 'graphite', label: 'Graphite', hex: '#262b35' },
  { id: 'mineral', label: 'Mineral Silver', hex: '#cbd5e1' },
  { id: 'onyx', label: 'Stealth Onyx', hex: '#111317' },
  { id: 'tan', label: 'Saddle Leather', hex: '#92400e' },
];

export const MONITOR_SETUPS: { id: MonitorSetup; label: string; desc: string; icon: string }[] = [
  { id: 'ultrawide_34', label: '34" Curved Ultrawide', desc: '21:9 cinematic 1800R curve & video timeline', icon: '🖥️' },
  { id: 'dual_27', label: 'Dual 27" 4K Displays', desc: 'Side-by-side angled 15° multi-tasking setup', icon: '💻' },
  { id: 'laptop_plus_27', label: '27" + Laptop Riser', desc: 'External monitor with MacBook aluminum sidecar', icon: '📱' },
  { id: 'single_27', label: 'Single 27" 4K Studio', desc: 'Clean minimalist centered Retina display', icon: '📺' },
];

export const SCREEN_THEMES: { id: VirtualScreenTheme; label: string; icon: string; desc: string; color: string }[] = [
  { id: 'video_editor', label: 'Creative 4K Video Editor', icon: '🎬', desc: 'Multi-track timeline, waveforms & footage preview', color: '#38bdf8' },
  { id: 'code_ide', label: 'Developer Dark IDE', icon: '💻', desc: 'VS Code TypeScript workspace & file explorer', color: '#10b981' },
  { id: 'analytics', label: 'Financial Trading Terminal', icon: '📈', desc: 'Real-time candlestick charts & market order book', color: '#f59e0b' },
  { id: 'cyber_terminal', label: 'Cyberpunk Matrix Console', icon: '⚡', desc: 'Hacker neon terminal with live CPU telemetry', color: '#00f0ff' },
  { id: 'nature_wallpaper', label: 'Bali Sunset Wallpaper', icon: '🌴', desc: 'Lush twilight sky, palm silhouettes & widget dock', color: '#ec4899' },
];

export const LAMP_OPTIONS: { id: LampVariant; label: string; desc: string; icon: string }[] = [
  { id: 'screenbar', label: 'Monitor Screenbar Light', desc: 'Glare-free optical lightbar mounted on display', icon: '💡' },
  { id: 'xiaomi_led_1s', label: 'Xiaomi Smart LED 1S', desc: 'Slender articulated arm with red wire signature', icon: '🏮' },
  { id: 'tomons_wooden', label: 'Tomons Nordic Wood', desc: 'Scandinavian natural wood articulated joints', icon: '🪵' },
  { id: 'modern_architect', label: 'Architect Swing-Arm', desc: 'Heavy spring counterbalanced steel drafting lamp', icon: '📐' },
  { id: 'none', label: 'No Desk Lamp', desc: 'Natural daylight only', icon: '🚫' },
];

export const LIGHT_TEMPERATURES: { id: LightTemperature; label: string; kelvin: string; color: string }[] = [
  { id: 'warm_3000k', label: 'Warm Amber', kelvin: '3000K', color: '#fed7aa' },
  { id: 'neutral_4500k', label: 'Natural Daylight', kelvin: '4500K', color: '#fef08a' },
  { id: 'cool_6500k', label: 'Cool Focus', kelvin: '6500K', color: '#bae6fd' },
  { id: 'off', label: 'Light Off', kelvin: '0K', color: '#475569' },
];

export const DESK_MAT_OPTIONS: { id: DeskMat; label: string; col: string; desc: string }[] = [
  { id: 'felt_charcoal', label: 'Charcoal Wool Felt', col: '#27272a', desc: 'Natural merino wool blend, sound-dampening' },
  { id: 'felt_grey', label: 'Heather Grey Felt', col: '#52525b', desc: 'Light mottled grey texture for bright setups' },
  { id: 'leather_tan', label: 'Tan Saddle Leather', col: '#92400e', desc: 'Top-grain vegetable-tanned Italian leather' },
  { id: 'leather_black', label: 'Stealth Black Leather', col: '#18181b', desc: 'Water-resistant vegan micro-texture leather' },
  { id: 'none', label: 'Bare Desk (No Mat)', col: '#3f3f46', desc: 'Clean exposed tabletop wood surface' },
];

export const KEYBOARD_OPTIONS: { id: KeyboardVariant; label: string; desc: string; icon: string }[] = [
  { id: 'mechanical_compact', label: 'Custom 75% Mechanical', desc: 'Hot-swap linear switches & acoustic foam', icon: '⌨️' },
  { id: 'mechanical_full', label: 'Full 104-Key Numpad', desc: 'Extended mechanical layout for productivity', icon: '🧮' },
  { id: 'gaming_rgb', label: 'RGB Pro Gaming Keyboard', desc: 'Per-key RGB backlight & magnetic wrist rest', icon: '🎮' },
  { id: 'apple_magic', label: 'Apple Magic Keyboard', desc: 'Ultra-slim anodized aluminum chiclet design', icon: '🍎' },
];

export const KEYCAP_THEMES: { id: KeycapTheme; label: string; hex: string }[] = [
  { id: 'stealth_dark', label: 'Stealth Charcoal', hex: '#27272a' },
  { id: 'chalk_white', label: 'Chalk White', hex: '#f8fafc' },
  { id: 'cyber_neon', label: 'Cyber Neon', hex: '#0284c7' },
  { id: 'retro_beige', label: 'Vintage Retro 90s', hex: '#c5b79f' },
];

export const MOUSE_OPTIONS: { id: MouseVariant; label: string; desc: string; icon: string }[] = [
  { id: 'precision_mx', label: 'Logitech MX Master 3S', desc: 'Electromagnetic MagSpeed & dual knurled wheels', icon: '🖱️' },
  { id: 'ergonomic_vertical', label: '57° Vertical Ergo Mouse', desc: 'Neutral handshake posture reduces forearm strain', icon: '🖐️' },
  { id: 'bloody_gaming', label: 'High-DPI Gaming Optical', desc: 'Light-strike optical switches & lightweight honeycomb', icon: '🎯' },
  { id: 'low_poly_clean', label: 'Minimalist Clean Mouse', desc: 'Geometric ambidextrous wireless pointer', icon: '✨' },
];

export const PLANT_OPTIONS: { id: PlantVariant; label: string; desc: string; icon: string }[] = [
  { id: 'monstera', label: 'Monstera Deliciosa', desc: 'Tropical Swiss cheese plant in glazed ceramic planter', icon: '🌿' },
  { id: 'succulent', label: 'Ceramic Succulent', desc: 'Drought-tolerant fleshy rosette in matte cylinder pot', icon: '🪴' },
  { id: 'cactus', label: 'Desert Saguaro Cactus', desc: 'Ribbed terracotta pot with vibrant desert bloom', icon: '🌵' },
  { id: 'bonsai', label: 'Zen Japanese Bonsai', desc: 'Pruned miniature juniper in shallow stoneware tray', icon: '🌳' },
  { id: 'none', label: 'No Plant', desc: 'Clear space for accessories', icon: '🚫' },
];

export const ACCESSORY_OPTIONS: { id: AccessorySlot3; label: string; desc: string; icon: string }[] = [
  { id: 'speakers', label: 'Studio Hi-Fi Monitors', desc: 'Dual nearfield acoustic speakers with amber cones', icon: '🔊' },
  { id: 'coffee_mug', label: 'Artisan Ceramic Mug', desc: 'Handcrafted speckle stoneware mug with hot espresso', icon: '☕' },
  { id: 'headphones', label: 'Studio Headphones & Stand', desc: 'Over-ear monitoring cans on arched aluminum pedestal', icon: '🎧' },
  { id: 'none', label: 'Empty Slot', desc: 'Clean unencumbered desktop', icon: '🚫' },
];
