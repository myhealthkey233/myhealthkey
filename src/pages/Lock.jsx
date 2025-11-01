import React, { useState } from 'react';

// Helper: normalize name for credential derivation
function normalizeName(name) {
  const n = name && name.normalize ? name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '') : (name || '');
  const step1 = n.replace(/\s*-\s*/g, '-').replace(/-+/g, '-');
  return step1.trim().replace(/\s+/g, ' ').toLowerCase();
}

function IconShield() {
  return (
    <svg width="28" height="28" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {/* Bold hospital cross for the lock header — matches favicon */}
      <rect x="26" y="14" width="12" height="36" rx="2" fill="#fff" />
      <rect x="14" y="26" width="36" height="12" rx="2" fill="#fff" />
    </svg>
    );
}

export default function LockPage() {
  const [file, setFile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const deriveKey = async (name, dob, pinCode, salt) => {
    const cleanName = normalizeName(name);
    const credentials = `${cleanName}|${dob}|${pinCode}`;
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(credentials),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: salt, iterations: 200000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
  };

  const encryptFile = async () => {
    if (!file || !fullName || !dateOfBirth || !pin) {
      setError('Please fill in all fields');
      return;
    }
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      setProgress(30);

      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      setProgress(40);

      const key = await deriveKey(fullName, dateOfBirth, pin, salt);
      setProgress(60);

      const encryptedData = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, arrayBuffer);
      setProgress(80);

      const resultArray = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
      resultArray.set(salt, 0);
      resultArray.set(iv, salt.length);
      resultArray.set(new Uint8Array(encryptedData), salt.length + iv.length);

      const blob = new Blob([resultArray], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}.locked`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      setSuccess(true);

      setTimeout(() => {
        setFile(null);
        setFullName('');
        setDateOfBirth('');
        setPin('');
        setProgress(0);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      setError('Encryption failed.');
    }

    setIsProcessing(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="logo-circle"><IconShield /></div>
        <h1>Secure Patient Data</h1>
        <p>Encrypt health records with personal credentials</p>
      </div>

      <div className="card">
        <div className="card-header blue">
          <div className="card-title">🔒 Lock PDF File</div>
          <div className="card-sub">Upload a PDF and set access credentials</div>
        </div>

        <div className="card-body">
          <label className="file-upload">
            <input id="file" type="file" accept=".pdf" onChange={handleFileSelect} />
            <div className="upload-box">
              <div className="upload-icon">📤</div>
              <div>
                <div className="upload-title">{file ? file.name : 'Click to upload PDF'}</div>
                <div className="upload-sub">Patient health records</div>
              </div>
            </div>
            {/* hint intentionally hidden as requested by user */}
          </label>

          <div className="credentials">
            <h3>Access Credentials</h3>

            {/* Modern full name input: larger, with clear button and nicer focus */}
            <label className="name-label">Patient Full Name</label>
            <div className="name-row">
              <input
                id="fullName"
                className="name-input"
                type="text"
                placeholder="e.g., Kofi Mensah"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isProcessing}
              />
              <button
                type="button"
                className="clear-btn"
                onClick={() => setFullName('')}
                aria-label="Clear name"
                title="Clear"
                disabled={isProcessing}
              >
                ✕
              </button>
            </div>

            

            <label>Date of Birth
              <input type="date" value={dateOfBirth} onChange={(e)=>setDateOfBirth(e.target.value)} disabled={isProcessing} />
            </label>

            <label>4-Digit PIN Code
              <div className="pin-row">
                <input
                  value={pin}
                  onChange={(e)=>setPin(e.target.value.replace(/\D/g,''))}
                  maxLength={4}
                  type={showPin ? 'text':'password'}
                  placeholder="••••"
                  disabled={isProcessing}
                />
                <button type="button" className="icon-btn" onClick={()=>setShowPin(!showPin)}>{showPin? '🙈':'👁️'}</button>
              </div>
            </label>
            <p className="hint">Remember these credentials - they cannot be recovered</p>
          </div>

          {isProcessing && (
            <div className="progress">Encrypting... {progress}%</div>
          )}

          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">File encrypted successfully! Download started.</div>}

          <button className="primary-btn" onClick={encryptFile} disabled={!file || !fullName || !dateOfBirth || !pin || isProcessing}>Lock & Download File</button>

          <div className="security">
            <strong>⚠️ Important Security Notice</strong>
            <div className="security-sub">The credentials you set cannot be recovered. Store them securely. Without the exact full name, date of birth, and PIN, the file cannot be unlocked.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
