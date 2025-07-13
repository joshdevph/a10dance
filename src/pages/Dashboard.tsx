/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { databases } from '../lib/appwrite';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Attendance {
  $id: string;
  name: string;
  email: string;
  date: string;
  timestamp: string;
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'quiz' | 'exam'>('attendance');
  const [data, setData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const navigate = useNavigate();

  const { user, logout, loading: authLoading } = useAuth();

  // Protect route: redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
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

        const dateSet = new Set(docs.map((att) => att.date.slice(0, 10)));
        const sortedDates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
        setAvailableDates(sortedDates);
        if (sortedDates.length > 0) setSelectedDate(sortedDates[0]);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      }
      setLoading(false);
    }
    fetchAttendance();
  }, [user]);

  const filteredData = data.filter(
    (att) => att.date?.slice(0, 10) === selectedDate
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
    // Optional: show spinner or loading
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-xl">Loading…</div>
      </div>
    );
  }

  if (!user) return null; // Don't render until user is checked

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 min-h-screen">
      <div className="relative w-full max-w-5xl mx-auto bg-white border border-gray-200 rounded-2xl p-2 sm:p-6 lg:p-10 shadow hover:shadow-2xl transition-shadow flex flex-col gap-6 min-h-[70vh]">
        {/* Logout Button */}
        <button
          onClick={logout}
          className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md font-semibold shadow-sm hover:bg-red-600 transition"
        >
          Logout
        </button>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-2 flex-wrap">
          {['attendance', 'quiz', 'exam'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-lg text-base font-medium transition
                ${activeTab === tab
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-blue-50'
                }`}
              onClick={() => setActiveTab(tab as typeof activeTab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'attendance' && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Attendance List</h2>
            <div className="flex justify-center mb-4">
              <label className="flex items-center gap-2 text-lg text-gray-600">
                Show attendance for:
                <select
                  className="ml-2 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
                  value={selectedDate ?? ''}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={availableDates.length === 0}
                >
                  {availableDates.map((date) => (
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
              <div className="text-center text-gray-400 text-lg">No attendance records for this date.</div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="min-w-full bg-white rounded-lg text-base">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((att) => (
                      <tr
                        key={att.$id}
                        className={att.timestamp && isLate(att.timestamp)
                          ? 'bg-red-50'
                          : ''}
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

        {activeTab === 'quiz' && (
          <div className="py-16 text-center text-gray-400">
            <h2 className="text-xl font-semibold mb-2">Quiz (Coming Soon)</h2>
            <p>Quiz features will be available here.</p>
          </div>
        )}

        {activeTab === 'exam' && (
          <div className="py-16 text-center text-gray-400">
            <h2 className="text-xl font-semibold mb-2">Exam (Coming Soon)</h2>
            <p>Exam features will be available here.</p>
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
