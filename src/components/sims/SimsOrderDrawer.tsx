import React, { useState } from 'react';
import type { SimsProduct, PlacedFurniture } from '../../data/simsCatalog';
import { BALI_DELIVERY_ZONES } from '../../data/defaultCatalog';
import { MapPin, MessageCircle, Sparkles, Trash2, Calendar, ArrowRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEffects';
import { AppleSelect } from './ui/AppleSelect';

interface SimsOrderDrawerProps {
  catalog: SimsProduct[];
  placedItems: PlacedFurniture[];
  onRemoveItem: (instanceId: string) => void;
  onClearRoom: () => void;
}

export const SimsOrderDrawer: React.FC<SimsOrderDrawerProps> = ({
  catalog,
  placedItems,
  onRemoveItem,
  onClearRoom,
}) => {
  const [rentalDuration, setRentalDuration] = useState<'weekly' | 'monthly'>('monthly');
  const [deliveryZoneId, setDeliveryZoneId] = useState('canggu');
  const [showOrderModal, setShowOrderModal] = useState(false);

  const selectedZone = BALI_DELIVERY_ZONES.find(z => z.id === deliveryZoneId) || BALI_DELIVERY_ZONES[0];

  // Calculate pricing based on placed items
  const itemsWithProduct = placedItems.map(item => ({
    ...item,
    product: catalog.find(p => p.id === item.productId),
  })).filter(item => Boolean(item.product));

  const totalWeekly = itemsWithProduct.reduce((sum, item) => sum + (item.product?.weeklyRent || 0), 0);
  const totalMonthly = itemsWithProduct.reduce((sum, item) => sum + (item.product?.monthlyRent || 0), 0);
  const totalDeposit = itemsWithProduct.reduce((sum, item) => sum + (item.product?.deposit || 0), 0);

  const isMonthly = rentalDuration === 'monthly';
  const recurringTotal = isMonthly ? totalMonthly : totalWeekly;
  const deliveryFee = selectedZone.fee;
  const initialTotal = recurringTotal + totalDeposit + deliveryFee;

  const fourWeeksCost = totalWeekly * 4;
  const savingsPercent = fourWeeksCost > 0 ? Math.round(((fourWeeksCost - totalMonthly) / fourWeeksCost) * 100) : 25;

  const handleOrder = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    sounds.playPlace();
    setShowOrderModal(true);
  };

  const generateWhatsAppMessage = () => {
    const list = itemsWithProduct.map(i => `• ${i.product?.name} ($${isMonthly ? i.product?.monthlyRent : i.product?.weeklyRent})`).join('%0A');
    const text = `Hi Monis Team! I designed my Bali workspace using the Sims 3D Room Builder:%0A%0A${list}%0A%0A*Duration:* ${isMonthly ? `Monthly ($${totalMonthly}/mo)` : `Weekly ($${totalWeekly}/wk)`}%0A*Delivery Zone:* ${selectedZone.name}%0A*Total Items:* ${itemsWithProduct.length}%0A*Total Due at Delivery:* $${initialTotal}%0A%0ACan you deliver this setup to my villa? Thank you!`;
    return `https://wa.me/6281234567890?text=${text}`;
  };

  return (
    <div className="bg-[#131722] border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                Room Inventory & Rent
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded-full font-bold">
                {placedItems.length} in room
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live tally of all furniture placed in your 3D room
            </p>
          </div>

          {placedItems.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all furniture in the room?')) {
                  sounds.playDelete();
                  onClearRoom();
                }
              }}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Duration Switcher */}
        <div className="grid grid-cols-2 gap-2 my-4 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setRentalDuration('weekly')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition ${
              !isMonthly ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div>Weekly Flex</div>
            <div className="text-[10px] font-mono text-emerald-400 mt-0.5">${totalWeekly}/wk</div>
          </button>

          <button
            onClick={() => setRentalDuration('monthly')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition relative ${
              isMonthly ? 'bg-emerald-500 text-black shadow-glow font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <span>Monthly Saver</span>
              <span className={`text-[9px] px-1 rounded-full ${isMonthly ? 'bg-black text-emerald-400' : 'bg-emerald-500/20 text-emerald-300'}`}>
                Save ~{savingsPercent}%
              </span>
            </div>
            <div className={`text-[10px] font-mono mt-0.5 ${isMonthly ? 'text-black font-bold' : 'text-emerald-400'}`}>
              ${totalMonthly}/mo
            </div>
          </button>
        </div>

        {/* Destination in Bali */}
        <div className="mb-4">
          <label className="block text-xs font-mono text-slate-400 mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Delivery Destination (Bali)</span>
          </label>
          <AppleSelect
            value={deliveryZoneId}
            onChange={setDeliveryZoneId}
            options={BALI_DELIVERY_ZONES.map(z => ({
              value: z.id,
              label: z.name,
              description: `${z.fee === 0 ? 'Free Delivery' : `+$${z.fee}`} • Setup: ${z.time}`,
              badge: z.fee === 0 ? 'Free' : `+$${z.fee}`,
            }))}
            className="w-full"
            buttonClassName="bg-slate-900 border-slate-700/80 text-slate-200 py-2.5 rounded-xl hover:bg-slate-800"
          />
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 font-mono">
            <Calendar className="w-3 h-3 text-emerald-400" />
            <span>Setup: {selectedZone.time}</span>
          </div>
        </div>

        {/* Itemized List of Placed Items */}
        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border-t border-b border-slate-800 py-3">
          {placedItems.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs font-mono">
              Your room is empty! Click items in the catalog below to place them on the grid.
            </div>
          ) : (
            itemsWithProduct.map(item => (
              <div
                key={item.instanceId}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="text-base">{item.product?.icon}</span>
                  <div className="truncate">
                    <div className="font-semibold text-slate-200 truncate">{item.product?.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Tile ({item.gridX}, {item.gridZ}) · {item.rotation}°
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-emerald-400 font-semibold">
                    ${isMonthly ? item.product?.monthlyRent : item.product?.weeklyRent}
                  </span>
                  <button
                    onClick={() => {
                      sounds.playDelete();
                      onRemoveItem(item.instanceId);
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                    title="Remove item"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pricing Summary & Checkout Button */}
      <div className="pt-4">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="text-[11px] font-mono text-slate-400">
              {isMonthly ? 'Monthly Subscription' : 'Weekly Rental'}
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              ${recurringTotal}
              <span className="text-xs text-slate-400 font-normal ml-1">
                /{isMonthly ? 'mo' : 'wk'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-mono">Total at Delivery</div>
            <div className="text-sm font-bold font-mono text-slate-200">
              ${initialTotal}
            </div>
            <div className="text-[9px] text-slate-500 font-mono">
              (incl. ${totalDeposit} deposit)
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleOrder}
            disabled={placedItems.length === 0}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-glow transition"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>Deliver This Room Setup</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href={generateWhatsAppMessage()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-emerald-400 font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Order via WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#161a25] border border-emerald-500/60 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowOrderModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl">
                🏡
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Sims Room Setup Booked!</h3>
                <p className="text-xs text-slate-400">Order Code: SIMS-{Math.floor(100000 + Math.random() * 900000)}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              We received your custom room layout with <strong className="text-emerald-300">{placedItems.length} items</strong> for delivery to <strong className="text-emerald-300">{selectedZone.name}</strong>.
            </p>

            <div className="bg-slate-900/80 rounded-2xl p-3 mb-4 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Duration:</span>
                <span className="text-white font-mono">{isMonthly ? 'Monthly Flexible Subscription' : 'Weekly Rental'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Recurring Rate:</span>
                <span className="text-emerald-400 font-mono font-bold">${recurringTotal} /{isMonthly ? 'mo' : 'wk'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Refundable Deposit:</span>
                <span className="text-white font-mono">${totalDeposit}</span>
              </div>
              <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1">
                <span>Delivery ETA:</span>
                <span className="text-amber-300 font-medium">{selectedZone.time}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={generateWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirm Delivery on WhatsApp</span>
              </a>
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
