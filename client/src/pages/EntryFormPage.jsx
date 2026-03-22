import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntries } from '../hooks/useEntries';
import { useOptions } from '../hooks/useOptions';
import CollapsibleSection from '../components/CollapsibleSection';
import StrainList from '../components/StrainList';
import SensoryPicker from '../components/SensoryPicker';
import EffectsRater from '../components/EffectsRater';
import ImageUploader from '../components/ImageUploader';
import TerpeneSelect from '../components/TerpeneSelect';
import {
  CANNABIS_FORMS,
  CONSUMPTION_METHODS,
  CANNABINOID_KEYS,
  CANNABINOID_LABELS,
  STRAIN_TYPES,
  todayISO,
  HIGHNESS_COLORS,
  HIGHNESS_LABELS,
} from '../utils/constants';
import { capitalize, formatDate } from '../utils/formatters';
import styles from '../styles/EntryForm.module.css';

// Clamp a numeric string within [min, max], returning '' for empty
const clampNumeric = (raw, min, max) => {
  if (raw === '' || raw === null || raw === undefined) return '';
  const num = parseFloat(raw);
  if (Number.isNaN(num)) return '';
  if (num < min) return String(min);
  if (num > max) return String(max);
  return raw;
};

const buildDefaults = () => ({
  productName: '',
  productType: '',
  strains: [],
  brand: '',
  purchaseDate: todayISO(),
  quantity: '',
  price: '',
  priceNotes: '',
  dispensary: { name: '', location: '', website: '' },
  cannabisForm: '',
  customCannabisForm: '',
  cannabisFormNotes: '',
  consumptionMethod: '',
  customConsumptionMethod: '',
  consumptionMethodNotes: '',
  aromas: [],
  aromaNotes: '',
  flavors: [],
  flavorNotes: '',
  cannabinoids: CANNABINOID_KEYS.reduce((acc, k) => ({ ...acc, [k]: '' }), {}),
  terpenes: { dominant: [], secondary: [] },
  dosage: {
    amountConsumed: '',
    timesTaken: '',
    timeToEffect: '',
    lengthOfEffects: '',
  },
  highnessColor: '',
  effects: {},
  symptomsRelievedNotes: '',
  otherEffectsNotes: '',
  medicalRating: '',
  recreationalRating: '',
  notes: '',
  flowerImageUrl: '',
  coaImageUrls: [],
  miscImageUrls: [],
});

const mergeEntry = (entry) => {
  const defaults = buildDefaults();
  if (!entry) return defaults;

  // Convert server date to YYYY-MM-DD for input[type=date]
  let purchaseDate = defaults.purchaseDate;
  if (entry.purchaseDate) {
    purchaseDate = new Date(entry.purchaseDate).toISOString().split('T')[0];
  }

  return {
    ...defaults,
    ...entry,
    purchaseDate,
    dispensary: { ...defaults.dispensary, ...(entry.dispensary || {}) },
    cannabinoids: { ...defaults.cannabinoids, ...(entry.cannabinoids || {}) },
    terpenes: { ...defaults.terpenes, ...(entry.terpenes || {}) },
    dosage: { ...defaults.dosage, ...(entry.dosage || {}) },
    effects: { ...defaults.effects, ...(entry.effects || {}) },
    aromas: Array.isArray(entry.aromas) ? entry.aromas : [],
    flavors: Array.isArray(entry.flavors) ? entry.flavors : [],
    strains: Array.isArray(entry.strains) ? entry.strains : [],
    coaImageUrls: Array.isArray(entry.coaImageUrls) ? entry.coaImageUrls : [],
    miscImageUrls: Array.isArray(entry.miscImageUrls) ? entry.miscImageUrls : [],
  };
};

const AUTOSAVE_DELAY = 1500;

const EntryFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');

  const { entry, loading, error, fetchEntry, createEntry, updateEntry } = useEntries();
  const { aromaOptions, flavorOptions, fetchAllOptions, addOption } = useOptions();

  const [form, setForm] = useState(buildDefaults);
  const [populated, setPopulated] = useState(false);

  // Auto-save state: 'idle' | 'saving' | 'saved' | 'error'
  const [saveStatus, setSaveStatus] = useState('idle');
  const [saveError, setSaveError] = useState(null);

  // Ref to track the live entry id (may change after first create)
  const entryIdRef = useRef(isEdit ? id : null);
  const formRef = useRef(form);
  formRef.current = form;

  // Track whether a save is already in-flight to avoid overlapping requests
  const savingRef = useRef(false);
  const timerRef = useRef(null);
  // Track whether any user edit has happened (prevents auto-save on initial load)
  const dirtyRef = useRef(false);

  useEffect(() => {
    fetchAllOptions();
  }, [fetchAllOptions]);

  useEffect(() => {
    if (isEdit) fetchEntry(id);
  }, [isEdit, id, fetchEntry]);

  useEffect(() => {
    if (isEdit && entry && !populated) {
      setForm(mergeEntry(entry));
      setPopulated(true);
    }
  }, [isEdit, entry, populated]);

  // Auto-save logic
  const doSave = useCallback(async () => {
    if (savingRef.current) return;
    const snapshot = formRef.current;
    if (!snapshot.productName.trim()) return;

    savingRef.current = true;
    setSaveStatus('saving');
    setSaveError(null);

    try {
      if (entryIdRef.current) {
        await updateEntry(entryIdRef.current, snapshot);
      } else {
        const saved = await createEntry(snapshot);
        entryIdRef.current = saved._id;
        // Silently replace URL so subsequent saves are updates
        window.history.replaceState(null, '', `/entry/${saved._id}/edit`);
      }
      setSaveStatus('saved');
    } catch (err) {
      console.error('Auto-save failed:', err);
      setSaveStatus('error');
      setSaveError(err.message || 'Save failed');
    } finally {
      savingRef.current = false;
    }
  }, [createEntry, updateEntry]);

  const scheduleSave = useCallback(() => {
    if (!dirtyRef.current) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(doSave, AUTOSAVE_DELAY);
  }, [doSave]);

  // Trigger debounced save whenever form changes (after initial populate)
  useEffect(() => {
    if (!dirtyRef.current) return;
    scheduleSave();
    return () => clearTimeout(timerRef.current);
  }, [form, scheduleSave]);

  // Wrap setters to mark dirty
  const set = useCallback((field, value) => {
    dirtyRef.current = true;
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setNested = useCallback((parent, field, value) => {
    dirtyRef.current = true;
    setForm((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  }, []);

  const setCannabinoid = useCallback((key, raw) => {
    dirtyRef.current = true;
    const clamped = clampNumeric(raw, 0, 100);
    setForm((prev) => ({
      ...prev,
      cannabinoids: { ...prev.cannabinoids, [key]: clamped },
    }));
  }, []);

  const setClampedRating = useCallback((field, raw) => {
    dirtyRef.current = true;
    const clamped = clampNumeric(raw, 0, 10);
    setForm((prev) => ({ ...prev, [field]: clamped }));
  }, []);

  const setClampedDosage = useCallback((field, raw, min = 0, max = Infinity) => {
    dirtyRef.current = true;
    const clamped = clampNumeric(raw, min, max);
    setForm((prev) => ({
      ...prev,
      dosage: { ...prev.dosage, [field]: clamped },
    }));
  }, []);

  if (isEdit && loading && !populated) {
    return (
      <div className={styles.page}>
        <div className={styles.spinner} aria-label="Loading entry" />
      </div>
    );
  }

  if (isEdit && error && !populated) {
    return (
      <div className={styles.page}>
        <p className={styles.errorBanner} role="alert">{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            {isEdit ? form.productName || 'Edit Entry' : 'New Entry'}
          </h1>
          <p className={styles.date}>
            {isEdit && entry?.createdAt ? formatDate(entry.createdAt) : 'Today'}
          </p>
        </header>
        <div className={styles.rastaStripe} role="presentation" />

        <div>
          {/* 1 - Product Info */}
          <CollapsibleSection title="Product Info" defaultOpen>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="productName">
                Product Name <span className={styles.required}>*</span>
              </label>
              <div className={styles.row}>
                <div className={styles.col} style={{ flex: 1 }}>
                  <input
                    id="productName"
                    className={styles.input}
                    type="text"
                    required
                    value={form.productName}
                    onChange={(e) => set('productName', e.target.value)}
                  />
                </div>
                <div className={styles.col}>
                  <select
                    id="productType"
                    className={styles.select}
                    value={form.productType}
                    onChange={(e) => set('productType', e.target.value)}
                    aria-label="Product strain type"
                  >
                    <option value="">— Type —</option>
                    {STRAIN_TYPES.map((t) => (
                      <option key={t} value={t}>{capitalize(t)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className={styles.label}>Strains</label>
              <StrainList
                strains={form.strains}
                onChange={(v) => set('strains', v)}
              />

              <label className={styles.label} htmlFor="brand">Brand</label>
              <input
                id="brand"
                className={styles.input}
                type="text"
                value={form.brand}
                onChange={(e) => set('brand', e.target.value)}
              />
            </div>
          </CollapsibleSection>

          {/* 2 - Purchase */}
          <CollapsibleSection title="Purchase" defaultOpen>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="purchaseDate">Purchase Date</label>
              <input
                id="purchaseDate"
                className={styles.input}
                type="date"
                max={todayISO()}
                value={form.purchaseDate}
                onChange={(e) => set('purchaseDate', e.target.value)}
              />
              <div className={styles.row}>
                <div className={styles.col}>
                  <label className={styles.label} htmlFor="quantity">Quantity</label>
                  <div className={styles.inputWithUnit}>
                    <input
                      id="quantity"
                      className={styles.input}
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.quantity}
                      onChange={(e) => set('quantity', clampNumeric(e.target.value, 0, 99999))}
                    />
                    <span className={styles.unit}>g</span>
                  </div>
                </div>
                <div className={styles.col}>
                  <label className={styles.label} htmlFor="price">Price</label>
                  <div className={styles.inputWithUnit}>
                    <span className={styles.unitPrefix}>$</span>
                    <input
                      id="price"
                      className={`${styles.input} ${styles.inputWithPrefix}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => set('price', clampNumeric(e.target.value, 0, 99999))}
                    />
                  </div>
                </div>
              </div>
              <label className={styles.label} htmlFor="priceNotes">Price Notes</label>
              <textarea
                id="priceNotes"
                className={styles.textarea}
                value={form.priceNotes}
                onChange={(e) => set('priceNotes', e.target.value)}
              />
            </div>
          </CollapsibleSection>

          {/* 3 - Dispensary */}
          <CollapsibleSection title="Dispensary" defaultOpen>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="dispName">Name</label>
              <input
                id="dispName"
                className={styles.input}
                type="text"
                value={form.dispensary.name}
                onChange={(e) => setNested('dispensary', 'name', e.target.value)}
              />

              <label className={styles.label} htmlFor="dispLocation">Location</label>
              <input
                id="dispLocation"
                className={styles.input}
                type="text"
                value={form.dispensary.location}
                onChange={(e) => setNested('dispensary', 'location', e.target.value)}
              />

              <label className={styles.label} htmlFor="dispWebsite">Website</label>
              <input
                id="dispWebsite"
                className={styles.input}
                type="url"
                value={form.dispensary.website}
                onChange={(e) => setNested('dispensary', 'website', e.target.value)}
              />
            </div>
          </CollapsibleSection>

          {/* 4 - Form & Method */}
          <CollapsibleSection title="Form & Method" defaultOpen>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="cannabisForm">Cannabis Form</label>
              <select
                id="cannabisForm"
                className={styles.select}
                value={form.cannabisForm}
                onChange={(e) => set('cannabisForm', e.target.value)}
              >
                <option value="">Select form</option>
                {CANNABIS_FORMS.map((f) => (
                  <option key={f} value={f}>{capitalize(f)}</option>
                ))}
              </select>
              {form.cannabisForm === 'other' && (
                <>
                  <label className={styles.label} htmlFor="customCannabisForm">
                    Custom Form
                  </label>
                  <input
                    id="customCannabisForm"
                    className={styles.input}
                    type="text"
                    value={form.customCannabisForm}
                    onChange={(e) => set('customCannabisForm', e.target.value)}
                  />
                </>
              )}
              <label className={styles.label} htmlFor="cannabisFormNotes">Form Notes</label>
              <textarea
                id="cannabisFormNotes"
                className={styles.textarea}
                value={form.cannabisFormNotes}
                onChange={(e) => set('cannabisFormNotes', e.target.value)}
              />

              <label className={styles.label} htmlFor="consumptionMethod">
                Consumption Method
              </label>
              <select
                id="consumptionMethod"
                className={styles.select}
                value={form.consumptionMethod}
                onChange={(e) => set('consumptionMethod', e.target.value)}
              >
                <option value="">Select method</option>
                {CONSUMPTION_METHODS.map((m) => (
                  <option key={m} value={m}>{capitalize(m)}</option>
                ))}
              </select>
              {form.consumptionMethod === 'other' && (
                <>
                  <label className={styles.label} htmlFor="customConsumptionMethod">
                    Custom Method
                  </label>
                  <input
                    id="customConsumptionMethod"
                    className={styles.input}
                    type="text"
                    value={form.customConsumptionMethod}
                    onChange={(e) => set('customConsumptionMethod', e.target.value)}
                  />
                </>
              )}
              <label className={styles.label} htmlFor="consumptionMethodNotes">
                Method Notes
              </label>
              <textarea
                id="consumptionMethodNotes"
                className={styles.textarea}
                value={form.consumptionMethodNotes}
                onChange={(e) => set('consumptionMethodNotes', e.target.value)}
              />
            </div>
          </CollapsibleSection>

          {/* 5 - Aroma */}
          <CollapsibleSection title="Aroma" defaultOpen>
            <div className={styles.fieldGroup}>
              <SensoryPicker
                label="Aroma"
                options={aromaOptions}
                selected={form.aromas}
                onChange={(v) => set('aromas', v)}
                onAddCustom={(name) => addOption('aroma', name)}
              />
              <label className={styles.label} htmlFor="aromaNotes">Aroma Notes</label>
              <textarea
                id="aromaNotes"
                className={styles.textarea}
                value={form.aromaNotes}
                onChange={(e) => set('aromaNotes', e.target.value)}
              />
            </div>
          </CollapsibleSection>

          {/* 6 - Flavor */}
          <CollapsibleSection title="Flavor" defaultOpen>
            <div className={styles.fieldGroup}>
              <SensoryPicker
                label="Flavor"
                options={flavorOptions}
                selected={form.flavors}
                onChange={(v) => set('flavors', v)}
                onAddCustom={(name) => addOption('flavor', name)}
              />
              <label className={styles.label} htmlFor="flavorNotes">Flavor Notes</label>
              <textarea
                id="flavorNotes"
                className={styles.textarea}
                value={form.flavorNotes}
                onChange={(e) => set('flavorNotes', e.target.value)}
              />
            </div>
          </CollapsibleSection>

          {/* 7 - Chemistry */}
          <CollapsibleSection title="Chemistry" defaultOpen>
            <div className={styles.fieldGroup}>
              <div className={styles.chemGrid}>
                {CANNABINOID_KEYS.map((key) => (
                  <div key={key} className={styles.chemCell}>
                    <label className={styles.label} htmlFor={`chem-${key}`}>
                      {CANNABINOID_LABELS[key]}
                    </label>
                    <div className={styles.inputWithUnit}>
                      <input
                        id={`chem-${key}`}
                        className={styles.input}
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={form.cannabinoids[key]}
                        onChange={(e) => setCannabinoid(key, e.target.value)}
                      />
                      <span className={styles.unit}>%</span>
                    </div>
                  </div>
                ))}
              </div>
              <label className={styles.label}>Dominant Terpenes</label>
              <TerpeneSelect
                tags={form.terpenes.dominant}
                onChange={(v) => setNested('terpenes', 'dominant', v)}
                label="dominant terpene"
              />
              <label className={styles.label}>Secondary Terpenes</label>
              <TerpeneSelect
                tags={form.terpenes.secondary}
                onChange={(v) => setNested('terpenes', 'secondary', v)}
                label="secondary terpene"
              />
            </div>
          </CollapsibleSection>

          {/* 8 - Dosage */}
          <CollapsibleSection title="Dosage" defaultOpen>
            <div className={styles.fieldGroup}>
              <div className={styles.row}>
                <div className={styles.col}>
                  <label className={styles.label} htmlFor="amountConsumed">
                    Amount Consumed
                  </label>
                  <div className={styles.inputWithUnit}>
                    <input
                      id="amountConsumed"
                      className={styles.input}
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.dosage.amountConsumed}
                      onChange={(e) => setClampedDosage('amountConsumed', e.target.value, 0, 99999)}
                    />
                    <span className={styles.unit}>g</span>
                  </div>
                </div>
                <div className={styles.col}>
                  <label className={styles.label} htmlFor="timesTaken">
                    Times Taken
                  </label>
                  <div className={styles.inputWithUnit}>
                    <input
                      id="timesTaken"
                      className={styles.input}
                      type="number"
                      min="1"
                      max="100"
                      value={form.dosage.timesTaken}
                      onChange={(e) => setClampedDosage('timesTaken', e.target.value, 1, 100)}
                    />
                    <span className={styles.unit}>×</span>
                  </div>
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.col}>
                  <label className={styles.label} htmlFor="timeToEffect">
                    Time to Effect
                  </label>
                  <div className={styles.inputWithUnit}>
                    <input
                      id="timeToEffect"
                      className={styles.input}
                      type="number"
                      min="0"
                      step="1"
                      value={form.dosage.timeToEffect}
                      onChange={(e) => setClampedDosage('timeToEffect', e.target.value, 0, 1440)}
                    />
                    <span className={styles.unit}>min</span>
                  </div>
                </div>
                <div className={styles.col}>
                  <label className={styles.label} htmlFor="lengthOfEffects">
                    Length of Effects
                  </label>
                  <div className={styles.inputWithUnit}>
                    <input
                      id="lengthOfEffects"
                      className={styles.input}
                      type="number"
                      min="0"
                      step="1"
                      value={form.dosage.lengthOfEffects}
                      onChange={(e) => setClampedDosage('lengthOfEffects', e.target.value, 0, 1440)}
                    />
                    <span className={styles.unit}>min</span>
                  </div>
                </div>
              </div>

              <label className={styles.label}>What is my color</label>
              <div className={styles.colorButtonRow}>
                {HIGHNESS_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`${styles.colorButton} ${styles[`colorButton_${color}`]} ${form.highnessColor === color ? styles.colorButtonSelected : ''}`}
                    onClick={() => set('highnessColor', color)}
                    title={HIGHNESS_LABELS[color]}
                    aria-pressed={form.highnessColor === color}
                  >
                    {color}
                  </button>
                ))}
              </div>
              <div className={styles.colorKeyInfo}>
                <span className={styles.colorKeyInfoIcon} aria-hidden title="Color key">&#9432;</span>
                <span className={styles.colorKeyText}>
                  {HIGHNESS_COLORS.map((c) => `${c} = ${HIGHNESS_LABELS[c]}`).join(' · ')}
                </span>
              </div>
            </div>
          </CollapsibleSection>

          {/* 9 - Effects */}
          <CollapsibleSection title="Effects" defaultOpen>
            <div className={styles.fieldGroup}>
              <EffectsRater
                effects={form.effects}
                onChange={(v) => set('effects', v)}
              />
              <label className={styles.label} htmlFor="symptomsRelievedNotes">
                Symptoms Relieved Notes
              </label>
              <textarea
                id="symptomsRelievedNotes"
                className={styles.textarea}
                value={form.symptomsRelievedNotes}
                onChange={(e) => set('symptomsRelievedNotes', e.target.value)}
              />
              <label className={styles.label} htmlFor="otherEffectsNotes">
                Other Effects Notes
              </label>
              <textarea
                id="otherEffectsNotes"
                className={styles.textarea}
                value={form.otherEffectsNotes}
                onChange={(e) => set('otherEffectsNotes', e.target.value)}
              />
            </div>
          </CollapsibleSection>

          {/* 10 - Ratings */}
          <CollapsibleSection title="Ratings" defaultOpen>
            <div className={styles.fieldGroup}>
              <div className={styles.row}>
                <div className={styles.col}>
                  <label className={styles.label} htmlFor="medicalRating">
                    Medical Rating
                  </label>
                  <div className={styles.inputWithUnit}>
                    <input
                      id="medicalRating"
                      className={styles.input}
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={form.medicalRating}
                      onChange={(e) => setClampedRating('medicalRating', e.target.value)}
                    />
                    <span className={styles.unit}>/10</span>
                  </div>
                </div>
                <div className={styles.col}>
                  <label className={styles.label} htmlFor="recreationalRating">
                    Recreational Rating
                  </label>
                  <div className={styles.inputWithUnit}>
                    <input
                      id="recreationalRating"
                      className={styles.input}
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={form.recreationalRating}
                      onChange={(e) => setClampedRating('recreationalRating', e.target.value)}
                    />
                    <span className={styles.unit}>/10</span>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* 11 - Notes */}
          <CollapsibleSection title="Notes" defaultOpen>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="notes">Final Notes</label>
              <textarea
                id="notes"
                className={styles.textarea}
                rows={4}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Any additional thoughts, observations, or reminders..."
              />
            </div>
          </CollapsibleSection>

          {/* 12 - Images */}
          <CollapsibleSection title="Images" defaultOpen>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Flower Image</label>
              <ImageUploader
                value={form.flowerImageUrl}
                onChange={(v) => set('flowerImageUrl', v)}
                multiple={false}
              />
              <label className={styles.label}>COA Images</label>
              <ImageUploader
                value={form.coaImageUrls}
                onChange={(v) => set('coaImageUrls', v)}
                multiple
              />
              <label className={styles.label}>Misc Images</label>
              <ImageUploader
                value={form.miscImageUrls}
                onChange={(v) => set('miscImageUrls', v)}
                multiple
              />
            </div>
          </CollapsibleSection>

        </div>
      </div>

      {/* Auto-save status indicator */}
      <div
        className={`${styles.autoSave} ${saveStatus !== 'idle' ? styles.autoSaveVisible : ''}`}
        aria-live="polite"
      >
        {saveStatus === 'saving' && (
          <>
            <span className={styles.autoSaveSpinner} />
            <span>Saving</span>
          </>
        )}
        {saveStatus === 'saved' && (
          <>
            <span className={styles.autoSaveCheck}>&#10003;</span>
            <span>Saved</span>
          </>
        )}
        {saveStatus === 'error' && (
          <span className={styles.autoSaveError} title={saveError || ''}>Save failed</span>
        )}
      </div>
    </div>
  );
};

export default EntryFormPage;
