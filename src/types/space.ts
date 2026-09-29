export type FloorStyle = 'wood' | 'terrazzo' | 'concrete' | 'marble';
export type WallStyle = 'cutaway' | 'low' | 'full';

export interface SpaceParameters {
  width: number; // in meters (3 to 50)
  length: number; // in meters (3 to 50)
  floorStyle: FloorStyle;
  wallColor: string;
  wallStyle?: WallStyle;
  hasWindow: boolean;
  roomName: string;
}

export const DEFAULT_SPACE: SpaceParameters = {
  width: 5,
  length: 5,
  floorStyle: 'wood',
  wallColor: '#f8f6f0',
  wallStyle: 'cutaway',
  hasWindow: true,
  roomName: 'Bali Villa Studio',
};

export const SPACE_PRESETS = [
  {
    id: 'nook',
    name: 'Villa Nook',
    desc: 'Compact bedroom or alcove workspace',
    width: 3,
    length: 3,
    floorStyle: 'wood' as FloorStyle,
    wallColor: '#f8f6f0',
    wallStyle: 'cutaway' as WallStyle,
  },
  {
    id: 'standard',
    name: 'Standard Studio',
    desc: 'Balanced space for single workstation + lounge',
    width: 5,
    length: 4,
    floorStyle: 'terrazzo' as FloorStyle,
    wallColor: '#ede8df',
    wallStyle: 'cutaway' as WallStyle,
  },
  {
    id: 'executive',
    name: 'Executive Villa',
    desc: 'Spacious high-end office with multi-desk layout',
    width: 8,
    length: 6,
    floorStyle: 'concrete' as FloorStyle,
    wallColor: '#e2ded5',
    wallStyle: 'cutaway' as WallStyle,
  },
  {
    id: 'coworking',
    name: 'Open Coworking',
    desc: 'Dynamic shared workspace for distributed teams',
    width: 15,
    length: 12,
    floorStyle: 'terrazzo' as FloorStyle,
    wallColor: '#f8f6f0',
    wallStyle: 'cutaway' as WallStyle,
  },
  {
    id: 'studio-hub',
    name: 'Tech Studio Hub',
    desc: 'Large creative agency open floor with pods',
    width: 25,
    length: 20,
    floorStyle: 'concrete' as FloorStyle,
    wallColor: '#f8f6f0',
    wallStyle: 'low' as WallStyle,
  },
  {
    id: 'mega-campus',
    name: 'Mega Campus',
    desc: 'Grand 50m event hall & enterprise campus',
    width: 50,
    length: 50,
    floorStyle: 'marble' as FloorStyle,
    wallColor: '#f8f6f0',
    wallStyle: 'low' as WallStyle,
  },
];
