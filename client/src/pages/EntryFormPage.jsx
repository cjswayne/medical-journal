import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntries } from '../hooks/useEntries';
import { useOptions } from '../hooks/useOptions';
import CollapsibleSection from '../components/CollapsibleSection';
import StrainList from '../components/StrainList';
import SensoryPicker from '../components/SensoryPicker';
import EffectsRater from '../components/EffectsRater';
import ImageUploader from '../components/ImageUploader';
import TagInput from '../components/TagInput';
import {
  CANNABIS_FORMS,
  CONSUMPTION_METHODS,
  CANNABINOID_KEYS,
  CANNABINOID_LABELS,
} from '../utils/constants';
import { capitalize, formatDate } from '../utils/formatters';
import styles from '../styles/EntryForm.module.css';

const buildDefaults = () => ({
  productName: '',
  strains: [],
  brand: '',
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
  effects: {},
  symptomsRelievedNotes: '',
  otherEffectsNotes: '',
  medicalRating: '',
  recreationalRating: '',
  flowerImageUrl: '',
  coaImageUrls: [],
});

const mergeEntry = (entry) => {
  const defaults = buildDefaults();
  if (!entry) return defaults;

  return {
    ...defaults,
    ...entry,
    dispensary: { ...defaults.dispensary, ...(entry.dispensary || {}) },
    cannabinoids: { ...defaults.cannabinoids, ...(entry.cannabinoids || {}) },
    terpenes: { ...defaults.terpenes, ...(entry.terpenes || {}) },
    dosage: { ...defaults.dosage, ...(entry.dosage || {}) },
    effects: { ...defaults.effects, ...(entry.effects || {}) },
    aromas: Array.isArray(entry.aromas) ? entry.aromas : [],
    flavors: Array.isArray(entry.flavors) ? entry.flavors : [],
    strains: Array.isArray(entry.strains) ? entry.strains : [],
    coaImageUrls: Array.isArray(entry.coaImageUrls) ? entry.coaImageUrls : [],
  };
};

const EntryFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');

  const { entry, loading, error, fetchEntry, createEntry, updateEntry } = useEntries();
  const { aromaOptions, flavorOptions, fetchAllOptions, addOption } = useOptions();

  const [form, setForm] = useState(buildDefaults);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [populated, setPopulated] = useState(false);

  useEffect(() => {
    fetchAllOptions();
  }, [fetchAllOptions]);

  useEffect(() => {
    if (isEdit) fetchEntry(id);
  }, [isEdit, id, fetchEntry]);

  // Populate form once when entry loads in edit mode
  useEffect(() => {
    if (isEdit && entry && !populated) {
      setForm(mergeEntry(entry));
      setPopulated(true);
    }
  }, [isEdit, entry, populated]);

  const set = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setNested = useCallback((parent, field, value) => {
    setForm((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  }, []);

  const setCannabinoid = useCallback((key, raw) => {
    setForm((prev) => ({
      ...prev,
      cannabinoids: { ...prev.cannabinoids, [key]: raw },
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const saved = isEdit
        ? await updateEntry(id, form)
        : await createEntry(form);
      navigate(`/entry/${saved._id}`);
    } catch (err) {
      console.error('EntryFormPage submit:', err);
      setSubmitError(err.message || 'Failed to save entry');
    } finally {
      setSubmitting(false);
    }
  };

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

        {submitError && (
          <p className={styles.errorBanner} role="alert">{submitError}</p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* 1 - Product Info */}
          <CollapsibleSection title="Product Info" defaultOpen>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="productName">
                Product Name <span className={styles.required}>*</span>
              </label>
              <input
                id="productName"
                className={styles.input}
                type="text"
                required
                value={form.productName}
                onChange={(e) => set('productName', e.target.value)}
              />

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
          <CollapsibleSection title="Purchase" defaultOpen={false}>
            <div className={styles.fieldGroup}>
              <div className={styles.row}>
                <div className={styles.col}>
                  <label className={styles.label} htmlFor="quantity">Quantity</label>
                  <input
                    id="quantity"
                    className={styles.input}
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={(e) => set('quantity', e.target.value)}
                  />
                </div>
                <div className={styles.col}>
                  <label className={styles.label} htmlFor="price">Price ($)</label>
                  <input
                    id="price"
                    className={styles.input}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => set('price', e.target.value)}
                  />
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
          <CollapsibleSection title="Dispensary" defaultOpen={false}>
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
          <CollapsibleSection title="Form & Method" defaultOpen={false}>
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
          <CollapsibleSection title="Aroma" defaultOpen={false}>
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
          <CollapsibleSection title="Flavor" defaultOpen={false}>
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
          <CollapsibleSection title="Chemistry" defaultOpen={false}>
            <div className={styles.fieldGroup}>
              <div className={styles.chemGrid}>
                {CANNABINOID_KEYS.map((key) => (
                  <div key={key} className={styles.chemCell}>
                    <label className={styles.label} htmlFor={`chem-${key}`}>
                      {CANNABINOID_LABELS[key]} (%)
                    </label>
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
                  </div>
                ))}
              </div>
              <label className={styles.label}>Dominant Terpenes</label>
              <TagInput
                tags={form.terpenes.dominant}
                onChange={(v) => setNested('terpenes', 'dominant', v)}
                placeholder="Add dominant terpene"
              />
              <label className={styles.label}>Secondary Terpenes</label>
              <TagInput
                tags={form.terpenes.secondary}
                onChange={(v) => setNested('terpenes', 'secondary', v)}
                placeholder="Add secondary terpene"
              />
            </div>
          </CollapsibleSection>

          {/* 8 - Dosage */}
          <CollapsibleSection title="Dosage" defaultOpen={false}>
            <div className={styles.fieldGroup}>
              <div className={styles.row}>
                <div className={styles.col}>
                  <label className={styles.label} htmlFor="amountConsumed">
                    Amount Consumed
                  </label>
                  <input
                    id="amountConsumed"
                    className={styles.input}
                    type="text"
                    value={form.dosage.amountConsumed}
                    onChange={(e) => setNested('dosage', 'amountConsumed', e.target.value)}
                  />
                </div>
                <div className={styles.col}>
                  <label className={styles.label} htmlFor="timesTaken">
                    Times Taken
                  </label>
                  <input
                    id="timesTaken"
                    className={styles.input}
                    type="number"
                    min="0"
                    value={form.dosage.timesTaken}
                    onChange={(e) => setNested('dosage', 'timesTaken', e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.col}>
                  <label className={styles.label} htmlFor="timeToEffect">
                    Time to Effect
                  </label>
                  <input
                    id="timeToEffect"
                    className={styles.input}
                    type="text"
                    value={form.dosage.timeToEffect}
                    onChange={(e) => setNested('dosage', 'timeToEffect', e.target.value)}
                  />
                </div>
                <div className={styles.col}>
                  <label className={styles.label} htmlFor="lengthOfEffects">
                    Length of Effects
                  </label>
                  <input
                    id="lengthOfEffects"
                    className={styles.input}
                    type="text"
                    value={form.dosage.lengthOfEffects}
                    onChange={(e) => setNested('dosage', 'lengthOfEffects', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* 9 - Effects */}
          <CollapsibleSection title="Effects" defaultOpen={false}>
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
          <CollapsibleSection title="Ratings" defaultOpen={false}>
            <div className={styles.fieldGroup}>
              <div className={styles.row}>
                <div className={styles.col}>
                  <label className={styles.label} htmlFor="medicalRating">
                    Medical Rating (0–10)
                  </label>
                  <input
                    id="medicalRating"
                    className={styles.input}
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={form.medicalRating}
                    onChange={(e) => set('medicalRating', e.target.value)}
                  />
                </div>
                <div className={styles.col}>
                  <label className={styles.label} htmlFor="recreationalRating">
                    Recreational Rating (0–10)
                  </label>
                  <input
                    id="recreationalRating"
                    className={styles.input}
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={form.recreationalRating}
                    onChange={(e) => set('recreationalRating', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* 11 - Images */}
          <CollapsibleSection title="Images" defaultOpen={false}>
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
            </div>
          </CollapsibleSection>

          {/* Sticky action bar */}
          <div className={styles.actionBar}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={submitting || !form.productName.trim()}
            >
              {submitting ? 'Saving…' : isEdit ? 'Update Entry' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntryFormPage;
