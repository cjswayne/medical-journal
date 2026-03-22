import { useState } from 'react';
import styles from './TagInput.module.css';

const TagInput = ({ tags = [], onChange, placeholder = 'Add tag…' }) => {
  const [draft, setDraft] = useState('');

  const emit = (next) => {
    if (typeof onChange === 'function') onChange(next);
  };

  const addTag = (raw) => {
    const t = raw.trim();
    if (!t) return;
    emit([...tags, t]);
    setDraft('');
  };

  const removeAt = (index) => {
    emit(tags.filter((_, i) => i !== index));
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(draft);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.fieldRow}>
        <input
          className={styles.input}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
        />
      </div>
      {tags.length > 0 && (
        <ul className={styles.chips} aria-label="Tags">
          {tags.map((tag, index) => (
            <li key={`${tag}-${index}`} className={styles.chip}>
              <span className={styles.chipLabel}>{tag}</span>
              <button
                type="button"
                className={styles.chipRemove}
                onClick={() => removeAt(index)}
                aria-label={`Remove tag ${tag}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TagInput;
