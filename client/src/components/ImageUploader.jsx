import { useId, useRef, useState } from 'react';
import { api } from '../utils/api';
import { cloudinaryTransform } from '../utils/constants';
import styles from './ImageUploader.module.css';

const previewWidth = 200;

const ImageUploader = ({ value, onChange, multiple = false }) => {
  const inputRef = useRef(null);
  const baseId = useId();
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const urls = multiple
    ? (Array.isArray(value) ? value.filter(Boolean) : [])
    : value
      ? [value]
      : [];

  const openPicker = () => {
    inputRef.current?.click();
  };

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) =>
      f.type.startsWith('image/')
    );
    if (!files.length) return;

    const toSend = multiple ? files : files.slice(0, 1);
    setLoading(true);
    try {
      const formData = new FormData();
      toSend.forEach((file) => formData.append('images', file));
      const data = await api.upload('/upload', formData);
      const returned = Array.isArray(data?.urls) ? data.urls : [];
      if (!multiple) {
        onChange(returned[0] ?? '');
      } else {
        onChange([...urls, ...returned]);
      }
    } catch (err) {
      console.error('ImageUploader upload failed:', err);
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onInputChange = (e) => {
    uploadFiles(e.target.files);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    uploadFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const removeAt = (index) => {
    if (multiple) {
      onChange(urls.filter((_, i) => i !== index));
    } else {
      onChange('');
    }
  };

  const onZoneKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!loading) openPicker();
    }
  };

  return (
    <div className={styles.root}>
      <input
        ref={inputRef}
        id={`${baseId}-file`}
        className={styles.hiddenInput}
        type="file"
        accept="image/*"
        multiple={multiple}
        aria-hidden
        tabIndex={-1}
        onChange={onInputChange}
      />
      <div
        className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Choose image files to upload"
        aria-busy={loading}
        aria-controls={`${baseId}-file`}
        onKeyDown={onZoneKeyDown}
        onClick={() => !loading && openPicker()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        {loading ? (
          <span className={styles.spinner} aria-label="Uploading" />
        ) : null}
        <p className={styles.hint}>
          {loading ? 'Uploading…' : 'Drop images here or click to choose'}
        </p>
        <button
          type="button"
          className={styles.browseBtn}
          onClick={(e) => {
            e.stopPropagation();
            openPicker();
          }}
          disabled={loading}
        >
          Browse files
        </button>
      </div>

      {urls.length > 0 ? (
        <ul className={styles.previews} aria-label="Uploaded images">
          {urls.map((url, index) => (
            <li key={`${url}-${index}`} className={styles.previewItem}>
              <div className={styles.thumbWrap}>
                <img
                  className={styles.thumb}
                  src={cloudinaryTransform(url, previewWidth)}
                  alt=""
                />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeAt(index)}
                  aria-label={`Remove image ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default ImageUploader;
