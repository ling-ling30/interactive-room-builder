import React from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { PRESET_SETUPS } from '../../data/defaultCatalog';
import { Sun, Moon, Eye, Database } from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    products,
    config,
    updateConfig,
    applyPreset,
    activeTab,
    setActiveTab,
  } = useCatalog();

  return (
    <header className="w-full bg-[#11141c]/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Tagline */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-glow">
              <span className="font-display font-extrabold text-black text-lg">M</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-base tracking-tight text-white">
                  MONIS<span className="text-emerald-400">.RENT</span>
                </span>
                <span className="text-[10px] font-mono uppercase bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                  Workspace Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Flexible Ergonomic Workstation Rental · Bali
              </p>
            </div>
          </div>

          {/* Mobile Admin Switcher */}
          <div className="md:hidden">
            <button
              onClick={() => setActiveTab(activeTab === 'studio' ? 'admin' : 'studio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                activeTab === 'admin'
                  ? 'bg-emerald-500 text-black border-emerald-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{activeTab === 'admin' ? 'Exit CMS' : 'Admin CMS'}</span>
            </button>
          </div>
        </div>

        {/* Center / Quick Presets (Only in Studio View) */}
        {activeTab === 'studio' && (
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] font-mono text-slate-500 uppercase px-2">Presets:</span>
            {PRESET_SETUPS.map(preset => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-medium transition"
              >
                {preset.title.split(' ')[0]} {preset.title.split(' ')[1]}
              </button>
            ))}
          </div>
        )}

        {/* Right Controls: Mode Toggles & Back-Office CMS Switcher */}
        <div className="flex items-center gap-2">
          {activeTab === 'studio' && (
            <>
              {/* Day / Night Mood Toggle */}
              <button
                onClick={() => updateConfig({ isNightMode: !config.isNightMode })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                  config.isNightMode
                    ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300 shadow-sm'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                }`}
                title="Toggle Day Villa Sunlight or Night Focus Ambient"
              >
                {config.isNightMode ? (
                  <>
                    <Moon className="w-3.5 h-3.5" />
                    <span>Night Focus</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5" />
                    <span>Villa Daylight</span>
                  </>
                )}
              </button>

              {/* Posture / Ergonomics Guide Overlay */}
              <button
                onClick={() => updateConfig({ showErgonomics: !config.showErgonomics })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                  config.showErgonomics
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-glow'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="Toggle Ergonomic Sightlines & 90° Elbow Clearance"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Posture Guide</span>
              </button>
            </>
          )}

          {/* DEDICATED ADMIN CMS PORTAL SWITCHER */}
          <button
            onClick={() => setActiveTab(activeTab === 'studio' ? 'admin' : 'studio')}
            className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
              activeTab === 'admin'
                ? 'bg-emerald-500 text-black border-emerald-400 shadow-glow'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700/80'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{activeTab === 'admin' ? '← Back to Client Studio' : 'Back-Office CMS'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'admin' ? 'bg-black text-emerald-400' : 'bg-slate-800 text-slate-400'
            }`}>
              {products.length} products
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
