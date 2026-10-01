export type TabletopFinish = 'oak' | 'walnut' | 'bamboo' | 'carbon_black' | 'white';
export type FrameColor = 'black' | 'white' | 'space_grey';
export type MonitorSetup = 'single_27' | 'dual_27' | 'ultrawide_34' | 'laptop_plus_27';
export type MonitorMount = 'stand' | 'gas_spring_arm';
export type VirtualScreenTheme = 'video_editor' | 'code_ide' | 'analytics' | 'nature_wallpaper' | 'cyber_terminal';
export type DeskMat = 'none' | 'felt_charcoal' | 'felt_grey' | 'leather_tan' | 'leather_black';
export type KeyboardVariant = 'mechanical_compact' | 'mechanical_full' | 'apple_magic' | 'gaming_rgb';
export type KeycapTheme = 'stealth_dark' | 'chalk_white' | 'cyber_neon' | 'retro_beige';
export type MouseVariant = 'ergonomic_vertical' | 'precision_mx' | 'low_poly_clean' | 'bloody_gaming';
export type LightTemperature = 'off' | 'warm_3000k' | 'neutral_4500k' | 'cool_6500k';

export type DeskStudioSlot =
  | 'chair'
  | 'table'
  | 'monitor'
  | 'keyboard'
  | 'mouse'
  | 'mousepad'
  | 'lamp'
  | 'plant'
  | 'accessory';

export type ChairModel = 'aeron_mesh' | 'office_executive' | 'gaming_racing' | 'highback_mesh';
export type ChairColor = 'graphite' | 'mineral' | 'onyx' | 'tan';
export type LampVariant = 'screenbar' | 'xiaomi_led_1s' | 'tomons_wooden' | 'modern_architect' | 'none';
export type PlantVariant = 'monstera' | 'succulent' | 'cactus' | 'bonsai' | 'none';
export type AccessorySlot3 = 'speakers' | 'coffee_mug' | 'headphones' | 'none';

export interface WorkstationConfig {
  deskHeightCm: number; // 70 to 120 cm
  deskWidthCm: number;  // 120, 140, 160, 180
  deskDepthCm: number;  // 60, 70, 80
  tabletopFinish: TabletopFinish;
  frameColor: FrameColor;
  monitorSetup: MonitorSetup;
  monitorMount: MonitorMount;
  virtualScreenTheme: VirtualScreenTheme;
  // Chair
  chairModelId: string;
  chairModel?: ChairModel;
  chairColor?: ChairColor;
  chairName?: string;
  // Desk Accessories & Peripherals
  deskMat: DeskMat;
  keyboardVariant: KeyboardVariant;
  keycapTheme?: KeycapTheme;
  mouseVariant: MouseVariant;
  // Slot 1: Desk Lamp
  lampVariant?: LampVariant;
  lightTemperature: LightTemperature;
  lightBrightness: number; // 0 to 100
  // Slot 2: Potted Plant
  plantVariant: PlantVariant;
  // Slot 3: Extras (Speakers / Mug / Headphones)
  accessorySlot3?: AccessorySlot3;
  speakersEnabled: boolean;
  hasCoffeeMug: boolean;
  // Guides & View
  showErgonomicsGuide: boolean;
  showHotspots?: boolean;
  // Direct 3D Object model product mappings
  chairProductId?: string;
  tableProductId?: string;
  monitorProductId?: string;
  keyboardProductId?: string;
  mouseProductId?: string;
  mousepadProductId?: string;
  lampProductId?: string;
  plantProductId?: string;
  accessoryProductId?: string;
}

export interface WorkstationPreset {
  id: string;
  name: string;
  badge: string;
  icon: string;
  description: string;
  weeklyRent: number;
  config: Partial<WorkstationConfig>;
}

