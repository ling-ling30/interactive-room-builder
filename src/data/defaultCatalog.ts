import type { Product } from '../types/product';

export const DEFAULT_PRODUCTS: Product[] = [
  // DESKS
  {
    id: 'desk-solid-oak-motor',
    name: 'Nordic Solid Oak Motorized Standing Desk',
    brand: 'Monis Pro Series',
    category: 'desks',
    weeklyPrice: 28,
    monthlyPrice: 85,
    deposit: 60,
    description: 'Premium dual-motor electric standing desk with a 28mm solid European oak bevel-edged top and anti-collision gyroscope sensors.',
    dimensions: '140 x 75 x 72-118 cm',
    inStock: true,
    tags: ['Dual Motor', 'Solid Oak Top', 'Memory Presets', 'Anti-Collision'],
    image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=600&q=80',
    colors: ['Natural Oak', 'Matte Black Legs'],
    specs: {
      'Motor System': 'Dual Quiet Motors (<45dB)',
      'Height Range': '72cm – 118cm',
      'Max Load': '125 kg (275 lbs)',
      'Tabletop': '28mm Natural European Oak',
      'Memory Slots': '4 Programmable Heights'
    },
    visualProps: {
      materialVariant: 'oak',
      frameColor: '#1c1f26',
      widthCm: 140,
      depthCm: 75
    }
  },
  {
    id: 'desk-bamboo-ergo',
    name: 'Bali Eco Bamboo Adjustable Desk',
    brand: 'Monis Nomad Line',
    category: 'desks',
    weeklyPrice: 24,
    monthlyPrice: 72,
    deposit: 50,
    description: 'Sustainably harvested 7-layer carbonized bamboo desktop with sleek white telescoping steel frame. Heat and moisture resistant for tropical villas.',
    dimensions: '120 x 65 x 72-115 cm',
    inStock: true,
    tags: ['Eco Bamboo', 'Moisture Proof', 'Compact Villa Fit', 'Dual Motor'],
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80',
    colors: ['Caramel Bamboo', 'Crisp White Frame'],
    specs: {
      'Motor System': 'Dual Synchronized Motors',
      'Height Range': '72cm – 116cm',
      'Max Load': '100 kg',
      'Tabletop': '100% Carbonized Bamboo',
      'Memory Slots': '3 Presets + USB Charger'
    },
    visualProps: {
      materialVariant: 'bamboo',
      frameColor: '#e2e8f0',
      widthCm: 120,
      depthCm: 65
    }
  },
  {
    id: 'desk-executive-walnut',
    name: 'Executive Dark Walnut Studio Desk',
    brand: 'Monis Heritage',
    category: 'desks',
    weeklyPrice: 34,
    monthlyPrice: 105,
    deposit: 80,
    description: 'Deep architectural American Walnut with integrated magnetic cable routing spine and recessed power station.',
    dimensions: '160 x 80 x 72-120 cm',
    inStock: true,
    tags: ['Walnut Hardwood', 'Integrated Cable Spine', 'Broad Surface', 'Heavy Duty'],
    image: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=600&q=80',
    colors: ['Deep Walnut', 'Gunmetal Frame'],
    specs: {
      'Motor System': 'Commercial Grade Triple-Stage',
      'Height Range': '68cm – 124cm',
      'Max Load': '150 kg',
      'Tabletop': '30mm Solid American Walnut',
      'Memory Slots': '4 Presets with OLED Display'
    },
    visualProps: {
      materialVariant: 'walnut',
      frameColor: '#121418',
      widthCm: 160,
      depthCm: 80
    }
  },
  {
    id: 'desk-matte-black-studio',
    name: 'Stealth Matte Black Minimalist Desk',
    brand: 'Monis Studio',
    category: 'desks',
    weeklyPrice: 22,
    monthlyPrice: 68,
    deposit: 50,
    description: 'Anti-fingerprint thermal laminate in matte obsidian black with ultra-smooth chamfered edges and stealth legs.',
    dimensions: '130 x 70 x 72-115 cm',
    inStock: true,
    tags: ['Anti-Fingerprint', 'Stealth Black', 'Minimalist', 'Lightweight'],
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80',
    colors: ['Obsidian Black', 'Matte Black Frame'],
    specs: {
      'Motor System': 'Dual Quiet Motors',
      'Height Range': '72cm – 115cm',
      'Max Load': '100 kg',
      'Tabletop': 'Thermal Matte Laminate',
      'Memory Slots': '2 Presets'
    },
    visualProps: {
      materialVariant: 'black',
      frameColor: '#0f1115',
      widthCm: 130,
      depthCm: 70
    }
  },

  // CHAIRS
  {
    id: 'chair-aeron-graphite',
    name: 'Aeron Ergonomic Mesh Chair (Remastered)',
    brand: 'Herman Miller',
    category: 'chairs',
    weeklyPrice: 32,
    monthlyPrice: 98,
    deposit: 90,
    description: 'The global gold standard in ergonomic task seating. 8Z Pellicle breathable suspension mesh engineered for all-day focus in Bali warmth.',
    dimensions: 'Size B (Medium)',
    inStock: true,
    tags: ['8Z Pellicle Mesh', 'PostureFit SL', 'Harmonic 2 Tilt', 'Breathable'],
    image: 'https://images.unsplash.com/photo-1580481077195-c992764f691d?auto=format&fit=crop&w=600&q=80',
    colors: ['Graphite Black'],
    specs: {
      'Mesh Material': '8Z Pellicle Breathable Elastomer',
      'Lumbar Support': 'Dual PostureFit SL Pads',
      'Armrests': 'Fully Adjustable 4D (Height, Depth, Angle)',
      'Recline': 'Synchronized Harmonic 2 Tilt Limiter'
    },
    visualProps: {
      chairVariant: 'aeron',
      frameColor: '#252932'
    }
  },
  {
    id: 'chair-gesture-steelcase',
    name: 'Gesture Advanced Ergonomic Office Chair',
    brand: 'Steelcase',
    category: 'chairs',
    weeklyPrice: 30,
    monthlyPrice: 92,
    deposit: 85,
    description: 'Designed to support human movement across smartphones, tablets, and multi-monitor workstations. Core Equalizer lumbar support.',
    dimensions: 'Universal Ergonomic Fit',
    inStock: true,
    tags: ['360° Arm Movement', 'Core Equalizer', 'Contoured Seat', 'Nomad Favorite'],
    image: 'https://images.unsplash.com/photo-1688578736340-e14b2d5663bd?auto=format&fit=crop&w=600&q=80',
    colors: ['Onyx Fabric', 'Polished Frame'],
    specs: {
      'Seat Core': 'High-Density Adaptive Foam with air pockets',
      'Arm Movement': '360-degree ball joint articulating arms',
      'Backrest': 'Flexible Core Equalizer',
      'Weight Capacity': '180 kg'
    },
    visualProps: {
      chairVariant: 'gesture',
      frameColor: '#1a1d24'
    }
  },
  {
    id: 'chair-ergo-headrest-mesh',
    name: 'ErgoPro High-Back Mesh with Neck Cradle',
    brand: 'Monis Comfort',
    category: 'chairs',
    weeklyPrice: 20,
    monthlyPrice: 62,
    deposit: 45,
    description: 'Dynamic height & angle-adjustable neck support, adaptive 2-way lumbar pressure pad, and wire-mesh breathable back for high humidity.',
    dimensions: 'High-Back with Headrest',
    inStock: true,
    tags: ['Headrest Included', 'Dynamic Lumbar', 'Mesh Back', 'Great Value'],
    image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=600&q=80',
    colors: ['Cool Slate Gray'],
    specs: {
      'Headrest': 'Height + 45° Tilt Articulation',
      'Lumbar': 'Spring-loaded self-adjusting cushion',
      'Recline Lock': '90°, 115°, 135° positions',
      'Gas Lift': 'Class 4 Heavy Duty Cylinder'
    },
    visualProps: {
      chairVariant: 'executive',
      frameColor: '#334155'
    }
  },
  {
    id: 'chair-active-stool',
    name: 'ErgoMotion Active Balance Stool',
    brand: 'Monis Active',
    category: 'chairs',
    weeklyPrice: 12,
    monthlyPrice: 38,
    deposit: 30,
    description: 'Rocking active perch stool for sit-to-stand transitions. Strengthens core stability and encourages continuous micro-movement while working standing up.',
    dimensions: 'Height 55 - 82 cm',
    inStock: true,
    tags: ['Active Perch', 'Core Ergonomics', '360 Wobble', 'Compact'],
    image: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=80',
    colors: ['Charcoal Wool Cushion'],
    specs: {
      'Tilt Range': 'Up to 15° non-slip convex base',
      'Pneumatic Lift': 'Easy release 360-degree ring',
      'Base': 'Rubberized anti-skid floor guard'
    },
    visualProps: {
      chairVariant: 'stool',
      frameColor: '#1e293b'
    }
  },

  // MONITORS
  {
    id: 'monitor-dual-4k-arms',
    name: 'Dual 27" 4K IPS Displays with Heavy-Duty Gas Arms',
    brand: 'Dell UltraSharp',
    category: 'monitors',
    weeklyPrice: 35,
    monthlyPrice: 110,
    deposit: 90,
    description: 'The ultimate dual-screen coding and design workstation. Two 27-inch 4K IPS monitors clamped on fluid 360° gas-spring monitor arms with single USB-C hub charging.',
    dimensions: 'Dual 27-inch (3840 x 2160 each)',
    inStock: true,
    tags: ['Dual 4K', '90W USB-C PD', 'Gas-Spring Arms', 'Color Calibrated 99% DCI-P3'],
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    colors: ['Platinum Silver / Black'],
    specs: {
      'Resolution': 'Dual 4K UHD (3840 x 2160 @ 60Hz)',
      'Panel': 'IPS Black Technology (2000:1 Contrast)',
      'Connectivity': 'USB-C (90W PD), DisplayPort 1.4, HDMI 2.1',
      'Mount': 'Dual Gas Spring Desktop Clamp Arm'
    },
    visualProps: {
      monitorVariant: 'dual'
    }
  },
  {
    id: 'monitor-34-ultrawide-curved',
    name: '34" Curved WQHD 144Hz Cinema Display',
    brand: 'Samsung ViewFinity',
    category: 'monitors',
    weeklyPrice: 29,
    monthlyPrice: 88,
    deposit: 75,
    description: 'Panoramic 21:9 curved immersion without bezel gap. 1000R curvature matched to human peripheral vision, HDR10, and 90W USB-C laptop power.',
    dimensions: '34-inch 21:9 Ultra-Wide (3440 x 1440)',
    inStock: true,
    tags: ['21:9 Ultrawide', '1000R Curve', '144Hz Smooth', 'Single Cable Setup'],
    image: 'https://images.unsplash.com/photo-1547119957-637f8679db1e?auto=format&fit=crop&w=600&q=80',
    colors: ['Titan Dark Gray'],
    specs: {
      'Resolution': 'UWQHD (3440 x 1440 @ 144Hz)',
      'Curvature': '1000R Ergonomic Curve',
      'Power Delivery': '90W USB-C with Ethernet RJ45 port',
      'Audio': 'Integrated Stereo Speakers (5W x 2)'
    },
    visualProps: {
      monitorVariant: 'ultrawide'
    }
  },
  {
    id: 'monitor-single-27-4k',
    name: 'Studio 27" 4K HDR Color-Accurate Display',
    brand: 'LG UltraFine',
    category: 'monitors',
    weeklyPrice: 20,
    monthlyPrice: 64,
    deposit: 50,
    description: 'Crisp 4K UHD with 98% DCI-P3 color gamut, anti-glare matte coating for bright tropical daylight villas, and height-adjustable pivot stand.',
    dimensions: '27-inch (3840 x 2160)',
    inStock: true,
    tags: ['4K UHD', 'Matte Anti-Glare', 'USB-C 65W', 'Pivot / Swivel'],
    image: 'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?auto=format&fit=crop&w=600&q=80',
    colors: ['Matte Black'],
    specs: {
      'Resolution': '4K UHD (3840 x 2160)',
      'Brightness': '400 nits HDR400',
      'Port Array': 'USB-C, 2x HDMI, DisplayPort',
      'Stand': 'Height, Tilt & 90° Portrait Pivot'
    },
    visualProps: {
      monitorVariant: 'single'
    }
  },

  // LIGHTING
  {
    id: 'light-benq-screenbar-halo',
    name: 'BenQ ScreenBar Halo with Wireless Controller',
    brand: 'BenQ',
    category: 'lighting',
    weeklyPrice: 9,
    monthlyPrice: 28,
    deposit: 25,
    description: 'Zero screen glare asymmetrical optical task lamp. Features rear ambient backlight and a wireless precision rotary puck controller to dial brightness and color temperature.',
    dimensions: '50 cm width bar',
    inStock: true,
    tags: ['Zero Glare', 'Rear Ambient Glow', 'Wireless Dial', 'Auto-Dimming Sensor'],
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    colors: ['Space Gray Aluminum'],
    specs: {
      'Light Engine': 'Asymmetrical Optical Task LED + Rear Ambient',
      'Color Temperature': '2700K (Warm Sunset) to 6500K (Cool Day)',
      'Illuminance': 'Center 1000 Lux @ 45cm',
      'Controls': 'Wireless 2.4GHz Rotary Touch Puck'
    },
    visualProps: {
      lightVariant: 'screenbar'
    }
  },
  {
    id: 'light-angle-nordic-lamp',
    name: 'Nordic Architectural Clamp Arm Lamp',
    brand: 'Monis Lighting',
    category: 'lighting',
    weeklyPrice: 6,
    monthlyPrice: 18,
    deposit: 15,
    description: 'Double-jointed cantilever studio arm with brushed brass hardware and diffuse 3000K warm LED bulb. Clamps to any desk edge.',
    dimensions: 'Arm reach 75 cm',
    inStock: true,
    tags: ['Cantilever Arm', 'Warm 3000K', 'Edge Clamp', 'Brushed Metal'],
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80',
    colors: ['Matte Black / Brass'],
    specs: {
      'Bulb': 'CRI >95 Warm White LED (8W)',
      'Reach': '3-point articulating arm',
      'Mount': 'Reinforced C-clamp (up to 60mm tabletop)'
    },
    visualProps: {
      lightVariant: 'lamp'
    }
  },

  // ACCESSORIES
  {
    id: 'acc-keyboard-mouse-ergo',
    name: 'Keychron Wireless Mechanical + Logitech MX Master 3S',
    brand: 'Keychron & Logitech',
    category: 'accessories',
    weeklyPrice: 12,
    monthlyPrice: 38,
    deposit: 35,
    description: 'The definitive pro input duo: Keychron K3 ultra-slim wireless mechanical keyboard (Brown tactile switches) and Logitech MX Master 3S ergonomic silent click mouse.',
    dimensions: 'Compact 75% Layout + Ergonomic Mouse',
    inStock: true,
    tags: ['Tactile Mechanical', '8K DPI MagSpeed', 'Multi-Device Bluetooth', 'Silent Click'],
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    colors: ['Dark Charcoal / Space Gray'],
    specs: {
      'Keyboard': 'Keychron K3 Low-Profile Gateron Brown Switches',
      'Mouse': 'Logitech MX Master 3S (Quiet Clicks, MagSpeed Wheel)',
      'Battery': 'Rechargeable USB-C (lasts weeks)',
      'OS Support': 'Instant Mac / Windows layout switch'
    },
    visualProps: {
      accessoryVariant: 'keyboard_mouse'
    }
  },
  {
    id: 'acc-laptop-stand-riser',
    name: 'AeroFold CNC Aluminum Laptop Riser',
    brand: 'Monis Nomad',
    category: 'accessories',
    weeklyPrice: 4,
    monthlyPrice: 14,
    deposit: 15,
    description: 'Elevates your MacBook / laptop to eye-level to eliminate forward head slouch and maximize passive airflow.',
    dimensions: 'Compatible with 13" - 16" Laptops',
    inStock: true,
    tags: ['Anodized Aluminum', 'Eye-Level Height', 'Airflow Cooling', 'Silicone Grips'],
    image: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=600&q=80',
    colors: ['Space Gray'],
    specs: {
      'Material': 'Solid CNC-Milled Anodized Aluminum',
      'Elevation': 'Raises screen 15 cm (6 inches)',
      'Cable Slot': 'Rear cable passthrough for clean look'
    },
    visualProps: {
      accessoryVariant: 'laptop_stand'
    }
  },
  {
    id: 'acc-felt-desk-pad',
    name: 'Merino Wool Felt Extra-Large Desk Pad',
    brand: 'Grovemade Style',
    category: 'accessories',
    weeklyPrice: 4,
    monthlyPrice: 12,
    deposit: 10,
    description: '90 x 40 cm German merino wool felt pad with natural cork underlay. Provides warm acoustic dampening, wrist cushion, and smooth mouse gliding.',
    dimensions: '90 x 40 x 0.4 cm',
    inStock: true,
    tags: ['Merino Wool', 'Natural Cork Backing', 'Acoustic Softness', 'Water-Repellent'],
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    colors: ['Heather Dark Gray'],
    specs: {
      'Material': '100% Virgin Merino Wool Felt',
      'Underlayer': 'Non-slip natural Portuguese cork',
      'Size': '90cm x 40cm XL coverage'
    },
    visualProps: {
      accessoryVariant: 'mat'
    }
  },
  {
    id: 'acc-monstera-plant',
    name: 'Potted Bali Monstera Deliciosa (Villa Plant)',
    brand: 'Bali Botanical',
    category: 'accessories',
    weeklyPrice: 3,
    monthlyPrice: 10,
    deposit: 10,
    description: 'Live lush tropical split-leaf philodendron in a hand-thrown terracotta ceramic planter. Purifies room air and brings Bali villa nature to your setup.',
    dimensions: '45 cm height',
    inStock: true,
    tags: ['Air Purifying', 'Terracotta Planter', 'Bali Villa Flora', 'Biophilic Design'],
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80',
    colors: ['Lush Forest Green / Natural Terracotta'],
    specs: {
      'Pot': 'Matte terracotta ceramic with drip saucer',
      'Care': 'Pre-watered, low-maintenance indirect sunlight'
    },
    visualProps: {
      accessoryVariant: 'plant'
    }
  }
];

