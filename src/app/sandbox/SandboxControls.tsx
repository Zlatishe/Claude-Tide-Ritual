'use client';

import { useSandboxStore, type SandboxScene } from '@/stores/sandbox-store';
import { useBeachStore } from '@/stores/beach-store';
import { useJarStore } from '@/stores/jar-store';

const SCENES: { value: SandboxScene; label: string }[] = [
  { value: 'beach', label: 'Beach' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'signin', label: 'Sign-in' },
];

// FIX-03 §4 — Tide-release wave experiments. Each toggle isolates one
// perceptual primitive applied to the wash-away tide animation (not the
// ambient home-page waves). Trigger the wash via "Trigger tide release"
// to A/B compare.
const TIDE_EXPERIMENTS: {
  key:
    | 'tideHarmonicCrests'
    | 'tideLateralSwell'
    | 'tideCrestMorphing'
    | 'tideFoamStreaks'
    | 'tidePeakBobbing';
  label: string;
  note: string;
}[] = [
  { key: 'tideHarmonicCrests',  label: 'Tide: harmonic crests',  note: '§4a — sine crests + high-freq ripple' },
  { key: 'tideLateralSwell',    label: 'Tide: lateral swell',    note: '§4c — mid layer sweeps in from side' },
  { key: 'tideCrestMorphing',   label: 'Tide: crest morphing',   note: '§4d — needs harmonic; crests shift positions' },
  { key: 'tideFoamStreaks',     label: 'Tide: foam streaks',     note: '§4e — foam lines drift during peak' },
  { key: 'tidePeakBobbing',     label: 'Tide: peak bobbing',     note: '§4f — micro-motion at moment of stillness' },
];

const TIDE_EASING_OPTIONS: { key: import('@/stores/sandbox-store').TideEasing; label: string }[] = [
  { key: 'out',    label: 'out'    },
  { key: 'linear', label: 'linear' },
  { key: 'inOut',  label: 'in/out' },
  { key: 'back',   label: 'back'   },
  { key: 'expo',   label: 'expo'   },
  { key: 'spring', label: 'spring' },
];

const TIDE_LAYERS = [
  { num: 1, label: 'Layer 1 (navy body)',     easeKey: 'tideLayer1Ease',     delayKey: 'tideLayer1Delay',     durKey: 'tideLayer1Duration' },
  { num: 2, label: 'Layer 2 (mid purple)',    easeKey: 'tideLayer2Ease',     delayKey: 'tideLayer2Delay',     durKey: 'tideLayer2Duration' },
  { num: 3, label: 'Layer 3 (lavender wash)', easeKey: 'tideLayer3Ease',     delayKey: 'tideLayer3Delay',     durKey: 'tideLayer3Duration' },
] as const;

