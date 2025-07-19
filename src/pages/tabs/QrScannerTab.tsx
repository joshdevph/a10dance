/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Dashboard/QrScannerTab.tsx
import { useEffect, useRef, useState } from 'react';
import { Scanner, useDevices, outline } from '@yudiel/react-qr-scanner';
import { databases } from '../../lib/appwrite';

const QrScannerTab = () => {
  const devices = useDevices();
  const [scannerKey, setScannerKey] = useState(0);
  const [qrFeedback, setQrFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const lastScanTimeMap = useRef<Map<string, number>>(new Map());

  const handleScanAndSave = async (rawValue: string) => {
    setQrFeedback(null);
    let parsed: any;
    try {
      parsed = JSON.parse(rawValue);
    } catch {
      setQrFeedback({ type: 'error', message: 'Invalid QR data (not JSON)' });
      setScannerKey(k => k + 1);
      return;
    }

    if (!parsed?.email || !parsed?.name) {
      setQrFeedback({ type: 'error', message: 'QR data missing email or name' });
      setScannerKey(k => k + 1);
      return;
    }

    const now = Date.now();
    const last = lastScanTimeMap.current.get(parsed.email) || 0;
    if (now - last < 2000) {
      setScannerKey(k => k + 1);
      return;
    }
    lastScanTimeMap.current.set(parsed.email, now);

    try {
      const nowISO = new Date().toISOString();
      await databases.createDocument('686db7ef003cad2f3703', '686dbed2001341193519', 'unique()', {
        name: parsed.name,
        email: parsed.email,
        date: nowISO,
        timestamp: nowISO,
      });
      setQrFeedback({ type: 'success', message: `Attendance recorded for ${parsed.name}` });
    } catch (err: any) {
      setQrFeedback({ type: 'error', message: 'Failed to save attendance: ' + (err?.message || 'Unknown error') });
    }
    setScannerKey(k => k + 1);
  };

  useEffect(() => {
    if (qrFeedback) {
      const t = setTimeout(() => setQrFeedback(null), 2000);
      return () => clearTimeout(t);
    }
  }, [qrFeedback]);

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">QR Code Scanner</h2>
      {qrFeedback && (
        <div
          className={`px-4 py-2 rounded mb-2 font-mono text-sm break-all text-center max-w-full ${
            qrFeedback.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {qrFeedback.message}
        </div>
      )}
      <div className="w-full max-w-xs rounded overflow-hidden border border-gray-200 bg-gray-50 shadow flex items-center justify-center aspect-square">
        <Scanner
          key={scannerKey}
          onScan={codes => {
            if (codes.length > 0 && codes[0].rawValue) {
              handleScanAndSave(codes[0].rawValue);
            }
          }}
          onError={err => setQrFeedback({ type: 'error', message: 'Scan error: ' + err })}
          constraints={{
            deviceId: devices[0]?.deviceId,
            facingMode: 'environment',
          }}
          formats={['qr_code']}
          scanDelay={300}
          allowMultiple={false}
          components={{ tracker: outline }}
          styles={{ container: { width: '100%', height: '100%' } }}
        />
      </div>
      <div className="text-xs text-gray-400 text-center">Allow camera access to scan QR codes.</div>
    </div>
  );
};

export default QrScannerTab;
