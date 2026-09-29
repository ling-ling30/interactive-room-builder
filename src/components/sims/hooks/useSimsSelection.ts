import { useMemo, useState } from 'react';
import type { SimsProduct, PlacedFurniture } from '../../../data/simsCatalog';

/** Multi-select state plus the derived values the action pill needs. */
export function useSimsSelection(placedItems: PlacedFurniture[], catalog: SimsProduct[]) {
  const [selectedInstanceIds, setSelectedInstanceIds] = useState<string[]>([]);

  const selectedItems = useMemo(
    () => placedItems.filter(p => selectedInstanceIds.includes(p.instanceId)),
    [placedItems, selectedInstanceIds]
  );
  const selectedItem = selectedItems.length === 1 ? selectedItems[0] : null;
  const selectedProduct = selectedItem ? catalog.find(p => p.id === selectedItem.productId) : null;
  const totalWeeklyRent = useMemo(() => {
    return selectedItems.reduce((sum: number, item: PlacedFurniture) => {
      const prod = catalog.find(p => p.id === item.productId);
      return sum + (prod?.weeklyRent || 0);
    }, 0);
  }, [selectedItems, catalog]);

  return {
    selectedInstanceIds,
    setSelectedInstanceIds,
    selectedItems,
    selectedItem,
    selectedProduct,
    totalWeeklyRent,
  };
}
