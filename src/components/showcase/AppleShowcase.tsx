import React from 'react';
import type { SimsProduct } from '../../data/simsCatalog';
import { ShowcaseNav } from './sections/ShowcaseNav';
import { ShowcaseHero } from './sections/ShowcaseHero';
import { ValueProps } from './sections/ValueProps';
import { EquipmentFleet } from './sections/EquipmentFleet';
import { HowItWorks } from './sections/HowItWorks';
import { DeliveryZones } from './sections/DeliveryZones';
import { Testimonial } from './sections/Testimonial';
import { ShowcaseFooter } from './sections/ShowcaseFooter';

interface AppleShowcaseProps {
  onToggleInteractiveWorld: () => void;
  onOpenAdmin: () => void;
  onWalkInStudio?: () => void;
  catalog: SimsProduct[];
}

export const AppleShowcase: React.FC<AppleShowcaseProps> = ({
  onToggleInteractiveWorld,
  onOpenAdmin,
  onWalkInStudio,
  catalog,
}) => (
  <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
    <ShowcaseNav
      onToggleInteractiveWorld={onToggleInteractiveWorld}
      onOpenAdmin={onOpenAdmin}
      onWalkInStudio={onWalkInStudio}
    />
    <ShowcaseHero onToggleInteractiveWorld={onToggleInteractiveWorld} onWalkInStudio={onWalkInStudio} />
    <ValueProps />
    <EquipmentFleet catalog={catalog} onToggleInteractiveWorld={onToggleInteractiveWorld} />
    <HowItWorks />
    <DeliveryZones />
    <Testimonial />
    <ShowcaseFooter onToggleInteractiveWorld={onToggleInteractiveWorld} onOpenAdmin={onOpenAdmin} />
  </div>
);
