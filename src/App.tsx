/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { databases } from './lib/appwrite';
import './App.css';

interface Attendance {
  $id: string;
  name: string;
  email: string;
  date: string;
  timestamp: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'quiz' | 'exam'>('attendance');
  const [data, setData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  useEffect(() => {
    async function fetchAttendance() {
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
            timestamp: doc.timestamp, // THIS LINE IS IMPORTANT
          })) as Attendance[];

        setData(docs);

        const dateSet = new Set(
          docs.map((att) => att.date.slice(0, 10))
        );
        const sortedDates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
        setAvailableDates(sortedDates);
        if (sortedDates.length > 0) setSelectedDate(sortedDates[0]);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      }
      setLoading(false);
    }
    fetchAttendance();
  }, []);

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
  return (
    <div className="attendance-root">
      <div className="attendance-card">
        <div className="floating-tabs">
          <button
            className={activeTab === 'attendance' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('attendance')}
          >
            Attendance
          </button>
          <button
            className={activeTab === 'quiz' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('quiz')}
          >
            Quiz
          </button>
          <button
            className={activeTab === 'exam' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('exam')}
          >
            Exam
          </button>
        </div>

        {activeTab === 'attendance' && (
          <>
            <h2 className="attendance-title">Attendance List</h2>
            <div className="attendance-filter">
              <label>
                Show attendance for:{' '}
                <select
                  className="attendance-date-select"
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
              <div className="attendance-loading">Loading…</div>
            ) : error ? (
              <div className="attendance-error">{error}</div>
            ) : filteredData.length === 0 ? (
              <div className="attendance-loading">No attendance records for this date.</div>
            ) : (
              <div className="attendance-table-container">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th className="col-name">Name</th>
                      <th className="col-email">Email</th>
                      <th className="col-date">Date</th>
                      <th className="col-time">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((att) => (
                      <tr
                        key={att.$id}
                        className={att.timestamp && isLate(att.timestamp) ? 'attendance-row-late' : ''}
                      >
                        <td className="col-name" data-label="Name">{att.name}</td>
                        <td className="col-email" data-label="Email">{att.email}</td>
                        <td className="col-date" data-label="Date">
                          {att.date
                            ? new Date(att.date).toLocaleDateString('en-PH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                timeZone: 'Asia/Manila',
                              })
                            : ''}
                        </td>
                        <td className="col-date" data-label="Time">
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
          <div style={{ padding: 40, textAlign: 'center' }}>
            <h2 className="attendance-title">Quiz (Coming Soon)</h2>
            <p style={{ color: '#888', marginTop: 24 }}>
              Quiz features will be available here.
            </p>
          </div>
        )}

        {activeTab === 'exam' && (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <h2 className="attendance-title">Exam (Coming Soon)</h2>
            <p style={{ color: '#888', marginTop: 24 }}>
              Exam features will be available here.
            </p>
          </div>
        )}
      </div>
      <footer className="attendance-footer">
        <span>Powered by Appwrite + Vite + React</span>
      </footer>
    </div>
  );
}

export default App;
