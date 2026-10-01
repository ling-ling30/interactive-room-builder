import type { WorkstationConfig } from '../types/workstation';
import type { SimsProduct, PlacedFurniture } from '../data/simsCatalog';
import { buildSetupItems, type RoomSetup, type SetupItem } from '../data/roomSetups';

/**
 * Converts a Desk Studio WorkstationConfig into placeable PlacedFurniture items
 * using dimension-aware collision-free room placement.
 */
export function buildWorkstationPlacedItems(
  config: WorkstationConfig,
  catalog: SimsProduct[]
): PlacedFurniture[] {
  const items: SetupItem[] = [];

  // 1. Desk
  const deskId = config.tableProductId || 'monis-elec-desk-28';
  items.push({ productId: deskId, role: 'desk' });

  // 2. Chair
  const chairId = config.chairProductId || 'monis-ergo-chair-6';
  items.push({ productId: chairId, role: 'chair' });

  // 3. Monitor
  const monitorId =
    config.monitorProductId ||
    (config.monitorSetup === 'ultrawide_34'
      ? 'monis-curved-34'
      : config.monitorSetup === 'dual_27'
      ? 'tech-dual-4k'
      : 'monis-grading-27');
  items.push({ productId: monitorId, role: 'monitor' });

  // 4. Desk Mat
  if (config.deskMat !== 'none') {
    const matId = config.mousepadProductId || 'acc-felt-deskpad';
    items.push({ productId: matId, role: 'mat' });
  }

  // 5. Keyboard
  const kbId =
    config.keyboardProductId ||
    (config.keyboardVariant === 'gaming_rgb' ? 'monis-gaming-keyboard' : 'monis-mech-keyboard');
  items.push({ productId: kbId, role: 'keyboard' });

  // 6. Mouse
  const mouseId =
    config.mouseProductId ||
    (config.mouseVariant === 'bloody_gaming' ? 'monis-gaming-mouse-a4' : 'monis-precision-mouse');
  items.push({ productId: mouseId, role: 'mouse' });

  // 7. Desk Lamp
  if (config.lampVariant !== 'none' && config.lightTemperature !== 'off') {
    const lampId =
      config.lampProductId ||
      (config.lampVariant === 'xiaomi_led_1s'
        ? 'monis-lamp-151'
        : config.lampVariant === 'tomons_wooden'
        ? 'light-screenbar'
        : config.lampVariant === 'modern_architect'
        ? 'monis-modern-desk-lamp'
        : 'monis-lamp-151');
    items.push({ productId: lampId, role: 'right' });
  }

  // 8. Plant
  if (config.plantVariant !== 'none') {
    const plantId = config.plantProductId || 'decor-monstera';
    items.push({ productId: plantId, role: 'corner' });
  }

  // 9. Extra Accessory (Speakers, Coffee Mug, Headphones)
  const slot3 = config.accessorySlot3 || (config.speakersEnabled ? 'speakers' : 'none');
  if (slot3 === 'speakers' || config.speakersEnabled) {
    items.push({ productId: 'acc-speakers', role: 'left' });
  } else if (slot3 === 'headphones') {
    items.push({ productId: 'acc-headphone-stand', role: 'left' });
  }

  const setup: RoomSetup = {
    id: 'desk-studio-custom',
    name: 'Custom Desk Studio Setup',
    desc: 'Custom configured ergonomic workstation from Desk Studio Builder',
    badge: 'Custom',
    discountPercent: 15,
    room: { width: 3, length: 3, floorStyle: 'concrete', wallColor: '#f4ece0', wallStyle: 'cutaway', backdropColor: '#f0ece1' },
    items,
  };

  const placed = buildSetupItems(setup, catalog);

  // Desks rest flat on the room floor (surfaceY = 0)
  // Desk-mounted accessories rest on top of the table (standard height 0.74m)
  const deskHeightM = 0.74;
  return placed.map((item) => {
    if (item.mountedOnDeskId) {
      return { ...item, surfaceY: deskHeightM };
    }
    const prod = catalog.find((p) => p.id === item.productId);
    if (prod?.category === 'desks') {
      return { ...item, surfaceY: 0 };
    }
    return item;
  });
}

