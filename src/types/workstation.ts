export type TabletopFinish = 'oak' | 'walnut' | 'bamboo' | 'carbon_black' | 'white';
export type FrameColor = 'black' | 'white' | 'space_grey';
export type MonitorSetup = 'single_27' | 'dual_27' | 'ultrawide_34' | 'laptop_plus_27';
export type MonitorMount = 'stand' | 'gas_spring_arm';
export type VirtualScreenTheme = 'video_editor' | 'code_ide' | 'analytics' | 'nature_wallpaper';
export type DeskMat = 'none' | 'felt_charcoal' | 'felt_grey' | 'leather_tan' | 'leather_black';
export type KeyboardVariant = 'mechanical_compact' | 'mechanical_full' | 'apple_magic';
export type MouseVariant = 'ergonomic_vertical' | 'precision_mx';
export type LightTemperature = 'off' | 'warm_3000k' | 'neutral_4500k' | 'cool_6500k';

export interface WorkstationConfig {
  deskHeightCm: number; // 70 to 118 cm
  deskWidthCm: number;  // 120, 140, 160
  deskDepthCm: number;  // 60, 70, 80
  tabletopFinish: TabletopFinish;
  frameColor: FrameColor;
  monitorSetup: MonitorSetup;
  monitorMount: MonitorMount;
  virtualScreenTheme: VirtualScreenTheme;
  chairModelId: string;
  chairName?: string;
  deskMat: DeskMat;
  keyboardVariant: KeyboardVariant;
  mouseVariant: MouseVariant;
  lightTemperature: LightTemperature;
  lightBrightness: number; // 0 to 100
  speakersEnabled: boolean;
  plantVariant: 'monstera' | 'succulent' | 'none';
  hasCoffeeMug: boolean;
  showErgonomicsGuide: boolean;
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
      tabletopFinish: 'walnut',
      frameColor: 'black',
      monitorSetup: 'ultrawide_34',
      monitorMount: 'gas_spring_arm',
      virtualScreenTheme: 'video_editor',
      deskMat: 'leather_black',
      keyboardVariant: 'mechanical_compact',
      mouseVariant: 'precision_mx',
      lightTemperature: 'neutral_4500k',
      lightBrightness: 85,
      speakersEnabled: true,
      plantVariant: 'monstera',
      hasCoffeeMug: true,
      showErgonomicsGuide: true,
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
      tabletopFinish: 'carbon_black',
      frameColor: 'black',
      monitorSetup: 'dual_27',
      monitorMount: 'gas_spring_arm',
      virtualScreenTheme: 'code_ide',
      deskMat: 'felt_charcoal',
      keyboardVariant: 'mechanical_compact',
      mouseVariant: 'ergonomic_vertical',
      lightTemperature: 'cool_6500k',
      lightBrightness: 80,
      speakersEnabled: false,
      plantVariant: 'succulent',
      hasCoffeeMug: true,
      showErgonomicsGuide: true,
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
      tabletopFinish: 'oak',
      frameColor: 'white',
      monitorSetup: 'laptop_plus_27',
      monitorMount: 'stand',
      virtualScreenTheme: 'nature_wallpaper',
      deskMat: 'felt_grey',
      keyboardVariant: 'apple_magic',
      mouseVariant: 'precision_mx',
      lightTemperature: 'warm_3000k',
      lightBrightness: 70,
      speakersEnabled: false,
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
      tabletopFinish: 'bamboo',
      frameColor: 'space_grey',
      monitorSetup: 'dual_27',
      monitorMount: 'gas_spring_arm',
      virtualScreenTheme: 'analytics',
      deskMat: 'leather_tan',
      keyboardVariant: 'mechanical_full',
      mouseVariant: 'precision_mx',
      lightTemperature: 'neutral_4500k',
      lightBrightness: 90,
      speakersEnabled: true,
      plantVariant: 'succulent',
      hasCoffeeMug: false,
      showErgonomicsGuide: true,
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
  chairModelId: 'monis-chair-aeron',
  chairName: 'Herman Miller Aeron Remastered',
  deskMat: 'felt_charcoal',
  keyboardVariant: 'mechanical_compact',
  mouseVariant: 'precision_mx',
  lightTemperature: 'warm_3000k',
  lightBrightness: 80,
  speakersEnabled: true,
  plantVariant: 'monstera',
  hasCoffeeMug: true,
  showErgonomicsGuide: true,
};
