import { STRAIN_TYPES } from '../utils/constants';
import { capitalize } from '../utils/formatters';
import styles from './StrainList.module.css';

const StrainList = ({ strains = [], onChange }) => {
  const emit = (next) => {
    if (typeof onChange === 'function') onChange(next);
  };

  const updateRow = (index, patch) => {
    const next = strains.map((row, i) => (i === index ? { ...row, ...patch } : row));
    emit(next);
  };

  const removeRow = (index) => {
    emit(strains.filter((_, i) => i !== index));
  };

  const addRow = () => {
    emit([...strains, { name: '', type: STRAIN_TYPES[0] }]);
  };

  return (
    <div className={styles.root}>
      <ul className={styles.list}>
        {strains.map((row, index) => (
          <li key={index} className={styles.row}>
            <label className={styles.srOnly} htmlFor={`strain-name-${index}`}>
              Strain name {index + 1}
            </label>
            <input
              id={`strain-name-${index}`}
              className={styles.nameInput}
              type="text"
              value={row.name ?? ''}
              onChange={(e) => updateRow(index, { name: e.target.value })}
              placeholder="Strain name"
            />
            <label className={styles.srOnly} htmlFor={`strain-type-${index}`}>
              Strain type {index + 1}
            </label>
            <select
              id={`strain-type-${index}`}
              className={styles.select}
              value={row.type ?? STRAIN_TYPES[0]}
              onChange={(e) => updateRow(index, { type: e.target.value })}
            >
              {STRAIN_TYPES.map((t) => (
                <option key={t} value={t}>
                  {capitalize(t)}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={styles.remove}
              onClick={() => removeRow(index)}
              aria-label={`Remove strain row ${index + 1}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className={styles.add} onClick={addRow}>
        Add Strain
      </button>
    </div>
  );
};

export default StrainList;
