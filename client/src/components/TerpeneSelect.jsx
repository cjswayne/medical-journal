import { useState } from 'react';
import { TERPENE_OPTIONS, TERPENE_STRUCTURES } from '../utils/constants';
import styles from './TerpeneSelect.module.css';

const ADD_NEW_VALUE = '__add_new__';

const TerpeneSelect = ({ tags = [], onChange, label = 'Terpene' }) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customText, setCustomText] = useState('');

  const emit = (next) => {
    if (typeof onChange === 'function') onChange(next);
  };

  const handleSelect = (e) => {
    const val = e.target.value;
    if (!val) return;

    if (val === ADD_NEW_VALUE) {
      setShowCustom(true);
      e.target.value = '';
      return;
    }

    // Don't add duplicates
    if (!tags.includes(val)) {
      emit([...tags, val]);
    }
    e.target.value = '';
  };

  const handleAddCustom = () => {
    const name = customText.trim();
    if (!name) return;

    // Check if it already exists in the predefined list (case-insensitive)
    const existing = TERPENE_OPTIONS.find(
      (t) => t.toLowerCase() === name.toLowerCase()
    );

    const terpeneToAdd = existing || name;
    if (!tags.includes(terpeneToAdd)) {
      emit([...tags, terpeneToAdd]);
    }
    setCustomText('');
    setShowCustom(false);
  };

  const handleCustomKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustom();
    }
    if (e.key === 'Escape') {
      setShowCustom(false);
      setCustomText('');
    }
  };

  const removeAt = (index) => {
    emit(tags.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.root}>
      <select
        className={styles.select}
        onChange={handleSelect}
        defaultValue=""
        aria-label={`Select ${label}`}
      >
        <option value="" disabled>Select {label.toLowerCase()}...</option>
        {TERPENE_OPTIONS.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
        <option value={ADD_NEW_VALUE}>+ Add a new option</option>
      </select>

      {showCustom && (
        <div className={styles.customRow}>
          <input
            className={styles.customInput}
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={handleCustomKeyDown}
            placeholder="Enter custom terpene name"
            autoFocus
            autoComplete="off"
          />
          <button
            type="button"
            className={styles.addBtn}
            onClick={handleAddCustom}
            disabled={!customText.trim()}
          >
            Add
          </button>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => { setShowCustom(false); setCustomText(''); }}
          >
            Cancel
          </button>
        </div>
      )}

      {tags.length > 0 && (
        <div className={styles.chips}>
          {tags.map((tag, index) => (
            <div key={`${tag}-${index}`} className={styles.chip}>
              {TERPENE_STRUCTURES[tag] && (
                <svg
                  className={styles.structureSvg}
                  viewBox="0 0 60 55"
                  aria-label={`${tag} structure`}
                >
                  <path
                    d={TERPENE_STRUCTURES[tag]}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <span className={styles.chipLabel}>{tag}</span>
              <button
                type="button"
                className={styles.chipRemove}
                onClick={() => removeAt(index)}
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TerpeneSelect;