export const BALI_DELIVERY_ZONES = [
  { id: 'canggu', name: 'Canggu & Batu Bolong', fee: 0, time: 'Next day · 9:00 AM' },
  { id: 'pererenan', name: 'Pererenan & Seseh', fee: 0, time: 'Next day · 10:00 AM' },
  { id: 'seminyak', name: 'Seminyak & Kerobokan', fee: 0, time: 'Next day · 11:00 AM' },
  { id: 'ubud', name: 'Ubud Central & Sayan', fee: 8, time: 'Next day · 1:00 PM' },
  { id: 'uluwatu', name: 'Uluwatu & Bingin / Bukit', fee: 10, time: 'Next day · 2:00 PM' },
  { id: 'sanur', name: 'Sanur & Denpasar East', fee: 5, time: 'Next day · 11:30 AM' },
];

export const PRESET_SETUPS = [
  {
    id: 'preset-coder',
    title: 'The Full-Stack Dual 4K',
    subtitle: 'Engineers, data scientists & heavy multitaskers',
    deskId: 'desk-solid-oak-motor',
    chairId: 'chair-aeron-graphite',
    monitorId: 'monitor-dual-4k-arms',
    lightingId: 'light-benq-screenbar-halo',
    accessoryIds: ['acc-keyboard-mouse-ergo', 'acc-felt-desk-pad', 'acc-monstera-plant'],
    deskHeightCm: 76,
  },
  {
    id: 'preset-creator',
    title: 'The 34" Ultrawide Creative Suite',
    subtitle: 'Designers, video editors & product managers',
    deskId: 'desk-executive-walnut',
    chairId: 'chair-gesture-steelcase',
    monitorId: 'monitor-34-ultrawide-curved',
    lightingId: 'light-benq-screenbar-halo',
    accessoryIds: ['acc-keyboard-mouse-ergo', 'acc-laptop-stand-riser', 'acc-felt-desk-pad', 'acc-monstera-plant'],
    deskHeightCm: 74,
  },
  {
    id: 'preset-nomad',
    title: 'The Minimalist Nomad',
    subtitle: 'Writers, consultants & fast travelers',
    deskId: 'desk-bamboo-ergo',
    chairId: 'chair-ergo-headrest-mesh',
    monitorId: 'monitor-single-27-4k',
    lightingId: 'light-angle-nordic-lamp',
    accessoryIds: ['acc-keyboard-mouse-ergo', 'acc-felt-desk-pad'],
    deskHeightCm: 75,
  }
];
