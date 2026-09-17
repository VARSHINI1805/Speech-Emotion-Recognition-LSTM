import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import VoiceRecorder from './components/VoiceRecorder';
import AudioUpload from './components/AudioUpload';
import ResultCard from './components/ResultCard';
import Footer from './components/Footer';
import { Mic, Upload, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import './App.css';


const BACKEND_URL = 'http://127.0.0.1:5000';

export default function App() {
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(true);

  const [inputMode, setInputMode] = useState('record'); // 'record' | 'upload'
  const [audioFile, setAudioFile] = useState(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Check Backend Health Status
  const checkHealth = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        cache: 'no-store'
      });
      if (response.ok) {
        setIsBackendOnline(true);
      } else {
        setIsBackendOnline(false);
      }
    } catch (err) {
      setIsBackendOnline(false);
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleAudioSelected = (file) => {
    setAudioFile(file);
    setErrorMessage(null);
  };

  const handleClearAudio = () => {
    setAudioFile(null);
    setResult(null);
    setErrorMessage(null);
  };

  const handleReset = () => {
    setAudioFile(null);
    setResult(null);
    setErrorMessage(null);
  };

  const handleAnalyze = async () => {
    if (!audioFile) {
      setErrorMessage('Please record or upload an audio file first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setResult(null);

    const formData = new FormData();
    formData.append('audio', audioFile);

    try {
      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Prediction failed. Please try again.');
      }

      setResult(data);
    } catch (err) {
      console.error('Prediction Error:', err);
      if (err.message.includes('Failed to fetch')) {
        setErrorMessage('Unable to connect to Flask backend at http://127.0.0.1:5000. Please ensure python app.py is running.');
      } else {
        setErrorMessage(err.message || 'An error occurred during emotion analysis.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="app-container">
      <Header isBackendOnline={isBackendOnline} checkingHealth={checkingHealth} />

      <main className="content-wrapper">
        <Hero />

        <div className="dashboard-grid">
          {/* LEFT CARD: Voice Input */}
          <div className="card">
            <div className="card-header">
              <div className="card-title-group">
                <Mic className="card-icon" size={20} />
                <h3 className="card-title">Voice Input</h3>
              </div>
            </div>

            {/* Input Mode Selector Tabs */}
            <div className="input-tabs">
              <button
                type="button"
                className={`tab-btn ${inputMode === 'record' ? 'active' : ''}`}
                onClick={() => setInputMode('record')}
              >
                <Mic size={16} />
                <span>Record Audio</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${inputMode === 'upload' ? 'active' : ''}`}
                onClick={() => setInputMode('upload')}
              >
                <Upload size={16} />
                <span>Upload File</span>
              </button>
            </div>

            {/* Selected Input Mode View */}
            {inputMode === 'record' ? (
              <VoiceRecorder
                onAudioSelected={handleAudioSelected}
                recordedFile={audioFile}
                onClearAudio={handleClearAudio}
              />
            ) : (
              <AudioUpload
                onAudioSelected={handleAudioSelected}
                selectedFile={audioFile}
                onClearAudio={handleClearAudio}
              />
            )}

            {/* Error Message Banner if present */}
            {errorMessage && (
              <div className="error-banner">
                <AlertTriangle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Analyze Action Button */}
            <button
              type="button"
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={!audioFile || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="spinner" size={18} />
                  <span>Analyzing Emotion...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Analyze Emotion</span>
                </>
              )}
            </button>
          </div>

          {/* RIGHT CARD: Analysis Result */}
          <ResultCard
            result={result}
            isAnalyzing={isAnalyzing}
            onReset={handleReset}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