export const WORKSTATION_PRESETS: WorkstationPreset[] = [
  {
    id: 'preset-video-editor',
    name: 'Creative 4K Video Editor',
    badge: 'Creator Choice',
    icon: '🎬',
    description: '34" Ultrawide display running multi-track video timeline, studio monitor speakers, screenbar illumination, and ergonomic wrist support.',
    weeklyRent: 68,
    config: {
      deskHeightCm: 76,
      deskWidthCm: 140,
      deskDepthCm: 70,
      tabletopFinish: 'walnut',
      frameColor: 'black',
      monitorSetup: 'ultrawide_34',
      monitorMount: 'gas_spring_arm',
      virtualScreenTheme: 'video_editor',
      chairModel: 'aeron_mesh',
      chairColor: 'graphite',
      chairName: 'Herman Miller Aeron Remastered',
      deskMat: 'leather_black',
      keyboardVariant: 'mechanical_compact',
      keycapTheme: 'stealth_dark',
      mouseVariant: 'precision_mx',
      lampVariant: 'screenbar',
      lightTemperature: 'neutral_4500k',
      lightBrightness: 85,
      speakersEnabled: true,
      accessorySlot3: 'speakers',
      plantVariant: 'monstera',
      hasCoffeeMug: true,
      showErgonomicsGuide: false,
    }
  },
  {
    id: 'preset-dev-dual',
    name: 'Full-Stack Developer Station',
    badge: 'Engineering',
    icon: '💻',
    description: 'Dual 27" 4K displays on articulating arms, VS Code Dark IDE, mechanical keyboard, precision vertical mouse, and active sit-stand presets.',
    weeklyRent: 74,
    config: {
      deskHeightCm: 74,
      deskWidthCm: 140,
      deskDepthCm: 70,
      tabletopFinish: 'carbon_black',
      frameColor: 'black',
      monitorSetup: 'dual_27',
      monitorMount: 'gas_spring_arm',
      virtualScreenTheme: 'code_ide',
      chairModel: 'highback_mesh',
      chairColor: 'onyx',
      chairName: 'High-Back Ergonomic Task Chair',
      deskMat: 'felt_charcoal',
      keyboardVariant: 'mechanical_compact',
      keycapTheme: 'cyber_neon',
      mouseVariant: 'ergonomic_vertical',
      lampVariant: 'xiaomi_led_1s',
      lightTemperature: 'cool_6500k',
      lightBrightness: 80,
      speakersEnabled: false,
      accessorySlot3: 'coffee_mug',
      plantVariant: 'succulent',
      hasCoffeeMug: true,
      showErgonomicsGuide: false,
    }
  },
  {
    id: 'preset-nomad-minimal',
    name: 'Digital Nomad Minimalist',
    badge: 'Bali Villa Flow',
    icon: '🌴',
    description: 'Solid Natural Oak tabletop with a single 27" Studio Display, laptop riser sidecar, warm screenbar light, and lush Monstera.',
    weeklyRent: 52,
    config: {
      deskHeightCm: 75,
      deskWidthCm: 120,
      deskDepthCm: 70,
      tabletopFinish: 'oak',
      frameColor: 'white',
      monitorSetup: 'laptop_plus_27',
      monitorMount: 'stand',
      virtualScreenTheme: 'nature_wallpaper',
      chairModel: 'aeron_mesh',
      chairColor: 'mineral',
      chairName: 'Aeron Mineral White Edition',
      deskMat: 'felt_grey',
      keyboardVariant: 'apple_magic',
      keycapTheme: 'chalk_white',
      mouseVariant: 'precision_mx',
      lampVariant: 'tomons_wooden',
      lightTemperature: 'warm_3000k',
      lightBrightness: 70,
      speakersEnabled: false,
      accessorySlot3: 'coffee_mug',
      plantVariant: 'monstera',
      hasCoffeeMug: true,
      showErgonomicsGuide: false,
    }
  },
  {
    id: 'preset-trader-pro',
    name: 'Executive Financial Station',
    badge: 'Finance & Analytics',
    icon: '📈',
    description: 'Dual high-refresh monitors streaming live market analytics & candlestick charts, bamboo surface, executive leather desk pad, and standing mode.',
    weeklyRent: 79,
    config: {
      deskHeightCm: 106,
      deskWidthCm: 160,
      deskDepthCm: 70,
      tabletopFinish: 'bamboo',
      frameColor: 'space_grey',
      monitorSetup: 'dual_27',
      monitorMount: 'gas_spring_arm',
      virtualScreenTheme: 'analytics',
      chairModel: 'office_executive',
      chairColor: 'tan',
      chairName: 'Executive High-Grain Leather Chair',
      deskMat: 'leather_tan',
      keyboardVariant: 'mechanical_full',
      keycapTheme: 'retro_beige',
      mouseVariant: 'precision_mx',
      lampVariant: 'modern_architect',
      lightTemperature: 'neutral_4500k',
      lightBrightness: 90,
      speakersEnabled: true,
      accessorySlot3: 'speakers',
      plantVariant: 'cactus',
      hasCoffeeMug: false,
      showErgonomicsGuide: false,
    }
  },
  {
    id: 'preset-cyberpunk-battlestation',
    name: 'Cyberpunk Battlestation',
    badge: 'Cyber RGB',
    icon: '⚡',
    description: 'Ultrawide 34" curved display running matrix telemetry, gaming bucket seat, RGB gaming keyboard, high-DPI mouse, and neon aesthetics.',
    weeklyRent: 82,
    config: {
      deskHeightCm: 75,
      deskWidthCm: 160,
      deskDepthCm: 80,
      tabletopFinish: 'carbon_black',
      frameColor: 'black',
      monitorSetup: 'ultrawide_34',
      monitorMount: 'gas_spring_arm',
      virtualScreenTheme: 'cyber_terminal',
      chairModel: 'gaming_racing',
      chairColor: 'onyx',
      chairName: 'Pro Racing Bucket Gaming Chair',
      deskMat: 'leather_black',
      keyboardVariant: 'gaming_rgb',
      keycapTheme: 'cyber_neon',
      mouseVariant: 'bloody_gaming',
      lampVariant: 'screenbar',
      lightTemperature: 'cool_6500k',
      lightBrightness: 100,
      speakersEnabled: true,
      accessorySlot3: 'headphones',
      plantVariant: 'bonsai',
      hasCoffeeMug: true,
      showErgonomicsGuide: false,
    }
  }
];

