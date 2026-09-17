import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Volume2, AlertCircle } from 'lucide-react';

// Helper function to encode AudioBuffer into 16-bit PCM WAV Blob
function audioBufferToWav(buffer) {
  const numChannels = 1; // Mono
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  // Use channel 0 (mono) or average channels if stereo
  let channelData;
  if (buffer.numberOfChannels > 1) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    channelData = new Float32Array(left.length);
    for (let i = 0; i < left.length; i++) {
      channelData[i] = (left[i] + right[i]) / 2;
    }
  } else {
    channelData = buffer.getChannelData(0);
  }

  const numSamples = channelData.length;
  const dataByteLength = numSamples * (bitDepth / 8);
  const headerByteLength = 44;
  const totalByteLength = headerByteLength + dataByteLength;

  const arrayBuffer = new ArrayBuffer(totalByteLength);
  const view = new DataView(arrayBuffer);

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  /* RIFF header */
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataByteLength, true);
  writeString(view, 8, 'WAVE');

  /* FMT header */
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true); // ByteRate
  view.setUint16(32, numChannels * (bitDepth / 8), true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  /* DATA header */
  writeString(view, 36, 'data');
  view.setUint32(40, dataByteLength, true);

  /* Write PCM samples */
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

export default function VoiceRecorder({ onAudioSelected, recordedFile, onClearAudio }) {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [permissionError, setPermissionError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const timerRef = useRef(null);


  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setPermissionError(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      let mimeType = '';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      const options = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const rawBlob = new Blob(audioChunksRef.current, {
          type: mimeType || 'audio/webm',
        });

        try {
          // Decode raw recorded audio into PCM AudioBuffer using Web Audio API
          const arrayBuffer = await rawBlob.arrayBuffer();
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          const audioCtx = new AudioContextClass();
          const decodedAudioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

          // Encode AudioBuffer to standard 16-bit PCM WAV Blob
          const wavBlob = audioBufferToWav(decodedAudioBuffer);
          await audioCtx.close();

          const wavFile = new File([wavBlob], 'recorded_speech.wav', {
            type: 'audio/wav',
            lastModified: Date.now(),
          });

          const url = URL.createObjectURL(wavBlob);
          setAudioUrl(url);
          onAudioSelected(wavFile);
        } catch (decodeErr) {
          console.warn('AudioContext decode failed, sending raw blob:', decodeErr);
          // Fallback to sending raw blob formatted as wav if browser decoding fails
          const fallbackFile = new File([rawBlob], 'recorded_speech.wav', {
            type: 'audio/wav',
            lastModified: Date.now(),
          });
          const url = URL.createObjectURL(rawBlob);
          setAudioUrl(url);
          onAudioSelected(fallbackFile);
        }

        // Stop all audio stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTimer(0);

      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Microphone permission was denied. Please allow microphone access in your browser.');
      } else if (err.name === 'NotFoundError') {
        setPermissionError('No microphone input device was found on your system.');
      } else {
        setPermissionError(`Failed to access microphone: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setTimer(0);
    onClearAudio();
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="recorder-container">
      {permissionError && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{permissionError}</span>
        </div>
      )}

      {!recordedFile ? (
        <>
          <div className="mic-button-wrapper">
            {!isRecording ? (
              <button
                type="button"
                className="mic-btn idle"
                onClick={startRecording}
                title="Start Recording"
              >
                <Mic size={32} />
              </button>
            ) : (
              <button
                type="button"
                className="mic-btn recording"
                onClick={stopRecording}
                title="Stop Recording"
              >
                <Square size={28} />
              </button>
            )}
          </div>

          <div className="timer-display">
            {formatTimer(timer)}
          </div>

          {isRecording ? (
            <div className="waveform-container">
              <span className="wave-bar" style={{ animationDelay: '0s' }}></span>
              <span className="wave-bar" style={{ animationDelay: '0.2s' }}></span>
              <span className="wave-bar" style={{ animationDelay: '0.4s' }}></span>
              <span className="wave-bar" style={{ animationDelay: '0.1s' }}></span>
              <span className="wave-bar" style={{ animationDelay: '0.3s' }}></span>
            </div>
          ) : (
            <p className="upload-text-sub">
              Click the microphone button to record audio from your voice
            </p>
          )}
        </>
      ) : (
        <div className="audio-preview-card">
          <div className="audio-preview-header">
            <div className="audio-file-info">
              <Volume2 size={18} className="upload-icon" />
              <span>{recordedFile.name}</span>
            </div>
            <button
              type="button"
              className="clear-btn"
              onClick={clearRecording}
              title="Remove recording"
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
