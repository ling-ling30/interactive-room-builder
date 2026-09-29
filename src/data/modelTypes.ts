/** Every procedural furniture builder key. `PROCEDURAL_BUILDERS` is typed against this union. */
export const MODEL_TYPES = [
  'standing_desk',
  'compact_desk',
  'executive_desk',
  'aeron_chair',
  'highback_chair',
  'active_stool',
  'lounge_chair',
  'dual_monitors',
  'ultrawide_monitor',
  'single_monitor',
  'laptop_stand',
  'screenbar',
  'desk_lamp',
  'floor_lamp',
  'monstera_plant',
  'jute_rug',
  'bookshelf',
  'coffee_mug',
  'standing_board',
  'mechanical_keyboard',
  'gaming_keyboard',
  'computer_mouse',
  'desk_mat',
  'desk_organizer',
  'headphone_stand',
] as const;

export type ModelType = (typeof MODEL_TYPES)[number];

const MODEL_TYPE_SET: ReadonlySet<string> = new Set(MODEL_TYPES);

export function isModelType(value: string): value is ModelType {
  return MODEL_TYPE_SET.has(value);
}

/** Legacy / stored values from older catalogs -> current builder key. */
const LEGACY_MODEL_TYPES: Record<string, ModelType> = {
  leather_chair: 'highback_chair',
  light_screenbar: 'screenbar',
  light_desk_lamp: 'desk_lamp',
  plant_monstera: 'monstera_plant',
  whiteboard_mobile: 'standing_board',
};

/** Coerces any stored string to a valid ModelType (unknown -> standing_desk). */
export function toModelType(value: string | undefined | null): ModelType {
  if (!value) return 'standing_desk';
  if (isModelType(value)) return value;
  return LEGACY_MODEL_TYPES[value] ?? 'standing_desk';
}