export const DEFAULT_WORKSTATION_CONFIG: WorkstationConfig = {
  deskHeightCm: 75,
  deskWidthCm: 140,
  deskDepthCm: 70,
  tabletopFinish: 'walnut',
  frameColor: 'black',
  monitorSetup: 'ultrawide_34',
  monitorMount: 'gas_spring_arm',
  virtualScreenTheme: 'video_editor',
  chairModelId: 'monis-ergo-chair-6',
  chairModel: 'aeron_mesh',
  chairColor: 'graphite',
  chairName: 'Herman Miller Aeron Remastered',
  chairProductId: 'monis-ergo-chair-6',
  tableProductId: 'monis-elec-desk-28',
  monitorProductId: 'monis-curved-34',
  keyboardProductId: 'monis-mech-keyboard',
  mouseProductId: 'monis-precision-mouse',
  mousepadProductId: 'acc-felt-deskpad',
  lampProductId: 'monis-lamp-151',
  plantProductId: 'decor-monstera',
  accessoryProductId: 'acc-studio-speakers',
  deskMat: 'felt_charcoal',
  keyboardVariant: 'mechanical_compact',
  keycapTheme: 'stealth_dark',
  mouseVariant: 'precision_mx',
  lampVariant: 'screenbar',
  lightTemperature: 'warm_3000k',
  lightBrightness: 80,
  speakersEnabled: true,
  accessorySlot3: 'speakers',
  plantVariant: 'monstera',
  hasCoffeeMug: true,
  showErgonomicsGuide: false,
  showHotspots: true,
};
