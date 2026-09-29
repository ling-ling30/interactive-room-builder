import React from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { Moon, CheckCircle2 } from 'lucide-react';

export const DeskVisualizer: React.FC = () => {
  const {
    config,
    selectedDesk,
    selectedChair,
    selectedMonitor,
    selectedLighting,
    selectedAccessories,
  } = useCatalog();

  const height = config.deskHeightCm; // 72 to 115
  // Calculate vertical translation: 72cm is 0px lift, 115cm is ~120px lift
  const liftPx = Math.round(((height - 72) / (115 - 72)) * 125);
  const isStanding = height >= 95;

  const isNight = config.isNightMode;
  const showErgo = config.showErgonomics;

  // Desk surface material styling
  const materialVariant = selectedDesk?.visualProps?.materialVariant || 'oak';
  const getTabletopStyle = () => {
    switch (materialVariant) {
      case 'bamboo':
        return {
          background: 'linear-gradient(180deg, #e3ba8f 0%, #c99865 60%, #ab7b4c 100%)',
          borderColor: '#936639',
          grain: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, rgba(0,0,0,0.05) 4px, transparent 8px)'
        };
      case 'walnut':
        return {
          background: 'linear-gradient(180deg, #5c4033 0%, #43281c 60%, #2f1d14 100%)',
          borderColor: '#23140c',
          grain: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(0,0,0,0.12) 6px, transparent 12px)'
        };
      case 'black':
        return {
          background: 'linear-gradient(180deg, #242730 0%, #171920 60%, #0f1015 100%)',
          borderColor: '#2e3340',
          grain: 'radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.04), transparent 70%)'
        };
      case 'oak':
      default:
        return {
          background: 'linear-gradient(180deg, #deb887 0%, #c89d66 60%, #a87943 100%)',
          borderColor: '#8f6432',
          grain: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0px, rgba(0,0,0,0.04) 5px, transparent 10px)'
        };
    }
  };

  const tabletop = getTabletopStyle();

  // Chair styling & type
  const chairVariant = selectedChair?.visualProps?.chairVariant || 'aeron';

  // Monitor variant
  const monitorVariant = selectedMonitor?.visualProps?.monitorVariant || 'dual';

  // Accessories present
  const hasKeyboard = selectedAccessories.some(a => a.visualProps?.accessoryVariant === 'keyboard_mouse');
  const hasLaptopStand = selectedAccessories.some(a => a.visualProps?.accessoryVariant === 'laptop_stand');
  const hasDeskPad = selectedAccessories.some(a => a.visualProps?.accessoryVariant === 'mat');
  const hasPlant = selectedAccessories.some(a => a.visualProps?.accessoryVariant === 'plant');

  // Lighting
  const lightVariant = selectedLighting?.visualProps?.lightVariant || 'screenbar';

  return (
    <div
      className={`relative w-full h-[520px] sm:h-[580px] lg:h-[620px] rounded-3xl overflow-hidden border transition-all duration-700 select-none ${
        isNight
          ? 'bg-gradient-to-b from-[#0a0c10] via-[#0e121a] to-[#121622] border-slate-800 shadow-2xl'
          : 'bg-gradient-to-b from-[#f5f2eb] via-[#ede7dc] to-[#dfd7c9] border-stone-300/80 shadow-xl'
      }`}
    >
      {/* Background Architectural Elements */}
      {/* Wall slats / subtle architectural framing */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: isNight
              ? 'linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)'
              : 'linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
            backgroundSize: '48px 100%'
          }}
        />
      </div>

      {/* Villa Sunlight Window Beam (Day) or Ambient Screen Glow (Night) */}
      {isNight ? (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none transition-opacity duration-1000" />
      ) : (
        <div
          className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-amber-200/40 via-orange-100/20 to-transparent rounded-full blur-[80px] pointer-events-none"
        />
      )}

      {/* Floor Horizon & Wooden Floorboards */}
      <div
        className={`absolute bottom-0 inset-x-0 h-44 sm:h-48 border-t transition-colors duration-700 ${
          isNight
            ? 'bg-gradient-to-t from-[#0d0f14] to-[#131720] border-slate-800/80'
            : 'bg-gradient-to-t from-[#cbbba6] via-[#d5c7b3] to-[#dfd5c4] border-stone-300'
        }`}
      >
        {/* Floor plank perspective lines */}
        <div
          className="w-full h-full opacity-35"
          style={{
            backgroundImage: isNight
              ? 'linear-gradient(0deg, rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)'
              : 'linear-gradient(0deg, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
            backgroundSize: '100% 18px, 64px 100%'
          }}
        />

        {/* Ambient floor shadow cast by entire workstation */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] max-w-[620px] h-10 rounded-full blur-xl transition-all duration-500 pointer-events-none"
          style={{
            background: isNight ? 'rgba(0,0,0,0.85)' : 'rgba(70,55,40,0.28)',
            transform: `translateX(-50%) scale(${1 - liftPx * 0.0015})`,
          }}
        />
      </div>

      {/* Main Studio Staging Stage */}
      <div className="absolute inset-0 flex items-end justify-center pb-12 sm:pb-14">
        <div className="relative w-full max-w-[680px] h-[480px] flex justify-center">

          {/* LAYER 1: ERGONOMIC CHAIR (Behind or under desk depending on height) */}
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 transition-all duration-500"
            style={{
              transform: `translateX(-50%) scale(${isStanding ? 0.94 : 1})`,
              filter: isNight ? 'drop-shadow(0 15px 25px rgba(0,0,0,0.8))' : 'drop-shadow(0 15px 20px rgba(0,0,0,0.2))'
            }}
          >
            {/* Chair Graphic Render */}
            {chairVariant === 'aeron' && (
              <div className="relative w-48 sm:w-56 h-72 flex flex-col items-center">
                {/* Aeron Mesh Backrest */}
                <div
                  className="w-32 h-36 rounded-t-3xl border-4 border-[#2d323e] relative flex items-center justify-center overflow-hidden"
                  style={{
                    background: 'radial-gradient(circle, #20242d 20%, #151820 100%)',
                    boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)'
                  }}
                >
                  {/* Mesh grid pattern */}
                  <div
                    className="w-full h-full opacity-40"
                    style={{
                      backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)',
                      backgroundSize: '4px 4px'
                    }}
                  />
                  {/* PostureFit SL Lumbar Spine */}
                  <div className="absolute bottom-4 w-12 h-14 border-2 border-emerald-500/60 rounded-lg bg-black/40 flex items-center justify-center">
                    <span className="text-[7px] text-emerald-400 font-mono tracking-widest uppercase">P-FIT</span>
                  </div>
                </div>

                {/* Contoured Seat Pan */}
                <div className="w-36 h-10 -mt-2 rounded-2xl bg-gradient-to-b from-[#2a2f3a] to-[#171a22] border border-[#3b4252] shadow-inner relative flex justify-between px-2 pt-1">
                  {/* 4D Armrests */}
                  <div className="w-4 h-14 -mt-10 bg-[#1e222a] border border-[#3b4252] rounded-t-md shadow-md" />
                  <div className="w-4 h-14 -mt-10 bg-[#1e222a] border border-[#3b4252] rounded-t-md shadow-md" />
                </div>

                {/* Pneumatic Cylinder */}
                <div className="w-4 h-12 bg-gradient-to-r from-neutral-600 via-neutral-400 to-neutral-700" />

                {/* 5-Star Caster Base */}
                <div className="w-44 h-8 relative flex items-center justify-center">
                  <div className="w-40 h-2 bg-[#1c1f26] rounded-full" />
                  {/* 5 wheels */}
                  <div className="absolute left-2 bottom-0 w-3 h-3 rounded-full bg-black border border-neutral-700 shadow" />
                  <div className="absolute left-1/3 bottom-0 w-3 h-3 rounded-full bg-black border border-neutral-700 shadow" />
                  <div className="absolute right-1/3 bottom-0 w-3 h-3 rounded-full bg-black border border-neutral-700 shadow" />
                  <div className="absolute right-2 bottom-0 w-3 h-3 rounded-full bg-black border border-neutral-700 shadow" />
                </div>
              </div>
            )}

            {chairVariant === 'gesture' && (
              <div className="relative w-48 sm:w-56 h-72 flex flex-col items-center">
                {/* Gesture Tall Contoured Back */}
                <div
                  className="w-34 h-40 rounded-t-2xl border-2 border-slate-700 relative flex flex-col items-center justify-center overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg, #1e2530 0%, #151a22 100%)',
                    boxShadow: 'inset 0 4px 12px rgba(255,255,255,0.05)'
                  }}
                >
                  <div className="w-24 h-24 border border-blue-400/30 rounded-full opacity-30 blur-xs" />
                  <div className="w-28 h-6 bg-[#252c38] rounded-md mt-4 border-t border-slate-600" />
                </div>

                {/* Adaptive Seat */}
                <div className="w-36 h-11 -mt-2 rounded-2xl bg-gradient-to-b from-[#2b3341] to-[#1a1f28] border border-slate-600 shadow-md relative flex justify-between px-1">
                  <div className="w-5 h-16 -mt-12 bg-[#1b2029] border border-slate-600 rounded-lg shadow-lg" />
                  <div className="w-5 h-16 -mt-12 bg-[#1b2029] border border-slate-600 rounded-lg shadow-lg" />
                </div>

                <div className="w-4 h-12 bg-gradient-to-r from-slate-500 to-slate-700" />

                <div className="w-44 h-8 relative flex items-center justify-center">
                  <div className="w-40 h-2 bg-slate-900 rounded-full border border-slate-700" />
                  <div className="absolute left-2 bottom-0 w-3 h-3 rounded-full bg-black border border-slate-700" />
                  <div className="absolute right-2 bottom-0 w-3 h-3 rounded-full bg-black border border-slate-700" />
                </div>
              </div>
            )}

            {chairVariant === 'executive' && (
              <div className="relative w-48 sm:w-56 h-76 flex flex-col items-center">
                {/* Headrest */}
                <div className="w-20 h-8 rounded-xl bg-slate-800 border border-slate-600 mb-1 shadow-sm flex items-center justify-center">
                  <span className="text-[7px] text-slate-400 uppercase font-mono">Neck Fit</span>
                </div>
                {/* Mesh Back */}
                <div className="w-32 h-34 rounded-t-2xl border border-slate-600 bg-slate-900/90 relative flex items-center justify-center">
                  <div className="w-16 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-[7px] text-emerald-300 flex items-center justify-center">LUMBAR</div>
                </div>
                {/* Seat Cushion */}
                <div className="w-36 h-10 rounded-xl bg-slate-800 border border-slate-700 relative flex justify-between px-2">
                  <div className="w-4 h-12 -mt-8 bg-slate-900 border border-slate-700 rounded-md" />
                  <div className="w-4 h-12 -mt-8 bg-slate-900 border border-slate-700 rounded-md" />
                </div>
                <div className="w-4 h-12 bg-neutral-600" />
                <div className="w-44 h-8 relative flex items-center justify-center">
                  <div className="w-40 h-2 bg-slate-900 rounded-full" />
                </div>
              </div>
            )}

            {chairVariant === 'stool' && (
              <div className="relative w-36 h-64 flex flex-col items-center justify-end pb-2">
                {/* Stool saddle cushion */}
                <div className="w-28 h-12 rounded-t-3xl bg-neutral-800 border border-neutral-600 shadow-md flex items-center justify-center text-[8px] text-neutral-400 font-mono">
                  ACTIVE PERCH
                </div>
                {/* Heavy Spring / Lift */}
                <div className="w-5 h-24 bg-gradient-to-r from-neutral-500 to-neutral-700" />
                {/* Convex Wobble Base */}
                <div className="w-32 h-6 rounded-b-full bg-neutral-900 border border-neutral-700 shadow-lg" />
              </div>
            )}
          </div>

          {/* LAYER 2: MOTORIZED DESK LEGS (Stationary Floor Mount + Telescoping Inner Columns) */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[85%] max-w-[560px] h-44 z-15 pointer-events-none flex justify-between px-4 sm:px-8">
            {/* Left Leg */}
            <div className="relative w-8 flex flex-col items-center justify-end h-full">
              {/* Outer stationary column */}
              <div
                className="w-7 h-28 rounded-t border shadow-md relative overflow-hidden"
                style={{
                  background: selectedDesk?.visualProps?.frameColor || '#1c1f26',
                  borderColor: isNight ? '#2a3140' : '#475569'
                }}
              >
                {/* Telescoping inner column extending upwards */}
                <div
                  className="w-5 mx-auto bg-gradient-to-r from-neutral-400 via-neutral-200 to-neutral-400 rounded-t transition-all duration-300"
                  style={{
                    height: `${Math.min(95, 20 + liftPx * 0.7)}px`,
                    transform: `translateY(-${liftPx * 0.7}px)`
                  }}
                />
              </div>
              {/* Floor T-Foot */}
              <div
                className="w-24 h-3 rounded-full border shadow"
                style={{
                  background: selectedDesk?.visualProps?.frameColor || '#1c1f26',
                  borderColor: isNight ? '#2a3140' : '#475569'
                }}
              />
            </div>

            {/* Right Leg */}
            <div className="relative w-8 flex flex-col items-center justify-end h-full">
              <div
                className="w-7 h-28 rounded-t border shadow-md relative overflow-hidden"
                style={{
                  background: selectedDesk?.visualProps?.frameColor || '#1c1f26',
                  borderColor: isNight ? '#2a3140' : '#475569'
                }}
              >
                <div
                  className="w-5 mx-auto bg-gradient-to-r from-neutral-400 via-neutral-200 to-neutral-400 rounded-t transition-all duration-300"
                  style={{
                    height: `${Math.min(95, 20 + liftPx * 0.7)}px`,
                    transform: `translateY(-${liftPx * 0.7}px)`
                  }}
                />
              </div>
              <div
                className="w-24 h-3 rounded-full border shadow"
                style={{
                  background: selectedDesk?.visualProps?.frameColor || '#1c1f26',
                  borderColor: isNight ? '#2a3140' : '#475569'
                }}
              />
            </div>
          </div>

          {/* LAYER 3: ELEVATING WORKSTATION GROUP (Tabletop + Monitors + Gear + ScreenBar) */}
          <div
            className="absolute bottom-28 left-1/2 -translate-x-1/2 w-full max-w-[620px] z-20 transition-all duration-300 ease-out flex flex-col items-center"
            style={{
              transform: `translateX(-50%) translateY(-${liftPx}px)`
            }}
          >

            {/* A. MOUNTED GEAR STACK (Sitting on Desk Surface) */}
            <div className="relative w-full flex justify-center items-end px-2 sm:px-6">

              {/* TROPICAL BIOPHILIC PLANT (Left Edge) */}
              {hasPlant && (
                <div className="absolute left-4 sm:left-8 bottom-3 z-25 flex flex-col items-center animate-fade-in">
                  {/* Leaves */}
                  <div className="relative w-20 h-24 -mb-2">
                    <div className="absolute left-1 top-2 w-10 h-14 bg-emerald-700 rounded-full rotate-[-25deg] shadow-sm border border-emerald-900/40" />
                    <div className="absolute right-0 top-0 w-12 h-16 bg-emerald-600 rounded-full rotate-[30deg] shadow-sm border border-emerald-800/40" />
                    <div className="absolute left-4 top-1 w-11 h-16 bg-emerald-500 rounded-full rotate-[5deg] shadow-md border border-emerald-700/40" />
                  </div>
                  {/* Terracotta Pot */}
                  <div className="w-12 h-14 bg-gradient-to-b from-[#c86d51] to-[#a35137] rounded-b-xl border-t-2 border-[#e08367] shadow-md flex items-center justify-center">
                    <span className="text-[6px] text-amber-100 font-mono tracking-wider opacity-60">BALI</span>
                  </div>
                </div>
              )}

              {/* ARCHITECTURAL ANGLE LAMP (Left Side if active) */}
              {lightVariant === 'lamp' && (
                <div className="absolute left-16 sm:left-24 bottom-3 z-30 flex flex-col items-center">
                  {/* Articulated Cantilever Arm */}
                  <div className="w-1.5 h-36 bg-amber-400 rotate-[18deg] origin-bottom rounded shadow" />
                  <div className="w-1.5 h-28 bg-amber-400 -rotate-[35deg] origin-top rounded -mt-2 shadow" />
                  {/* Lamp Cone Shade */}
                  <div className="w-12 h-8 bg-neutral-900 rounded-t-full border border-neutral-700 rotate-[45deg] -mt-4 shadow-lg flex items-center justify-center">
                    {/* Light Emission */}
                    <div className="w-8 h-8 rounded-full bg-amber-300 blur-xs" />
                  </div>
                  {/* Night Mode Lamp Light Cone */}
                  {isNight && (
                    <div className="absolute -top-10 -left-10 w-44 h-48 bg-amber-400/20 blur-2xl rounded-full pointer-events-none" />
                  )}
                  {/* Clamp Base */}
                  <div className="w-6 h-5 bg-neutral-900 rounded-sm border border-neutral-700" />
                </div>
              )}

              {/* CENTER DISPLAY STACK (Primary / Dual / Ultrawide) */}
              <div className="relative flex flex-col items-center z-22 mb-1">

                {/* BENQ SCREENBAR HALO (Mounted on Primary Monitor) */}
                {lightVariant === 'screenbar' && (
                  <div className="relative -mb-1 z-35 flex flex-col items-center">
                    {/* The ScreenBar Chassis */}
                    <div className="w-48 sm:w-64 h-2.5 rounded-full bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 border border-neutral-600 shadow-md flex items-center justify-center relative">
                      {/* Under-glow emitter lens */}
                      <div
                        className={`w-3/4 h-1 rounded-full transition-all duration-500 ${
                          isNight ? 'bg-amber-100 shadow-[0_0_12px_#fde68a]' : 'bg-neutral-300 opacity-60'
                        }`}
                      />
                    </div>
                    {/* Rear Counterweight Clamp */}
                    <div className="w-5 h-4 bg-neutral-900 rounded-b-md border border-neutral-700 shadow" />

                    {/* DOWNWARD ASYMMETRICAL TASK LIGHT CONE (Realistic Night Beam) */}
                    {isNight && (
                      <div
                        className="absolute top-2 left-1/2 -translate-x-1/2 w-80 sm:w-96 h-40 pointer-events-none transition-opacity duration-700"
                        style={{
                          background: 'radial-gradient(ellipse at 50% 0%, rgba(254, 240, 138, 0.45) 0%, rgba(253, 224, 71, 0.15) 50%, transparent 80%)',
                          clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
                        }}
                      />
                    )}
                  </div>
                )}

                {/* MONITOR SETUP CONFIGURATION */}
                {/* 1. DUAL 27" DISPLAYS ON GAS ARMS */}
                {monitorVariant === 'dual' && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Left Screen (angled 8 deg) */}
                    <div
                      className="w-48 sm:w-56 h-32 sm:h-36 rounded-lg bg-neutral-950 border-2 border-neutral-700 shadow-2xl p-1 relative flex flex-col overflow-hidden transition-transform duration-300"
                      style={{ transform: 'perspective(600px) rotateY(6deg)' }}
                    >
                      {/* Screen Content: Pro Code Editor */}
                      <div className="w-full h-full bg-[#181a20] rounded border border-neutral-800/80 p-2 font-mono text-[6px] sm:text-[7px] text-slate-300 overflow-hidden leading-tight">
                        <div className="flex items-center gap-1 mb-1 pb-1 border-b border-neutral-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[6px] text-slate-400 ml-1">App.tsx — 4K Pro</span>
                        </div>
                        <p className="text-emerald-400 font-semibold">// Monis Ergonomic Station</p>
                        <p className="text-blue-400">const <span className="text-purple-300">deskHeight</span> = <span className="text-amber-300">{height}</span>;</p>
                        <p className="text-slate-400">export default function Setup() &#123;</p>
                        <p className="text-slate-500 pl-2">return &lt;ErgoStudio mode=&quot;{isStanding ? 'Standing' : 'Sitting'}&quot; /&gt;;</p>
                        <p className="text-slate-400">&#125;</p>
                      </div>
                      {/* Thin bezel brand dot */}
                      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neutral-600" />
                    </div>

                    {/* Right Screen (angled -8 deg) */}
                    <div
                      className="w-48 sm:w-56 h-32 sm:h-36 rounded-lg bg-neutral-950 border-2 border-neutral-700 shadow-2xl p-1 relative flex flex-col overflow-hidden transition-transform duration-300"
                      style={{ transform: 'perspective(600px) rotateY(-6deg)' }}
                    >
                      {/* Screen Content: Analytics & Design System */}
                      <div className="w-full h-full bg-[#151922] rounded border border-neutral-800/80 p-2 flex flex-col justify-between overflow-hidden">
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-1">
                          <span className="text-[7px] font-bold text-emerald-400 font-mono">DASHBOARD</span>
                          <span className="text-[6px] text-slate-400">99.8% Uptime</span>
                        </div>
                        <div className="space-y-1 my-1">
                          <div className="h-1.5 w-4/5 bg-emerald-500/30 rounded" />
                          <div className="h-1.5 w-3/5 bg-blue-500/30 rounded" />
                          <div className="h-1.5 w-full bg-purple-500/30 rounded" />
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-6 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[7px] font-bold text-emerald-300">
                            {height}
                          </div>
                          <span className="text-[6px] text-slate-400">cm motorized</span>
                        </div>
                      </div>
                      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neutral-600" />
                    </div>
                  </div>
                )}

                {/* 2. 34" CURVED ULTRAWIDE */}
                {monitorVariant === 'ultrawide' && (
                  <div
                    className="w-80 sm:w-96 h-32 sm:h-36 rounded-xl bg-neutral-950 border-2 border-neutral-700 shadow-2xl p-1.5 relative flex flex-col overflow-hidden"
                    style={{
                      boxShadow: isNight
                        ? '0 0 35px rgba(56, 189, 248, 0.25), 0 20px 40px rgba(0,0,0,0.8)'
                        : '0 20px 40px rgba(0,0,0,0.3)',
                    }}
                  >
                    {/* Curved simulation frame highlight */}
                    <div className="w-full h-full bg-gradient-to-r from-[#111622] via-[#1a2332] to-[#111622] rounded-lg border border-neutral-800 p-2 flex items-center justify-between overflow-hidden">
                      {/* Left: Code */}
                      <div className="w-1/3 h-full border-r border-slate-800/80 pr-1 text-[6px] font-mono text-emerald-400 leading-tight">
                        <p className="text-white font-bold">21:9 WQHD</p>
                        <p className="text-slate-400 mt-1">3440 x 1440</p>
                        <p className="text-blue-400">144Hz Smooth</p>
                        <p className="text-amber-400">1000R Curve</p>
                      </div>
                      {/* Center: Video timeline */}
                      <div className="w-2/3 h-full pl-2 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-[7px] text-slate-400">
                          <span>Timeline 00:04:12</span>
                          <span className="text-emerald-400 font-mono">4K HDR</span>
                        </div>
                        <div className="h-7 w-full bg-neutral-900 rounded border border-neutral-800 flex items-center px-1 gap-1">
                          <div className="h-5 flex-1 bg-blue-600/40 rounded border border-blue-400/50" />
                          <div className="h-5 flex-1 bg-emerald-600/40 rounded border border-emerald-400/50" />
                          <div className="h-5 w-8 bg-amber-600/40 rounded border border-amber-400/50" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SINGLE 27" 4K DISPLAY */}
                {monitorVariant === 'single' && (
                  <div className="w-64 sm:w-72 h-36 sm:h-40 rounded-xl bg-neutral-950 border-2 border-neutral-700 shadow-2xl p-1.5 relative flex flex-col overflow-hidden">
                    <div className="w-full h-full bg-[#161a23] rounded-lg border border-neutral-800 p-2 flex flex-col justify-between overflow-hidden">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-1">
                        <span className="text-[7px] font-bold text-white font-mono">STUDIO 4K UHD</span>
                        <span className="text-[6px] text-emerald-400">98% DCI-P3</span>
                      </div>
                      <div className="flex items-center justify-center py-2">
                        <div className="text-center">
                          <div className="text-[10px] font-bold text-slate-100 font-display">Monis Ergonomics</div>
                          <div className="text-[7px] text-slate-400">Next-Day Bali Delivery</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[6px] text-slate-400">
                        <span>Height: {height} cm</span>
                        <span className="text-emerald-400">Status: In Stock</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gas Spring Desktop Monitor Arm Pole */}
                <div className="w-6 h-12 bg-gradient-to-r from-neutral-700 via-neutral-500 to-neutral-800 rounded-t shadow-md" />
                <div className="w-14 h-3 bg-neutral-900 rounded-t-md border-t border-neutral-600 shadow" />
              </div>

              {/* LAPTOP ON RISER (Right Side if active) */}
              {hasLaptopStand && (
                <div className="absolute right-4 sm:right-10 bottom-3 z-25 flex flex-col items-center animate-fade-in">
                  {/* Laptop Display (MacBook Pro styling) */}
                  <div className="w-24 sm:w-28 h-18 bg-neutral-900 rounded-t-lg border border-neutral-700 p-1 shadow-lg flex flex-col justify-between">
                    <div className="w-full h-full bg-[#12151c] rounded flex flex-col items-center justify-center p-1">
                      <span className="text-[6px] font-bold text-slate-300">MacBook Pro</span>
                      <span className="text-[5px] text-emerald-400">Sidecar Active</span>
                    </div>
                  </div>
                  {/* Laptop Lower Chassis */}
                  <div className="w-26 sm:w-30 h-1.5 bg-neutral-400 rounded-b shadow" />
                  {/* Aluminum Angled Stand Riser */}
                  <div className="w-14 h-6 border-l-2 border-r-2 border-neutral-400 skew-x-12 mt-0.5" />
                  <div className="w-16 h-1.5 bg-neutral-400 rounded-full" />
                </div>
              )}
            </div>

            {/* B. DESK SURFACE ACCESSORIES (Mat, Keyboard & Mouse) */}
            <div className="relative w-full max-w-[580px] flex justify-center -mb-2 z-28 px-4">
              {/* Merino Wool Felt Desk Pad */}
              {hasDeskPad && (
                <div
                  className="w-4/5 sm:w-3/4 h-8 rounded-lg border shadow-inner relative flex items-center justify-center transition-all duration-300"
                  style={{
                    background: 'linear-gradient(180deg, #2a2d36 0%, #1c1e24 100%)',
                    borderColor: '#3e4452'
                  }}
                >
                  <div className="absolute left-3 top-1 text-[5px] text-slate-400 font-mono tracking-wider">MERINO WOOL FELT</div>
                </div>
              )}

              {/* Keychron Mechanical Keyboard & MX Master Mouse */}
              {hasKeyboard && (
                <div className="absolute inset-0 flex items-center justify-center gap-3 z-30">
                  {/* Keychron Low Profile Keyboard */}
                  <div className="w-32 sm:w-36 h-6 rounded bg-neutral-900 border border-neutral-700 shadow-md flex items-center justify-center px-1 gap-0.5">
                    {/* Key row accents */}
                    <div className="w-2 h-4 rounded-xs bg-orange-600" />
                    <div className="flex-1 h-4 rounded-xs bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                      <span className="text-[5px] text-neutral-400 font-mono">KEYCHRON 75%</span>
                    </div>
                  </div>
                  {/* Logitech MX Master 3S Mouse */}
                  <div className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-600 shadow-md flex items-center justify-center">
                    <div className="w-1 h-3 rounded-full bg-amber-400/80" />
                  </div>
                </div>
              )}
            </div>

            {/* C. SOLID TABLETOP SURFACE */}
            <div
              className="w-full h-8 sm:h-9 rounded-2xl border-b-4 shadow-desk relative flex items-center justify-between px-6 z-25 overflow-hidden transition-all duration-500"
              style={{
                background: tabletop.background,
                borderColor: tabletop.borderColor,
              }}
            >
              {/* Natural woodgrain overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{ backgroundImage: tabletop.grain }}
              />

              {/* Left desk edge: Monis Pro subtle engraving */}
              <div className="relative z-10 flex items-center gap-1.5 opacity-70">
                <div className="w-2 h-2 rounded-full bg-black/40" />
                <span className="text-[9px] font-bold tracking-wider text-black/60 uppercase font-mono">
                  {selectedDesk?.name.slice(0, 16)}
                </span>
              </div>

              {/* Right desk edge: Smart Motorized Height Control Panel */}
              <div className="relative z-10 flex items-center gap-2 bg-black/80 px-2.5 py-1 rounded-md border border-white/20 shadow-md">
                {/* Glowing LED Height Readout */}
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider">
                    {height.toFixed(1)} cm
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-[7px] text-neutral-400 font-mono border-l border-neutral-700 pl-1.5">
                  <span>M1</span>
                  <span>M2</span>
                </div>
              </div>
            </div>

          </div>

          {/* LAYER 4: ERGONOMIC POSTURE & ANGLE OVERLAYS (Toggleable) */}
          {showErgo && (
            <div className="absolute inset-0 pointer-events-none z-40 flex justify-center items-center">
              {/* Eye-level horizontal sightline */}
              <div
                className="absolute w-full border-t-2 border-dashed border-emerald-400/70 transition-all duration-300"
                style={{
                  top: `${Math.max(60, 140 - liftPx * 0.4)}px`
                }}
              >
                <div className="absolute right-4 -top-3 bg-emerald-500 text-black font-mono font-bold text-[9px] px-2 py-0.5 rounded shadow">
                  Optimal Eye Level (Top 1/3 Screen)
                </div>
              </div>

              {/* 90° Elbow Clearance Guide */}
              <div
                className="absolute w-3/4 border-t-2 border-dashed border-blue-400/70 transition-all duration-300"
                style={{
                  bottom: `${Math.max(100, 135 + liftPx * 0.95)}px`
                }}
              >
                <div className="absolute left-4 -top-3 bg-blue-500 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded shadow">
                  90° Elbow Rest Plane ({height} cm)
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Floating Status Badges inside Canvas */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border text-xs font-medium transition-colors ${
            isNight
              ? 'bg-slate-900/80 border-slate-700 text-slate-200'
              : 'bg-white/80 border-stone-300 text-stone-800'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isStanding ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          <span>{isStanding ? 'Standing Mode (Active)' : 'Sitting Mode (Ergonomic)'}</span>
          <span className="font-mono text-emerald-400 font-bold ml-1">{height} cm</span>
        </div>

        {isNight && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-amber-300 text-xs backdrop-blur-md">
            <Moon className="w-3.5 h-3.5" />
            <span>Night Focus Mode</span>
          </div>
        )}
      </div>

      {/* Lighting Quality & Bali Setup Badge */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        <div
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border text-xs font-mono ${
            isNight
              ? 'bg-slate-900/80 border-slate-700 text-emerald-400'
              : 'bg-white/80 border-stone-300 text-emerald-700'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Real Studio Photography Scale</span>
        </div>
      </div>
    </div>
  );
};
