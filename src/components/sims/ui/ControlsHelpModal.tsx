import React, { useRef } from 'react';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { X, Keyboard } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface ControlsHelpModalProps {
  onClose: () => void;
}

interface ControlRow {
  keys: string[];
  action: string;
}

interface ControlGroup {
  title: string;
  rows: ControlRow[];
}

const CONTROL_GROUPS: ControlGroup[] = [
  {
    title: 'Camera (Orbit view)',
    rows: [
      { keys: ['Drag'], action: 'Orbit around the room' },
      { keys: ['Ctrl', 'Drag'], action: 'Pan the camera' },
      { keys: ['Space', 'Drag'], action: 'Pan the camera (also right / middle drag)' },
      { keys: ['H'], action: 'Toggle pan mode' },
      { keys: ['Scroll'], action: 'Zoom in / out' },
      { keys: ['Shift', 'Scroll'], action: 'Pan sideways' },
      { keys: ['Q', 'E'], action: 'Step the camera angle left / right' },
    ],
  },
  {
    title: 'Furniture',
    rows: [
      { keys: ['Click'], action: 'Select furniture' },
      { keys: ['Shift', 'Click'], action: 'Add to / remove from selection' },
      { keys: ['Drag'], action: 'Pick up and move furniture' },
      { keys: ['M'], action: 'Move the selection' },
      { keys: ['R'], action: 'Rotate 5° (Shift+R rotates back)' },
      { keys: ['Numpad 1–9'], action: 'Snap rotation to a compass direction' },
      { keys: ['Ctrl', 'D'], action: 'Duplicate the selection (or press +)' },
      { keys: ['G'], action: 'Cycle the snap step' },
      { keys: ['Del'], action: 'Delete the selection' },
      { keys: ['Esc'], action: 'Cancel placement / clear selection' },
    ],
  },
  {
    title: 'Walk mode',
    rows: [
      { keys: ['W', 'A', 'S', 'D'], action: 'Walk (arrow keys work too) — furniture is walk-through' },
      { keys: ['Mouse'], action: 'Look around (no dragging needed); the dot is your crosshair' },
      { keys: ['Aim'], action: 'Aim at furniture to see its name and price' },
      { keys: ['E'], action: 'Swap the furniture under the crosshair' },
      { keys: ['R'], action: 'Pick up the furniture under the crosshair; it follows the crosshair' },
      { keys: ['Click'], action: 'Place the carried item (or press R again)' },
      { keys: ['Scroll'], action: 'Rotate the carried item' },
      { keys: ['F'], action: 'Free cursor (select / drag furniture); press again to look' },
      { keys: ['Esc'], action: 'Cancel a carry, or release the mouse; press again to leave walk mode' },
    ],
  },
];

const Key: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="px-1.5 py-0.5 rounded-md border border-[#d9ccaf] bg-white text-[10px] font-mono font-bold text-slate-700 shadow-2xs whitespace-nowrap">
    {children}
  </kbd>
);

/** Popup listing every mouse / keyboard control of the studio. Open with the Controls button or "?". */
export const ControlsHelpModal: React.FC<ControlsHelpModalProps> = ({ onClose }) => {
  useEscapeKey(true, onClose);
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, true);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        data-hud="true"
        role="dialog"
        aria-modal="true"
        aria-label="Studio controls"
        tabIndex={-1}
        className="outline-none w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#faf6ec] border border-[#e2d7bd] shadow-2xl p-5 sm:p-6 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#e2d7bd]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Studio Controls</h3>
              <p className="text-[11px] text-slate-500">Press <Key>?</Key> any time to reopen this</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="apple-press p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-[#ece2c9] transition cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 pt-4">
          {CONTROL_GROUPS.map((group) => (
            <section key={group.title} className={group.title === 'Walk mode' ? 'md:col-span-2' : ''}>
              <h4 className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-500 mb-2">
                {group.title}
              </h4>
              <ul className="space-y-1.5">
                {group.rows.map((row, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs">
                    <span className="flex items-center gap-1 flex-wrap shrink-0 w-36">
                      {row.keys.map((k, j) => (
                        <React.Fragment key={j}>
                          {j > 0 && <span className="text-slate-400 text-[10px]">+</span>}
                          <Key>{k}</Key>
                        </React.Fragment>
                      ))}
                    </span>
                    <span className="text-slate-700 leading-snug">{row.action}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-4 pt-3 border-t border-[#e2d7bd] text-[11px] text-slate-500 leading-relaxed">
          Items placed near a wall stay where you put them — the magnetic desk-centre snap only kicks in away from the walls.
        </p>
      </div>
    </div>
  );
};
