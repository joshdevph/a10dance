import React, { useEffect, useState } from 'react';
import { databases } from './lib/appwrite';
import './App.css';

interface Attendance {
  $id: string;
  name: string;
  email: string;
  date: string;
}

function App() {
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
        const docs = response.documents as Attendance[];

        setData(docs);

        // Extract unique YYYY-MM-DD dates that have a record
        const dateSet = new Set(
          docs
            .filter((att) => !!att.date)
            .map((att) => att.date.slice(0, 10))
        );
        const sortedDates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
        setAvailableDates(sortedDates);

        // Default to most recent date if available
        if (sortedDates.length > 0) {
          setSelectedDate(sortedDates[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      }
      setLoading(false);
    }

    fetchAttendance();
  }, []);

  // Only show rows matching selected date
  const filteredData = data.filter(
    (att) => att.date?.slice(0, 10) === selectedDate
  );

  return (
    <div className="attendance-root">
      <div className="attendance-card">
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
                  <th className="col-date">Date/Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((att) => (
                  <tr key={att.$id}>
                    <td className="col-name">{att.name}</td>
                    <td className="col-email">{att.email}</td>
                    <td className="col-date">
                      {att.date
                        ? new Date(att.date).toLocaleString('en-PH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true,
                          })
                        : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
