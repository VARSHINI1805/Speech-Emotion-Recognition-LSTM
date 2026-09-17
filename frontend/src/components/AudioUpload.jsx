import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, FileAudio, Trash2 } from 'lucide-react';


export default function AudioUpload({ onAudioSelected, selectedFile, onClearAudio }) {
  const fileInputRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setAudioUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setAudioUrl(null);
    }
  }, [selectedFile]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onAudioSelected(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      onAudioSelected(file);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div>
      {!selectedFile ? (
        <div
          className={`dropzone ${isDragOver ? 'active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/wav,audio/mp3,audio/mpeg,audio/ogg,audio/m4a,audio/webm,audio/*"
            style={{ display: 'none' }}
          />
          <UploadCloud size={44} className="upload-icon" />
          <p className="upload-text-main">
            Click to upload or drag & drop an audio file
          </p>
          <p className="upload-text-sub">
            Supported formats: WAV, MP3, OGG, M4A, WebM
          </p>
        </div>
      ) : (
        <div className="audio-preview-card">
          <div className="audio-preview-header">
            <div className="audio-file-info">
              <FileAudio size={20} className="upload-icon" />
              <div>
                <div style={{ fontWeight: 600 }}>{selectedFile.name}</div>
                <div className="audio-file-size">{formatFileSize(selectedFile.size)}</div>
              </div>
            </div>
            <button
              type="button"
              className="clear-btn"
              onClick={onClearAudio}
              title="Remove file"
            >
              <Trash2 size={16} />
            </button>
          </div>
          {audioUrl && <audio controls src={audioUrl} />}
        </div>
      )}
    </div>
  );
}
