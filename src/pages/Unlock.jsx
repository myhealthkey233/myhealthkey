import React, { useState } from 'react';

// Helper: normalize name for credential derivation
function normalizeName(name) {
  const n = name && name.normalize ? name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '') : (name || '');
  const step1 = n.replace(/\s*-\s*/g, '-').replace(/-+/g, '-');
  return step1.trim().replace(/\s+/g, ' ').toLowerCase();
}

export default function UnlockPage(){
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
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
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
      ['decrypt']
    );
  };

  const decryptFile = async () => {
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
      const data = new Uint8Array(arrayBuffer);
      setProgress(30);

      const salt = data.slice(0,16);
      const iv = data.slice(16,28);
      const encryptedData = data.slice(28);
      setProgress(50);

      const key = await deriveKey(fullName, dateOfBirth, pin, salt);
      setProgress(70);

      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, encryptedData);
      setProgress(90);

      const blob = new Blob([decrypted], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.locked', '.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      setSuccess(true);
      setTimeout(()=>{
        setFile(null);
        setFullName('');
        setDateOfBirth('');
        setPin('');
        setProgress(0);
        setSuccess(false);
      },3000);
    }catch(err){
      console.error(err);
      setError('Decryption failed. Please check your credentials and try again.');
      setProgress(0);
    }

    setIsProcessing(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="logo-circle green">
          <svg width="36" height="36" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            {/* Bold hospital cross for header */}
            <rect x="26" y="14" width="12" height="36" rx="2" fill="#fff" />
            <rect x="14" y="26" width="36" height="12" rx="2" fill="#fff" />
          </svg>
        </div>
        <h1>Unlock Patient Data</h1>
        <p>Access encrypted health records with credentials</p>
      </div>

      <div className="card">
        <div className="card-header green">
          <div className="card-title">
            <svg width="18" height="18" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style={{verticalAlign:'middle',marginRight:8}} aria-hidden>
              <rect x="26" y="14" width="12" height="36" rx="2" fill="#fff" />
              <rect x="14" y="26" width="36" height="12" rx="2" fill="#fff" />
            </svg>
            Unlock Encrypted File
          </div>
          <div className="card-sub">Upload locked file and enter access credentials</div>
        </div>
        <div className="card-body">
          <label className="file-upload">
            <input id="file-unlock" type="file" accept=".locked" onChange={handleFileSelect} />
            <div className="upload-box">
              <div className="upload-icon">📥</div>
              <div>
                <div className="upload-title">{file ? file.name : 'Click to upload locked file'}</div>
                <div className="upload-sub">Select your encrypted file</div>
              </div>
            </div>
          </label>

          <div className="credentials">
            <h3>Enter Access Credentials</h3>

            <label className="name-label">Patient Full Name</label>
            <div className="name-row">
              <input
                id="fullNameUnlock"
                className="name-input"
                type="text"
                placeholder="e.g., Kofi Mensah"
                value={fullName}
                onChange={(e)=>setFullName(e.target.value)}
                disabled={isProcessing}
              />
              <button
                type="button"
                className="clear-btn"
                onClick={()=>setFullName('')}
                aria-label="Clear name"
                title="Clear"
                disabled={isProcessing}
              >
                ✕
              </button>
            </div>

            

            <label>Date of Birth
              <input type="date" value={dateOfBirth} onChange={(e)=>setDateOfBirth(e.target.value)} className="" disabled={isProcessing} />
            </label>
            <label>4-Digit PIN Code
              <div className="pin-row">
                <input value={pin} onChange={(e)=>setPin(e.target.value.replace(/\D/g,''))} maxLength={4} type={showPin ? 'text':'password'} placeholder="••••" disabled={isProcessing} />
                <button type="button" className="icon-btn" onClick={()=>setShowPin(!showPin)}>{showPin? '🙈':'👁️'}</button>
              </div>
            </label>
            <p className="hint">Enter the exact credentials used to lock this file</p>
          </div>

          {isProcessing && <div className="progress">Decrypting... {progress}%</div>}
          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">File unlocked successfully! Download started.</div>}

          <button className="primary-btn" onClick={decryptFile} disabled={!file || !fullName || !dateOfBirth || !pin || isProcessing}>Unlock & Download File</button>

          <div className="security">
            <strong>🔒 Secure Decryption</strong>
            <div className="security-sub">All decryption happens on your device. Your credentials and file contents never leave your computer.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
