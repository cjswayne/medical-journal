import { useId } from 'react';
import { EFFECT_KEYS, EFFECT_LABELS } from '../utils/constants';
import styles from './EffectsRater.module.css';

const EffectsRater = ({ effects, onChange }) => {
  const baseId = useId();

  const setEffect = (key, raw) => {
    const v = parseInt(raw, 10);
    if (Number.isNaN(v)) return;
    const clamped = Math.min(10, Math.max(0, v));
    onChange({ ...effects, [key]: clamped });
  };

  return (
    <div className={styles.root} role="group" aria-label="Effect ratings">
      <div className={styles.grid}>
        {EFFECT_KEYS.map((key) => {
          const id = `${baseId}-${key}`;
          const value = Number(effects?.[key] ?? 0);
          return (
            <div key={key} className={styles.item}>
              <label className={styles.label} htmlFor={id}>
                {EFFECT_LABELS[key] ?? key}
              </label>
              <div className={styles.sliderRow}>
                <input
                  id={id}
                  className={styles.slider}
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={value}
                  onChange={(e) => setEffect(key, e.target.value)}
                />
                <span className={styles.value} aria-live="polite">
                  {value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EffectsRater;
