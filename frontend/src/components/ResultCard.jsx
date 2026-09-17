import React from 'react';
import { BarChart2, Radio, CheckCircle, RefreshCw } from 'lucide-react';
import ProbabilityChart from './ProbabilityChart';

const EMOTION_STYLES = {
  neutral: { bg: 'rgba(148, 163, 184, 0.15)', border: '#94a3b8', color: '#cbd5e1' },
  calm: { bg: 'rgba(56, 189, 248, 0.15)', border: '#38bdf8', color: '#7dd3fc' },
  happy: { bg: 'rgba(234, 179, 8, 0.15)', border: '#eab308', color: '#fde047' },
  sad: { bg: 'rgba(96, 165, 250, 0.15)', border: '#60a5fa', color: '#93c5fd' },
  angry: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', color: '#fca5a5' },
  fearful: { bg: 'rgba(168, 85, 247, 0.15)', border: '#a855f7', color: '#d8b4fe' },
  disgust: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', color: '#6ee7b7' },
  surprised: { bg: 'rgba(249, 115, 22, 0.15)', border: '#f97316', color: '#fdba74' },
};

export default function ResultCard({ result, isAnalyzing, onReset }) {
  if (isAnalyzing) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <BarChart2 className="card-icon" size={20} />
            <h3 className="card-title">Analysis Result</h3>
          </div>
        </div>
        <div className="waiting-state">
          <RefreshCw size={44} className="spinner card-icon" />
          <p className="waiting-title">Analyzing Audio Spectrum...</p>
          <p className="waiting-desc">Extracting MFCC features & evaluating BiLSTM attention network.</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <BarChart2 className="card-icon" size={20} />
            <h3 className="card-title">Analysis Result</h3>
          </div>
        </div>
        <div className="waiting-state">
          <Radio size={48} className="waiting-icon" />
          <p className="waiting-title">Waiting for audio</p>
          <p className="waiting-desc">Record or upload an audio file and click "Analyze Emotion" to view model predictions.</p>
        </div>
      </div>
    );
  }

  const emotionKey = (result.emotion || 'neutral').toLowerCase();
  const styleConfig = EMOTION_STYLES[emotionKey] || EMOTION_STYLES.neutral;
  const confidencePercent = ((result.confidence || 0) * 100).toFixed(2);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <BarChart2 className="card-icon" size={20} />
          <h3 className="card-title">Analysis Result</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#22c55e' }}>
          <CheckCircle size={14} />
          <span>Completed</span>
        </div>
      </div>

      <div className="result-content">
        <div
          className="top-emotion-box"
          style={{
            borderColor: styleConfig.border,
            boxShadow: `0 0 20px ${styleConfig.bg}`,
          }}
        >
          <div className="emotion-meta-row">
            <span className="detected-label">Detected Emotion</span>
            <span
              className="emotion-badge"
              style={{
                backgroundColor: styleConfig.bg,
                borderColor: styleConfig.border,
                color: styleConfig.color,
                border: `1px solid ${styleConfig.border}`,
              }}
            >
              {result.emotion}
            </span>
          </div>

          <div className="confidence-row">
            <div className="confidence-header">
              <span className="confidence-title">Model Confidence</span>
              <span className="confidence-value">{confidencePercent}%</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.max(result.confidence * 100, 2)}%`,
                  background: `linear-gradient(90deg, ${styleConfig.border}, #38bdf8)`,
                }}
              />
            </div>
          </div>
        </div>

        <ProbabilityChart probabilities={result.probabilities} />

        <button type="button" className="reset-btn" onClick={onReset}>
          <RefreshCw size={16} />
          <span>New Analysis</span>
        </button>
      </div>
    </div>
  );
}
