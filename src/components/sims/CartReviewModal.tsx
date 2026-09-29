import React, { useState } from 'react';
import type { SimsProduct, PlacedFurniture } from '../../data/simsCatalog';
import type { SpaceParameters } from '../../types/space';
import { BALI_DELIVERY_ZONES } from '../../data/defaultCatalog';
import { X, MessageCircle, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/soundEffects';
import { useEscapeKey } from './hooks/useEscapeKey';
import { buildWhatsAppUrl } from '../../utils/whatsapp';
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
  useEscapeKey(true, onClose);

  const [duration, setDuration] = useState<'weekly' | 'monthly'>('monthly');
  const [zoneId, setZoneId] = useState('canggu');
  const [isBooked, setIsBooked] = useState(false);

  const selectedZone = BALI_DELIVERY_ZONES.find(z => z.id === zoneId) || BALI_DELIVERY_ZONES[0];

  const itemsWithProduct = placedItems.map(item => ({
    ...item,
    product: catalog.find(p => p.id === item.productId),
  })).filter(item => Boolean(item.product));

  const isMonthly = duration === 'monthly';
  const unit = isMonthly ? 'mo' : 'wk';
  const totalWeekly = itemsWithProduct.reduce((sum, i) => sum + (i.product?.weeklyRent || 0), 0);
  const totalMonthly = itemsWithProduct.reduce((sum, i) => sum + (i.product?.monthlyRent || 0), 0);
  const totalDeposit = itemsWithProduct.reduce((sum, i) => sum + (i.product?.deposit || 0), 0);

  const recurringTotal = isMonthly ? totalMonthly : totalWeekly;
  const initialTotal = recurringTotal + totalDeposit + selectedZone.fee;

  const fourWeeks = totalWeekly * 4;
  const savingsPercent = fourWeeks > 0 ? Math.round(((fourWeeks - totalMonthly) / fourWeeks) * 100) : 25;

  const handleOrder = () => {
    confetti({ particleCount: 100, spread: 75, origin: { y: 0.6 } });
    sounds.playPlace();
    setIsBooked(true);
  };

  const generateWhatsAppMessage = () =>
    buildWhatsAppUrl([
      'Hi Monis Team! I designed my workspace on the 3D Simulator:',
      '',
      `*Space: ${spaceParams.width}m x ${spaceParams.length}m*`,
      '',
      `*Items (${itemsWithProduct.length}):*`,
      ...itemsWithProduct.map(i => `• ${i.product?.name} ($${isMonthly ? i.product?.monthlyRent : i.product?.weeklyRent})`),
      '',
      `*Plan:* ${isMonthly ? `Monthly ($${totalMonthly}/mo)` : `Weekly ($${totalWeekly}/wk)`}`,
      `*Delivery:* ${selectedZone.name}`,
      `*Total due:* $${initialTotal}`,
    ]);

  return (
    <div
      data-hud="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#f0ece1]/75 backdrop-blur-md animate-fade-in overflow-y-auto select-none"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl relative my-auto border border-slate-200 text-slate-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Checkout</h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {itemsWithProduct.length} {itemsWithProduct.length === 1 ? 'item' : 'items'}
            </span>
            <span className="text-[11px] font-mono text-slate-400">{spaceParams.width}×{spaceParams.length} m</span>
          </div>

          <div className="flex items-center gap-1">
            {itemsWithProduct.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Clear all placed equipment from the room?')) {
                    sounds.playDelete();
                    onClearAll();
                  }
                }}
                className="apple-press px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="apple-press p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4">
          {/* Items */}
          <div className="md:col-span-7">
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {itemsWithProduct.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                  <div className="text-sm font-bold text-slate-800">Your room is empty</div>
                  <button
                    onClick={onClose}
                    className="apple-press mt-3 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm hover:bg-black cursor-pointer"
                  >
                    Browse equipment
                  </button>
                </div>
              ) : (
                itemsWithProduct.map(item => (
                  <div
                    key={item.instanceId}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-white border border-slate-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.product?.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            draggable={false}
                            className="w-9 h-9 object-contain pointer-events-none select-none"
                          />
                        ) : (
                          <span className="text-xl">{item.product?.icon}</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900 truncate">{item.product?.name}</div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="font-mono text-emerald-700 font-extrabold text-sm">
                        ${isMonthly ? item.product?.monthlyRent : item.product?.weeklyRent}
                        <span className="text-[10px] text-slate-500 font-normal">/{unit}</span>
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
          </div>

          {/* Plan, delivery, total */}
          <div className="md:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-1 p-1 bg-white rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setDuration('monthly')}
                className={`py-2 px-2.5 rounded-lg text-left transition cursor-pointer ${
                  isMonthly ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Monthly</span>
                  <span className={`text-[9px] px-1 rounded-full ${isMonthly ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-100 text-emerald-800'}`}>
                    -{savingsPercent}%
                  </span>
                </div>
                <div className={`text-[11px] font-mono font-bold ${isMonthly ? 'text-emerald-300' : 'text-slate-800'}`}>${totalMonthly}/mo</div>
              </button>

              <button
                type="button"
                onClick={() => setDuration('weekly')}
                className={`py-2 px-2.5 rounded-lg text-left transition cursor-pointer ${
                  !isMonthly ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="text-xs font-bold">Weekly</div>
                <div className={`text-[11px] font-mono font-bold ${!isMonthly ? 'text-emerald-300' : 'text-slate-800'}`}>${totalWeekly}/wk</div>
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span>Delivery</span>
                <span className="font-mono text-emerald-700 font-semibold">{selectedZone.time}</span>
              </div>
              <AppleSelect
                value={zoneId}
                onChange={setZoneId}
                options={BALI_DELIVERY_ZONES.map(z => ({
                  value: z.id,
                  label: z.name,
                  description: `${z.fee === 0 ? 'Free' : `+$${z.fee}`} • ${z.time}`,
                  badge: z.fee === 0 ? 'Free' : `+$${z.fee}`,
                }))}
                className="w-full"
                buttonClassName="bg-white border-slate-200 py-2.5 rounded-xl shadow-xs"
              />
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Rental</span>
                <span className="text-emerald-700 font-mono font-bold">${recurringTotal}/{unit}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Deposit</span>
                <span className="text-slate-900 font-mono font-bold">${totalDeposit}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery</span>
                <span className="text-slate-900 font-mono font-bold">
                  {selectedZone.fee === 0 ? <strong className="text-emerald-600">Free</strong> : `$${selectedZone.fee}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-900 font-extrabold border-t border-slate-100 pt-2 text-sm">
                <span>Due today</span>
                <span className="font-mono text-base">${initialTotal}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleOrder}
                disabled={itemsWithProduct.length === 0}
                className="apple-press w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black disabled:opacity-40 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Reserve
              </button>
              <a
                href={generateWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="apple-press w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Confirmation */}
        {isBooked && (
          <div className="absolute inset-0 z-20 bg-white/98 backdrop-blur-md p-8 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Reserved!</h3>
            <p className="text-xs text-slate-600 mt-1.5">
              Delivery to <strong className="text-slate-900">{selectedZone.name}</strong> · {selectedZone.time}
            </p>
            <div className="my-4 text-sm font-mono text-slate-900 font-extrabold">Due at delivery: ${initialTotal}</div>
            <div className="flex items-center gap-2.5 w-full max-w-xs">
              <a
                href={generateWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="apple-press flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
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
