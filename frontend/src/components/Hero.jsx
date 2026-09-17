import React from 'react';
import { Cpu } from 'lucide-react';

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-badge">
        <Cpu size={14} />
        <span>Deep Learning</span>
      </div>
      <h2 className="hero-title">Understand emotions through speech.</h2>
      <p className="hero-subtitle">
        AI-powered speech emotion recognition using deep learning and LSTM networks.
      </p>
    </section>
  );
}
