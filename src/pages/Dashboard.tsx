/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { databases } from '../lib/appwrite';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Scanner, useDevices, outline } from '@yudiel/react-qr-scanner';
import { QRCodeSVG } from 'qrcode.react';

interface Attendance {
  $id: string;
  name: string;
  email: string;
  date: string;
  timestamp: string;
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState<
    'attendance' | 'quiz' | 'exam' | 'qrscanner' | 'myqr'
  >('attendance');
  const [data, setData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [qrFeedback, setQrFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [scannerKey, setScannerKey] = useState(0); // <--- Added

  const devices = useDevices();
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();

  // Admin if isAdmin true OR email match
  const isAdmin =
    user?.isAdmin === true || user?.email === 'joshuadignadice24@gmail.com';
  const tabs: Array<'attendance' | 'quiz' | 'exam' | 'qrscanner' | 'myqr'> =
    isAdmin
      ? ['attendance', 'quiz', 'exam', 'qrscanner', 'myqr']
      : ['myqr'];

  // Ensure only My QR tab is open if not admin
  useEffect(() => {
    if (!isAdmin && activeTab !== 'myqr') setActiveTab('myqr');
  }, [isAdmin, activeTab]);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  // Fetch data for attendance tab if admin
  useEffect(() => {
    if (!user || !isAdmin) return;
    async function fetchAttendance() {
      setLoading(true);
      try {
        const dbId = '686db7ef003cad2f3703';
        const collectionId = '686dbed2001341193519';
        const response = await databases.listDocuments(dbId, collectionId);
        const docs = (response.documents as any[])
          .filter(doc => doc.name && doc.email && doc.date && doc.timestamp)
          .map(doc => ({
            $id: doc.$id,
            name: doc.name,
            email: doc.email,
            date: doc.date,
            timestamp: doc.timestamp,
          })) as Attendance[];
        setData(docs);

        const dateSet = new Set(docs.map(att => att.date.slice(0, 10)));
        const sortedDates = Array.from(dateSet).sort((a, b) =>
          b.localeCompare(a)
        );
        setAvailableDates(sortedDates);
        if (sortedDates.length > 0) setSelectedDate(sortedDates[0]);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      }
      setLoading(false);
    }
    fetchAttendance();
  }, [user, isAdmin]);

  // Debounce scanned users for 2 seconds per email
  const lastScanTimeMap = useRef<Map<string, number>>(new Map());

  // Handle saving attendance when QR scanned
  const handleScanAndSave = async (rawValue: string) => {
    setQrFeedback(null);
    let parsed: any = null;
    try {
      parsed = JSON.parse(rawValue);
    } catch {
      setQrFeedback({ type: 'error', message: 'Invalid QR data (not JSON)' });
      setScannerKey(k => k + 1); // reset scanner on error
      return;
    }
    if (!parsed || !parsed.email || !parsed.name) {
      setQrFeedback({ type: 'error', message: 'QR data missing email or name' });
      setScannerKey(k => k + 1); // reset scanner on error
      return;
    }

    // Debounce: allow same user again after 2 seconds
    const now = Date.now();
    const last = lastScanTimeMap.current.get(parsed.email) || 0;
    if (now - last < 2000) {
      setScannerKey(k => k + 1); // reset scanner even if debounce
      return;
    }
    lastScanTimeMap.current.set(parsed.email, now);

    try {
      const dbId = '686db7ef003cad2f3703';
      const collectionId = '686dbed2001341193519';
      // Save attendance
      const nowISO = new Date().toISOString();
      const doc = {
        name: parsed.name,
        email: parsed.email,
        date: nowISO,
        timestamp: nowISO,
      };
      await databases.createDocument(
        dbId,
        collectionId,
        'unique()',
        doc
      );
      setQrFeedback({
        type: 'success',
        message: `Attendance recorded for ${parsed.name}`,
      });
    } catch (err: any) {
      setQrFeedback({
        type: 'error',
        message:
          'Failed to save attendance: ' + (err?.message || 'Unknown error'),
      });
    }
    setScannerKey(k => k + 1); // always reset scanner after scan
  };

  // Auto-clear feedback after 2s
  useEffect(() => {
    if (qrFeedback) {
      const t = setTimeout(() => setQrFeedback(null), 2000);
      return () => clearTimeout(t);
    }
  }, [qrFeedback]);

  const filteredData = data.filter(
    att => att.date?.slice(0, 10) === selectedDate
  );

  function isLate(timestamp: string): boolean {
    if (!timestamp) return false;
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      hour12: false,
      timeZone: 'Asia/Manila',
    };
    const hourStr = date.toLocaleString('en-PH', options);
    const hour = parseInt(hourStr, 10);
    return hour > 8;
  }

  if (authLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-xl">Loading…</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 min-h-screen">
      <div className="relative w-full max-w-5xl bg-white border border-gray-200 rounded-2xl p-2 sm:p-6 lg:p-10 shadow hover:shadow-2xl transition-shadow flex flex-col gap-6 min-h-[70vh]">
        {/* Logout */}
        <button
          onClick={logout}
          className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md font-semibold shadow-sm hover:bg-red-600 transition"
        >
          Logout
        </button>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-2 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-lg text-base font-medium transition
                ${activeTab === tab
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-blue-50'
                }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'qrscanner'
                ? 'QR Scanner'
                : tab === 'myqr'
                  ? 'My QR'
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Attendance Tab (admin only) */}
        {activeTab === 'attendance' && isAdmin && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
              Attendance List
            </h2>
            <div className="flex justify-center mb-4">
              <label className="flex items-center gap-2 text-lg text-gray-600">
                Show attendance for:
                <select
                  className="ml-2 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
                  value={selectedDate ?? ''}
                  onChange={e => setSelectedDate(e.target.value)}
                  disabled={availableDates.length === 0}
                >
                  {availableDates.map(date => (
                    <option value={date} key={date}>
                      {new Date(date).toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {loading ? (
              <div className="text-center text-gray-400 text-lg">Loading…</div>
            ) : error ? (
              <div className="text-center text-red-500 text-lg">{error}</div>
            ) : filteredData.length === 0 ? (
              <div className="text-center text-gray-400 text-lg">
                No attendance records for this date.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="min-w-full bg-white rounded-lg text-base">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(att => (
                      <tr
                        key={att.$id}
                        className={
                          att.timestamp && isLate(att.timestamp)
                            ? 'bg-red-50'
                            : ''
                        }
                      >
                        <td className="px-6 py-3 text-gray-800">{att.name}</td>
                        <td className="px-6 py-3 text-gray-600">{att.email}</td>
                        <td className="px-6 py-3 text-gray-600">
                          {att.date
                            ? new Date(att.date).toLocaleDateString('en-PH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              timeZone: 'Asia/Manila',
                            })
                            : ''}
                        </td>
                        <td className="px-6 py-3 text-gray-600">
                          {att.timestamp
                            ? new Date(att.timestamp).toLocaleTimeString('en-PH', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: true,
                              timeZone: 'Asia/Manila',
                            })
                            : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Quiz Tab (admin only) */}
        {activeTab === 'quiz' && isAdmin && (
          <div className="py-16 text-center text-gray-400">
            <h2 className="text-xl font-semibold mb-2">Quiz (Coming Soon)</h2>
            <p>Quiz features will be available here.</p>
          </div>
        )}

        {/* Exam Tab (admin only) */}
        {activeTab === 'exam' && isAdmin && (
          <div className="py-16 text-center text-gray-400">
            <h2 className="text-xl font-semibold mb-2">Exam (Coming Soon)</h2>
            <p>Exam features will be available here.</p>
          </div>
        )}

        {/* QR Scanner Tab (admin only) */}
        {activeTab === 'qrscanner' && isAdmin && (
          <div className="flex flex-col items-center justify-center py-8 gap-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
              QR Code Scanner
            </h2>
            {qrFeedback && (
              <div
                className={`px-4 py-2 rounded mb-2 font-mono text-sm break-all text-center max-w-full
              ${qrFeedback.type === 'success'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                  }
            `}
              >
                {qrFeedback.message}
              </div>
            )}
            <div className="w-full max-w-xs rounded overflow-hidden border border-gray-200 bg-gray-50 shadow flex items-center justify-center aspect-square">
              <Scanner
                key={scannerKey} // <-- Reset on every scan/feedback
                onScan={codes => {
                  if (codes.length > 0 && codes[0].rawValue) {
                    handleScanAndSave(codes[0].rawValue);
                  }
                }}
                onError={err =>
                  setQrFeedback({
                    type: 'error',
                    message: 'Scan error: ' + err,
                  })
                }
                constraints={{
                  deviceId: devices[0]?.deviceId,
                  facingMode: 'environment',
                }}
                formats={['qr_code']}
                scanDelay={300} // Faster scan, adjust as needed
                allowMultiple={false}
                components={{ tracker: outline }}
                styles={{ container: { width: '100%', height: '100%' } }}
              />
            </div>
            <div className="text-xs text-gray-400 text-center">
              Allow camera access to scan QR codes.
            </div>
          </div>
        )}

        {/* My QR Tab (everyone) */}
        {activeTab === 'myqr' && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">My QR Code</h2>
            <div className="bg-gray-100 p-6 rounded-xl shadow-md flex flex-col items-center">
              <QRCodeSVG
                value={JSON.stringify({
                  id: user.$id,
                  email: user.email,
                  name: user.name,
                })}
                size={210}
                bgColor="#F3F4F6"
                fgColor="#111827"
                level="M"
              />
              <div className="mt-3 text-center text-gray-600">
                <div className="font-medium">{user.name || user.email}</div>
                <div className="text-xs text-gray-400">{user.email}</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 text-center mt-2">
              Let staff scan this QR code for attendance or access.
            </p>
          </div>
        )}
      </div>
      <footer className="fixed bottom-4 w-full flex justify-center text-gray-400 text-xs pointer-events-none">
        <span>Powered by Appwrite + Vite + React</span>
      </footer>
    </div>
  );
}

export default Dashboard;
