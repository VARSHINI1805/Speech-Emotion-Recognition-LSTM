import React from 'react';

const EMOTION_COLORS = {
  neutral: { bar: '#94a3b8', text: '#cbd5e1' },
  calm: { bar: '#38bdf8', text: '#7dd3fc' },
  happy: { bar: '#eab308', text: '#fde047' },
  sad: { bar: '#60a5fa', text: '#93c5fd' },
  angry: { bar: '#ef4444', text: '#fca5a5' },
  fearful: { bar: '#a855f7', text: '#d8b4fe' },
  disgust: { bar: '#10b981', text: '#6ee7b7' },
  surprised: { bar: '#f97316', text: '#fdba74' },
};

export default function ProbabilityChart({ probabilities = {} }) {
  // All 8 RAVDESS emotions fallback if missing
  const allEmotions = [
    'neutral',
    'calm',
    'happy',
    'sad',
    'angry',
    'fearful',
    'disgust',
    'surprised',
  ];

  // Map each emotion with probability value and sort descending
  const sortedProbabilities = allEmotions
    .map((emotion) => {
      const val = probabilities[emotion] ?? 0;
      return {
        name: emotion,
        prob: val,
        percentage: (val * 100).toFixed(2),
      };
    })
    .sort((a, b) => b.prob - a.prob);


  return (
    <div className="probabilities-section">
      <h4 className="probabilities-title">Probability Distribution</h4>
      <div className="prob-list">
        {sortedProbabilities.map((item, index) => {
          const colorConfig = EMOTION_COLORS[item.name.toLowerCase()] || {
            bar: '#38bdf8',
            text: '#94a3b8',
          };
          const isTop = index === 0;

          return (
            <div key={item.name} className="prob-item">
              <div className="prob-meta">
                <span className={`prob-name ${isTop ? 'top' : ''}`}>
                  {item.name}
                </span>
                <span className={`prob-percentage ${isTop ? 'top' : ''}`}>
                  {item.percentage}%
                </span>
              </div>
              <div className="prob-bar-track">
                <div
                  className="prob-bar-fill"
                  style={{
                    width: `${Math.max(item.prob * 100, 1.5)}%`,
                    backgroundColor: colorConfig.bar,
                    boxShadow: isTop ? `0 0 10px ${colorConfig.bar}80` : 'none',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
