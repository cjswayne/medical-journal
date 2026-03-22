import { useCallback, useId, useState } from 'react';
import styles from './SensoryPicker.module.css';

const DEFAULT_STRENGTH = 5;

const SensoryPicker = ({ label, options, selected, onChange, onAddCustom }) => {
  const baseId = useId();
  const [customText, setCustomText] = useState('');

  const selectedByName = useCallback(
    (name) => selected.find((s) => s.name === name),
    [selected]
  );

  const toggleOption = (name) => {
    const exists = selectedByName(name);
    if (exists) {
      onChange(selected.filter((s) => s.name !== name));
    } else {
      onChange([...selected, { name, strength: DEFAULT_STRENGTH }]);
    }
  };

  const setStrength = (name, strength) => {
    const next = parseInt(strength, 10);
    if (Number.isNaN(next)) return;
    onChange(
      selected.map((s) => (s.name === name ? { ...s, strength: next } : s))
    );
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    const name = customText.trim();
    if (!name || typeof onAddCustom !== 'function') return;
    onAddCustom(name);
    setCustomText('');
  };

  return (
    <fieldset className={styles.root}>
      {label ? <legend className={styles.legend}>{label}</legend> : null}
      <div className={styles.grid} role="group" aria-label={label || 'Options'}>
        {(options || []).map((opt) => {
          const name = opt?.name ?? '';
          if (!name) return null;
          const active = Boolean(selectedByName(name));
          const rowId = `${baseId}-${name.replace(/\s+/g, '-')}`;
          return (
            <div key={name} className={styles.cell}>
              <button
                type="button"
                className={`${styles.option} ${active ? styles.optionSelected : ''}`}
                aria-pressed={active}
                onClick={() => toggleOption(name)}
              >
                {name}
              </button>
              {active ? (
                <div className={styles.sliderRow}>
                  <label className={styles.sliderLabel} htmlFor={rowId}>
                    Strength
                  </label>
                  <input
                    id={rowId}
                    className={styles.slider}
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={selectedByName(name)?.strength ?? DEFAULT_STRENGTH}
                    onChange={(ev) => setStrength(name, ev.target.value)}
                  />
                  <span className={styles.strengthValue} aria-live="polite">
                    {selectedByName(name)?.strength ?? DEFAULT_STRENGTH}
                  </span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <form className={styles.customForm} onSubmit={handleAddCustom}>
        <label className={styles.customLabel} htmlFor={`${baseId}-custom`}>
          Add custom
        </label>
        <div className={styles.customRow}>
          <input
            id={`${baseId}-custom`}
            className={styles.customInput}
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Custom note"
            autoComplete="off"
          />
          <button
            type="submit"
            className={styles.addBtn}
            disabled={!customText.trim() || typeof onAddCustom !== 'function'}
          >
            Add
          </button>
        </div>
      </form>
    </fieldset>
  );
};

export default SensoryPicker;
