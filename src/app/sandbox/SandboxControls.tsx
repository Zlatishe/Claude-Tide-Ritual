'use client';

import { useSandboxStore, type SandboxScene } from '@/stores/sandbox-store';
import { useBeachStore } from '@/stores/beach-store';
import { useJarStore } from '@/stores/jar-store';

const SCENES: { value: SandboxScene; label: string }[] = [
  { value: 'beach', label: 'Beach' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'signin', label: 'Sign-in' },
];

const EXPERIMENTS: {
  key:
    | 'useTypographyTokens'
    | 'balancedJarCopy'
    | 'organicWaveMotion'
    | 'unifiedShellModuleType'
    | 'refinedJarBalance'
    | 'wavePathMorphing'
    | 'waveSecondaryHarmonic'
    | 'waveAmplitudeBreathing'
    | 'waveFoamStreaks';
  label: string;
  note: string;
  wired: boolean;
}[] = [
  { key: 'useTypographyTokens', label: 'Typography tokens', note: 'FIX-01 §1 — Header, SignInScreen, JarModal', wired: true },
  { key: 'balancedJarCopy', label: 'Balanced JarModal couplet', note: 'FIX-01 §2 — open Jar with stones to see', wired: true },
  { key: 'unifiedShellModuleType', label: 'Shell module type', note: 'FIX-01 §5 — open Inscription modal', wired: true },
  { key: 'refinedJarBalance', label: 'Jar type balance', note: 'FIX-02 §3 — t-hero count + t-h2 heading', wired: true },
  { key: 'organicWaveMotion', label: 'Wave: organic motion', note: 'FIX-02 §4a — counter-current + big y-bobs', wired: true },
  { key: 'wavePathMorphing', label: 'Wave: path morphing', note: 'FIX-02 §4b — crests shift via d-attribute anim', wired: true },
  { key: 'waveSecondaryHarmonic', label: 'Wave: harmonic ripple', note: 'FIX-02 §4c — overlays high-freq wind chop', wired: true },
  { key: 'waveAmplitudeBreathing', label: 'Wave: amplitude breath', note: 'FIX-02 §4d — slow scaleY inhale/exhale', wired: true },
  { key: 'waveFoamStreaks', label: 'Wave: foam streaks', note: 'FIX-02 §4e — drifting foam lines', wired: true },
];

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
            className="text-xs px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer"
            aria-label="Switch side"
            title="Switch side"
          >
            ⇆
          </button>
          <button
            onClick={() => s.set('controlsOpen', false)}
            className="text-xs px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer"
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
                className="px-2 py-1.5 rounded text-xs font-medium cursor-pointer"
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
                    className="flex-1 py-1.5 rounded text-xs font-medium cursor-pointer"
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
                className="w-full py-2 rounded text-xs font-medium cursor-pointer mb-1.5"
                style={{ backgroundColor: '#C9D1FF', color: '#313E88' }}
              >
                Open Jar modal
              </button>
              <button
                onClick={() => {
                  const first = shells[0];
                  if (first) openInscription(first.id);
                }}
                className="w-full py-2 rounded text-xs font-medium cursor-pointer mb-1.5"
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

        {/* Design experiments */}
        <Section title="Design experiments">
          {EXPERIMENTS.map((exp) => (
            <Toggle
              key={exp.key}
              label={exp.label}
              note={`${exp.note}${exp.wired ? '' : ' — not yet wired'}`}
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
      <h3 className="text-[10px] font-bold tracking-wider opacity-70 mb-1.5 uppercase">{title}</h3>
      <div className="space-y-1.5">{children}</div>
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
    <label className="flex items-start gap-2 cursor-pointer select-none py-0.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 cursor-pointer"
      />
      <span className="flex-1">
        <span className="text-[12px]">{label}</span>
        {note && <span className="block text-[10px] opacity-60">{note}</span>}
      </span>
    </label>
  );
}
