import React, { useState } from 'react';
import type { SimsProduct, PlacedFurniture } from '../../data/simsCatalog';
import type { SpaceParameters } from '../../types/space';
import { BALI_DELIVERY_ZONES } from '../../data/defaultCatalog';
import {
  X, ShoppingBag, MapPin, MessageCircle, Sparkles,
  Trash2, ArrowRight, ShieldCheck, Truck, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEffects';
import { AppleSelect } from './ui/AppleSelect';

interface CartReviewModalProps {
  catalog: SimsProduct[];
  placedItems: PlacedFurniture[];
  spaceParams: SpaceParameters;
  onRemoveItem: (instanceId: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export const CartReviewModal: React.FC<CartReviewModalProps> = ({
  catalog,
  placedItems,
  spaceParams,
  onRemoveItem,
  onClearAll,
  onClose,
}) => {
  const [duration, setDuration] = useState<'weekly' | 'monthly'>('monthly');
  const [zoneId, setZoneId] = useState('canggu');
  const [isBooked, setIsBooked] = useState(false);

  const selectedZone = BALI_DELIVERY_ZONES.find(z => z.id === zoneId) || BALI_DELIVERY_ZONES[0];

  const itemsWithProduct = placedItems.map(item => ({
    ...item,
    product: catalog.find(p => p.id === item.productId),
  })).filter(item => Boolean(item.product));

  const isMonthly = duration === 'monthly';
  const totalWeekly = itemsWithProduct.reduce((sum, i) => sum + (i.product?.weeklyRent || 0), 0);
  const totalMonthly = itemsWithProduct.reduce((sum, i) => sum + (i.product?.monthlyRent || 0), 0);
  const totalDeposit = itemsWithProduct.reduce((sum, i) => sum + (i.product?.deposit || 0), 0);

  const recurringTotal = isMonthly ? totalMonthly : totalWeekly;
  const initialTotal = recurringTotal + totalDeposit + selectedZone.fee;

  const fourWeeks = totalWeekly * 4;
  const savingsPercent = fourWeeks > 0 ? Math.round(((fourWeeks - totalMonthly) / fourWeeks) * 100) : 25;

  const handleOrder = () => {
    confetti({
      particleCount: 100,
      spread: 75,
      origin: { y: 0.6 }
    });
    sounds.playPlace();
    setIsBooked(true);
  };

  const generateWhatsAppMessage = () => {
    const spaceSummary = `Space: ${spaceParams.width}m x ${spaceParams.length}m (${(spaceParams.width * spaceParams.length).toFixed(1)}m²) - ${spaceParams.floorStyle} flooring`;
    const itemList = itemsWithProduct.map(i => `• ${i.product?.name} ($${isMonthly ? i.product?.monthlyRent : i.product?.weeklyRent})`).join('%0A');
    const text = `Hi Monis Team! I designed my workspace room on the 3D Simulator:%0A%0A*${spaceSummary}*%0A%0A*Placed Furniture (${itemsWithProduct.length} items):*%0A${itemList}%0A%0A*Subscription:* ${isMonthly ? `Monthly ($${totalMonthly}/mo)` : `Weekly ($${totalWeekly}/wk)`}%0A*Delivery Destination:* ${selectedZone.name}%0A*Total Initial Due:* $${initialTotal}%0A%0ACould you confirm delivery availability to my villa?`;
    return `https://wa.me/6281234567890?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto select-none">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl relative my-auto border border-slate-200 text-slate-900 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Your Workstation Setup</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {itemsWithProduct.length} {itemsWithProduct.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Delivered & installed at your Bali villa by Monis logistics</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="apple-press p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            title="Close Cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Responsive Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-5">
          {/* Left Column: Room Specs & Placed Items Manifest (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            {/* Space Dimensions Summary Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Room Architecture</div>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {spaceParams.width}m × {spaceParams.length}m · {(spaceParams.width * spaceParams.length).toFixed(1)} m²
                </div>
                <div className="text-[11px] text-slate-500 capitalize font-medium">
                  {spaceParams.floorStyle} flooring · {spaceParams.hasWindow ? 'Natural sunlight window' : 'Interior studio'}
                </div>
              </div>

              {itemsWithProduct.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Clear all placed equipment from the room?')) {
                      sounds.playDelete();
                      onClearAll();
                    }
                  }}
                  className="apple-press px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold font-mono transition cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Furniture List */}
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {itemsWithProduct.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                  <div className="text-3xl mb-2">🛋️</div>
                  <div className="text-sm font-bold text-slate-800">Your room is empty</div>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Select desks, ergonomic chairs, monitors, and accessories from the catalog sidebar to build your villa setup.
                  </p>
                  <button
                    onClick={onClose}
                    className="apple-press mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm hover:bg-black cursor-pointer"
                  >
                    Browse Equipment Catalog
                  </button>
                </div>
              ) : (
                itemsWithProduct.map(item => (
                  <div
                    key={item.instanceId}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-shadow shadow-xs hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.product?.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            draggable={false}
                            className="w-10 h-10 object-contain pointer-events-none select-none"
                          />
                        ) : (
                          <span className="text-xl">{item.product?.icon}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {item.product?.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-mono">
                          <span>{item.product?.footprint.width}×{item.product?.footprint.depth}m</span>
                          <span>·</span>
                          <span>Grid ({item.gridX}, {item.gridZ})</span>
                          {item.surfaceY > 0 && (
                            <>
                              <span>·</span>
                              <span className="text-amber-700 font-semibold">Desk Surface</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="font-mono text-emerald-700 font-extrabold text-sm">
                          ${isMonthly ? item.product?.monthlyRent : item.product?.weeklyRent}
                          <span className="text-[10px] text-slate-500 font-normal">/{isMonthly ? 'mo' : 'wk'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Dep: ${item.product?.deposit}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          sounds.playDelete();
                          onRemoveItem(item.instanceId);
                        }}
                        className="apple-press p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Value Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                <span className="font-medium">Next-Day Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                <span className="font-medium">Wear & Tear Safe</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                <span className="font-medium">Free Ergonomic Swap</span>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Duration, Destination & Checkout (5 cols) */}
          <div className="md:col-span-5 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
            {/* Duration Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 mb-1.5 block">
                Rental Term Duration
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDuration('monthly')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition cursor-pointer text-left ${
                    isMonthly ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Monthly Saver</span>
                    <span className={`text-[9px] px-1 rounded-full font-bold ${isMonthly ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-100 text-emerald-800'}`}>
                      -{savingsPercent}%
                    </span>
                  </div>
                  <div className={`text-[11px] font-mono mt-0.5 font-bold ${isMonthly ? 'text-emerald-300' : 'text-slate-800'}`}>
                    ${totalMonthly}/mo
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDuration('weekly')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition cursor-pointer text-left ${
                    !isMonthly ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="text-slate-500 text-[10px] font-normal">Flexible Stays</div>
                  <div className={`text-xs font-bold ${!isMonthly ? 'text-white' : 'text-slate-700'}`}>
                    Weekly Flex
                  </div>
                  <div className={`text-[11px] font-mono mt-0.5 font-bold ${!isMonthly ? 'text-emerald-300' : 'text-emerald-700'}`}>
                    ${totalWeekly}/wk
                  </div>
                </button>
              </div>
            </div>

            {/* Bali Villa Delivery Destination */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-700" />
                  Bali Delivery Destination
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-semibold">{selectedZone.time}</span>
              </label>
              <AppleSelect
                value={zoneId}
                onChange={setZoneId}
                options={BALI_DELIVERY_ZONES.map(z => ({
                  value: z.id,
                  label: z.name,
                  description: `${z.fee === 0 ? 'Free Delivery' : `+$${z.fee} Delivery`} • ${z.time}`,
                  badge: z.fee === 0 ? 'Free' : `+$${z.fee}`,
                }))}
                className="w-full"
                buttonClassName="bg-white border-slate-200 py-2.5 rounded-xl shadow-xs"
              />
            </div>

            {/* Financial Breakdown */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Equipment Rental ({isMonthly ? 'Monthly' : 'Weekly'}):</span>
                <span className="text-emerald-700 font-mono font-bold">
                  ${recurringTotal} /{isMonthly ? 'mo' : 'wk'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Refundable Deposit:</span>
                <span className="text-slate-900 font-mono font-bold">${totalDeposit}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Villa Delivery & Assembly:</span>
                <span className="text-slate-900 font-mono font-bold">
                  {selectedZone.fee === 0 ? <strong className="text-emerald-600">FREE</strong> : `+$${selectedZone.fee}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-900 font-extrabold border-t border-slate-100 pt-2 text-sm">
                <span>Total Initial Due:</span>
                <span className="text-slate-950 font-mono text-base">${initialTotal}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleOrder}
                disabled={itemsWithProduct.length === 0}
                className="apple-press w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Reserve Setup & Proceed</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={generateWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="apple-press w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order via WhatsApp Direct</span>
              </a>
            </div>
          </div>
        </div>

        {/* Confirmation Screen Overlay */}
        {isBooked && (
          <div className="absolute inset-0 z-20 bg-white/98 backdrop-blur-md p-8 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl mb-3 shadow-xs">
              🎉
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Workstation Reserved!</h3>
            <p className="text-xs text-slate-600 mt-2 max-w-md font-medium leading-relaxed">
              Your customized {spaceParams.width}m × {spaceParams.length}m setup with {itemsWithProduct.length} items has been confirmed for delivery to <strong className="text-slate-900">{selectedZone.name}</strong>.
            </p>

            <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-2 text-left w-full max-w-sm">
              <div className="flex justify-between text-slate-600">
                <span>Expected Arrival:</span>
                <span className="text-slate-900 font-bold">{selectedZone.time}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Rental Subscription:</span>
                <span className="text-emerald-700 font-bold">${recurringTotal} /{isMonthly ? 'mo' : 'wk'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Due at Delivery:</span>
                <span className="text-slate-900 font-extrabold">${initialTotal}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full max-w-sm">
              <a
                href={generateWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="apple-press flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp Chat</span>
              </a>
              <button
                onClick={() => {
                  setIsBooked(false);
                  onClose();
                }}
                className="apple-press px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
