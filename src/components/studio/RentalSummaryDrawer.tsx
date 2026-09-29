import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { BALI_DELIVERY_ZONES } from '../../data/defaultCatalog';
import { Check, MapPin, Calendar, MessageCircle, ShieldCheck, ArrowRight, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppleSelect } from '../sims/ui/AppleSelect';

export const RentalSummaryDrawer: React.FC = () => {
  const {
    config,
    updateConfig,
    selectedDesk,
    selectedChair,
    selectedMonitor,
    selectedLighting,
    selectedAccessories,
    selectedZone,
    totalWeekly,
    totalMonthly,
    totalDeposit,
    monthlyDiscountPercent,
  } = useCatalog();

  const [showConfirmation, setShowConfirmation] = useState(false);

  const isMonthly = config.rentalDuration === 'monthly';
  const recurringTotal = isMonthly ? totalMonthly : totalWeekly;
  const deliveryFee = selectedZone.fee;
  const initialPayment = recurringTotal + totalDeposit + deliveryFee;

  // Build WhatsApp reservation message
  const generateWhatsAppMessage = () => {
    const items = [
      selectedDesk ? `• Desk: ${selectedDesk.name}` : null,
      selectedChair ? `• Chair: ${selectedChair.name}` : null,
      selectedMonitor ? `• Display: ${selectedMonitor.name}` : null,
      selectedLighting ? `• Light: ${selectedLighting.name}` : null,
      ...selectedAccessories.map(a => `• Extra: ${a.name}`),
    ].filter(Boolean).join('%0A');

    const durationText = isMonthly ? 'Monthly Subscription ($' + totalMonthly + '/mo)' : 'Weekly Rental ($' + totalWeekly + '/wk)';
    const text = `Hi Monis Team! I just customized my ergonomic workspace on the Monis Studio Simulator:%0A%0A${items}%0A%0A*Duration:* ${durationText}%0A*Delivery Zone:* ${selectedZone.name}%0A*Total Initial:* $${initialPayment} (incl. $${totalDeposit} refundable deposit)%0A%0ACould you check availability for delivery? Thank you!`;
    return `https://wa.me/6281234567890?text=${text}`;
  };

  const handleBookNow = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setShowConfirmation(true);
  };

  return (
    <div className="bg-[#14171f] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold tracking-wide uppercase font-mono text-slate-100 flex items-center gap-1.5">
              <span>Rental Summary</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-sans">
                Bali Flexible Lease
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Delivered and set up directly at your villa or coworking space
            </p>
          </div>
        </div>

        {/* Duration Switcher (Weekly vs Monthly) */}
        <div className="grid grid-cols-2 gap-2 my-4 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => updateConfig({ rentalDuration: 'weekly' })}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition ${
              !isMonthly
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div>Weekly Flex</div>
            <div className="text-[10px] font-mono text-emerald-400 font-normal mt-0.5">${totalWeekly}/wk</div>
          </button>

          <button
            onClick={() => updateConfig({ rentalDuration: 'monthly' })}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition relative ${
              isMonthly
                ? 'bg-emerald-500 text-black shadow-glow font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <span>Monthly Saver</span>
              <span className={`text-[9px] px-1 rounded-full ${isMonthly ? 'bg-black text-emerald-400' : 'bg-emerald-500/20 text-emerald-300'}`}>
                Save ~{monthlyDiscountPercent}%
              </span>
            </div>
            <div className={`text-[10px] font-mono mt-0.5 ${isMonthly ? 'text-black font-semibold' : 'text-emerald-400'}`}>
              ${totalMonthly}/mo
            </div>
          </button>
        </div>

        {/* Bali Delivery Zone Picker */}
        <div className="mb-4">
          <label className="block text-xs font-mono text-slate-400 mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Delivery Destination (Bali)</span>
          </label>
          <AppleSelect
            value={config.deliveryZone}
            onChange={(val) => updateConfig({ deliveryZone: val })}
            options={BALI_DELIVERY_ZONES.map(z => ({
              value: z.id,
              label: z.name,
              description: `${z.fee === 0 ? 'Free Delivery' : `+$${z.fee} delivery`} • ${z.time}`,
              badge: z.fee === 0 ? 'Free' : `+$${z.fee}`,
            }))}
            className="w-full"
            buttonClassName="bg-slate-900 border-slate-700/80 text-slate-200 py-2.5 rounded-xl hover:bg-slate-800"
          />
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <Calendar className="w-3 h-3 text-emerald-400" />
            <span>Estimated Setup: {selectedZone.time}</span>
          </p>
        </div>

        {/* Selected Items Line-Item Breakdown */}
        <div className="space-y-2 py-3 border-t border-b border-slate-800 text-xs">
          {selectedDesk && (
            <div className="flex justify-between items-center text-slate-300">
              <span className="truncate pr-2">• {selectedDesk.name}</span>
              <span className="font-mono text-slate-200 whitespace-nowrap">
                ${isMonthly ? selectedDesk.monthlyPrice : selectedDesk.weeklyPrice}
              </span>
            </div>
          )}
          {selectedChair && (
            <div className="flex justify-between items-center text-slate-300">
              <span className="truncate pr-2">• {selectedChair.name}</span>
              <span className="font-mono text-slate-200 whitespace-nowrap">
                ${isMonthly ? selectedChair.monthlyPrice : selectedChair.weeklyPrice}
              </span>
            </div>
          )}
          {selectedMonitor && (
            <div className="flex justify-between items-center text-slate-300">
              <span className="truncate pr-2">• {selectedMonitor.name}</span>
              <span className="font-mono text-slate-200 whitespace-nowrap">
                ${isMonthly ? selectedMonitor.monthlyPrice : selectedMonitor.weeklyPrice}
              </span>
            </div>
          )}
          {selectedLighting && (
            <div className="flex justify-between items-center text-slate-300">
              <span className="truncate pr-2">• {selectedLighting.name}</span>
              <span className="font-mono text-slate-200 whitespace-nowrap">
                ${isMonthly ? selectedLighting.monthlyPrice : selectedLighting.weeklyPrice}
              </span>
            </div>
          )}
          {selectedAccessories.map(acc => (
            <div key={acc.id} className="flex justify-between items-center text-slate-400 text-[11px]">
              <span className="truncate pr-2">• {acc.name}</span>
              <span className="font-mono text-slate-300 whitespace-nowrap">
                ${isMonthly ? acc.monthlyPrice : acc.weeklyPrice}
              </span>
            </div>
          ))}

          {/* Delivery fee line */}
          <div className="flex justify-between items-center text-slate-400 text-[11px] pt-1 border-t border-slate-800/60">
            <span>Next-Day Villa Delivery & Setup</span>
            <span className="font-mono text-emerald-400">
              {deliveryFee === 0 ? 'FREE' : `+$${deliveryFee}`}
            </span>
          </div>

          {/* Refundable deposit */}
          <div className="flex justify-between items-center text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Refundable Security Deposit</span>
            </span>
            <span className="font-mono text-slate-300">${totalDeposit}</span>
          </div>
        </div>
      </div>

      {/* Pricing Totals & CTA */}
      <div className="pt-4">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-xs text-slate-400 font-mono">
              {isMonthly ? 'Monthly Subscription' : 'Weekly Rental'}
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              ${recurringTotal}
              <span className="text-xs text-slate-400 font-normal ml-1">
                /{isMonthly ? 'month' : 'week'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-mono">Due at Delivery</span>
            <div className="text-sm font-bold font-mono text-slate-200">
              ${initialPayment}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleBookNow}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-glow transition"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>Reserve Custom Setup</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href={generateWhatsAppMessage()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-emerald-400 font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Instant Chat / WhatsApp Order</span>
          </a>
        </div>

        <p className="text-[10px] text-center text-slate-500 mt-2 font-mono">
          Cancel or extend anytime · 100% refundable deposit upon return
        </p>
      </div>

      {/* Booking Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#161a24] border border-emerald-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowConfirmation(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Setup Reserved!</h3>
                <p className="text-xs text-slate-400">Reservation Code: MONIS-{Math.floor(100000 + Math.random() * 900000)}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Your custom ergonomic workstation has been drafted for delivery to <strong className="text-emerald-300">{selectedZone.name}</strong>. Our logistics team will inspect and sanitize every component prior to arrival.
            </p>

            <div className="bg-slate-900/80 rounded-xl p-3 mb-4 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Duration:</span>
                <span className="text-white font-mono">{isMonthly ? 'Monthly Flexible Lease' : 'Weekly Rental'}</span>
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
                <span>Delivery Date:</span>
                <span className="text-amber-300 font-medium">{selectedZone.time}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={generateWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirm on WhatsApp</span>
              </a>
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
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