export function SandboxControls() {
  const s = useSandboxStore();
  const shells = useBeachStore((st) => st.shells);
  const totalShells = shells.length;
  const currentInscribed = shells.filter((sh) => sh.isInscribed).length;
  const stoneCount = useJarStore((st) => st.stoneCount);
  const openJar = useJarStore((st) => st.openJar);
  const startTideRelease = useBeachStore((st) => st.startTideRelease);
  const openInscription = useBeachStore((st) => st.openInscription);

  if (!s.controlsOpen) {
    return (
      <button
        onClick={() => s.set('controlsOpen', true)}
        className={`fixed top-4 ${s.controlsSide === 'right' ? 'right-4' : 'left-4'} z-[60] px-3 py-2 rounded-md text-xs font-semibold shadow-lg cursor-pointer`}
        style={{
          backgroundColor: 'rgba(49,62,136,0.95)',
          color: 'white',
          backdropFilter: 'blur(8px)',
        }}
      >
        ☰ Sandbox
      </button>
    );
  }

  return (
    <aside
      data-sandbox-controls
      className={`fixed top-4 ${s.controlsSide === 'right' ? 'right-4' : 'left-4'} z-[60] w-[300px] max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg shadow-2xl text-[13px]`}
      style={{
        backgroundColor: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(49,62,136,0.15)',
        color: '#313E88',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 sticky top-0"
        style={{ backgroundColor: 'rgba(49,62,136,0.95)', color: 'white' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider">SANDBOX</span>
          <span className="text-[10px] opacity-70">no persistence</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => s.set('controlsSide', s.controlsSide === 'right' ? 'left' : 'right')}
            className="text-xs px-2 py-1 rounded hover:bg-white/10 cursor-pointer"
            aria-label="Switch side"
            title="Switch side"
          >
            ⇆
          </button>
          <button
            onClick={() => s.set('controlsOpen', false)}
            className="text-xs px-2 py-1 rounded hover:bg-white/10 cursor-pointer"
            aria-label="Hide controls"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-4">
        {/* Scene */}
        <Section title="Scene">
          <div className="grid grid-cols-3 gap-1">
            {SCENES.map((sc) => (
              <button
                key={sc.value}
                onClick={() => s.set('scene', sc.value)}
                className="px-2 py-2 rounded text-xs font-medium cursor-pointer"
                style={{
                  backgroundColor: s.scene === sc.value ? '#313E88' : 'rgba(49,62,136,0.08)',
                  color: s.scene === sc.value ? 'white' : '#313E88',
                }}
              >
                {sc.label}
              </button>
            ))}
          </div>

          {s.scene === 'onboarding' && (
            <div className="mt-3">
              <Label>Step (0–3)</Label>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => s.set('onboardingStep', n)}
                    className="flex-1 py-2 rounded text-xs font-medium cursor-pointer"
                    style={{
                      backgroundColor: s.onboardingStep === n ? '#E49C75' : 'rgba(49,62,136,0.08)',
                      color: s.onboardingStep === n ? '#292E64' : '#313E88',
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-[10px] mt-1 opacity-60">
                0/2 = beach + copy. 1/3 = wave sweep transition.
              </p>
            </div>
          )}
        </Section>

        {s.scene === 'beach' && (
          <>
            {/* Beach state */}
            <Section title="Beach state">
              <Label>
                Inscribed shells: <strong>{currentInscribed}</strong>
                <span className="opacity-60"> / {totalShells || '—'}</span>
              </Label>
              <input
                type="range"
                min={0}
                max={Math.max(totalShells, 5)}
                value={s.inscribedShellCount}
                onChange={(e) => s.set('inscribedShellCount', Number(e.target.value))}
                className="w-full"
              />

              <Label>
                Jar stones: <strong>{stoneCount}</strong>
              </Label>
              <input
                type="range"
                min={0}
                max={40}
                value={s.jarStoneCount}
                onChange={(e) => s.set('jarStoneCount', Number(e.target.value))}
                className="w-full"
              />
              <div className="flex gap-1 mt-1">
                {[0, 1, 5, 12, 30].map((n) => (
                  <button
                    key={n}
                    onClick={() => s.set('jarStoneCount', n)}
                    className="flex-1 py-1 rounded text-[11px] cursor-pointer"
                    style={{ backgroundColor: 'rgba(49,62,136,0.08)' }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </Section>

            {/* Actions */}
            <Section title="Actions">
              <button
                onClick={() => openJar()}
                className="w-full py-2 rounded text-xs font-medium cursor-pointer mb-2"
                style={{ backgroundColor: '#C9D1FF', color: '#313E88' }}
              >
                Open Jar modal
              </button>
              <button
                onClick={() => {
                  const first = shells[0];
                  if (first) openInscription(first.id);
                }}
                className="w-full py-2 rounded text-xs font-medium cursor-pointer mb-2"
                style={{ backgroundColor: '#C9D1FF', color: '#313E88' }}
              >
                Open Inscription modal
              </button>
              <button
                onClick={() => startTideRelease()}
                className="w-full py-2 rounded text-xs font-medium cursor-pointer"
                style={{ backgroundColor: '#E49C75', color: '#292E64' }}
              >
                Trigger tide release
              </button>
            </Section>
          </>
        )}

        {/* Display */}
        <Section title="Display">
          <Toggle
            label="Force reduced motion"
            checked={s.forceReducedMotion}
            onChange={(v) => s.set('forceReducedMotion', v)}
          />
          <Toggle
            label="Hide UI chrome"
            note="Hides header / CTA / toasts"
            checked={s.hideUIChrome}
            onChange={(v) => s.set('hideUIChrome', v)}
          />
        </Section>

        {/* FIX-03 §4 (refined) — Per-layer rise easing for the tide release.
            Each layer can use a different easing curve, delay, and duration.
            Defaults match prod behavior (uniform ease-out, staggered delays);
            adjusting any control deviates from prod. Trigger the tide release
            from the Actions section to A/B test. */}
        <Section title="Tide layer easing">
          {TIDE_LAYERS.map((layer) => {
            const currentEase = s[layer.easeKey] as import('@/stores/sandbox-store').TideEasing;
            const isSpring = currentEase === 'spring';
            return (
              <div key={layer.num} className="mb-4 pb-4" style={{ borderBottom: '1px solid rgba(49,62,136,0.1)' }}>
                <Label><strong>{layer.label}</strong></Label>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  {TIDE_EASING_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => s.set(layer.easeKey, opt.key)}
                      className="py-1 rounded text-[10px] font-medium cursor-pointer"
                      style={{
                        backgroundColor: currentEase === opt.key ? '#313E88' : 'rgba(49,62,136,0.08)',
                        color: currentEase === opt.key ? 'white' : '#313E88',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <Label>
                  Delay: <strong>{s[layer.delayKey]}ms</strong>
                </Label>
                <input
                  type="range"
                  min={0}
                  max={2000}
                  step={50}
                  value={s[layer.delayKey]}
                  onChange={(e) => s.set(layer.delayKey, Number(e.target.value))}
                  className="w-full"
                />
                {!isSpring && (
                  <>
                    <Label>
                      Duration: <strong>{s[layer.durKey]}ms</strong>
                    </Label>
                    <input
                      type="range"
                      min={1000}
                      max={6000}
                      step={100}
                      value={s[layer.durKey]}
                      onChange={(e) => s.set(layer.durKey, Number(e.target.value))}
                      className="w-full"
                    />
                  </>
                )}
              </div>
            );
          })}

          {/* Spring physics params — only relevant when any layer uses 'spring' */}
          {(s.tideLayer1Ease === 'spring' || s.tideLayer2Ease === 'spring' || s.tideLayer3Ease === 'spring') && (
            <div>
              <Label><strong>Spring physics (any spring layer)</strong></Label>
              <Label>
                Stiffness: <strong>{s.tideSpringStiffness}</strong>
                <span className="opacity-60"> (lower = slower)</span>
              </Label>
              <input
                type="range"
                min={20}
                max={200}
                step={5}
                value={s.tideSpringStiffness}
                onChange={(e) => s.set('tideSpringStiffness', Number(e.target.value))}
                className="w-full"
              />
              <Label>
                Damping: <strong>{s.tideSpringDamping}</strong>
                <span className="opacity-60"> (higher = less bounce)</span>
              </Label>
              <input
                type="range"
                min={1}
                max={40}
                step={1}
                value={s.tideSpringDamping}
                onChange={(e) => s.set('tideSpringDamping', Number(e.target.value))}
                className="w-full"
              />
              <Label>
                Mass: <strong>{s.tideSpringMass.toFixed(1)}</strong>
                <span className="opacity-60"> (higher = slower, more inertia)</span>
              </Label>
              <input
                type="range"
                min={0.5}
                max={4}
                step={0.1}
                value={s.tideSpringMass}
                onChange={(e) => s.set('tideSpringMass', Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </Section>

        {/* FIX-03 §4 — Other tide-release wave experiments (independent of easing) */}
        <Section title="Tide-release experiments">
          {TIDE_EXPERIMENTS.map((exp) => (
            <Toggle
              key={exp.key}
              label={exp.label}
              note={exp.note}
              checked={s[exp.key]}
              onChange={(v) => s.set(exp.key, v)}
            />
          ))}
        </Section>

        {/* Reset */}
        <button
          onClick={() => {
            s.reset();
          }}
          className="w-full py-2 rounded text-xs font-medium cursor-pointer"
          style={{
            backgroundColor: 'rgba(49,62,136,0.08)',
            color: '#313E88',
          }}
        >
          Reset sandbox
        </button>
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[10px] font-bold tracking-wider opacity-70 mb-2 uppercase">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] mb-1 opacity-80">{children}</div>;
}

function Toggle({
  label,
  note,
  checked,
  onChange,
}: {
  label: string;
  note?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 cursor-pointer select-none py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 cursor-pointer"
      />
      <span className="flex-1">
        <span className="text-[12px]">{label}</span>
        {note && <span className="block text-[10px] opacity-60">{note}</span>}
      </span>
    </label>
  );
}
