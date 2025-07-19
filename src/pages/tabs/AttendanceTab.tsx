/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Dashboard/AttendanceTab.tsx
import { useEffect, useState } from 'react';
import { databases } from '../../lib/appwrite';

interface Attendance {
  $id: string;
  name: string;
  email: string;
  date: string;
  timestamp: string;
}

function isLate(timestamp: string): boolean {
  const date = new Date(timestamp);
  const hour = date.toLocaleString('en-PH', {
    hour: '2-digit',
    hour12: false,
    timeZone: 'Asia/Manila',
  });
  return parseInt(hour, 10) > 8;
}

const AttendanceTab = () => {
  const [data, setData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  useEffect(() => {
    const fetchAttendance = async () => {
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
        const sortedDates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
        setAvailableDates(sortedDates);
        if (sortedDates.length > 0) setSelectedDate(sortedDates[0]);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      }
      setLoading(false);
    };
    fetchAttendance();
  }, []);

  const filteredData = data.filter(att => att.date?.slice(0, 10) === selectedDate);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Attendance List</h2>
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
              {filteredData.map(att => (
                <tr key={att.$id} className={att.timestamp && isLate(att.timestamp) ? 'bg-red-50' : ''}>
                  <td className="px-6 py-3 text-gray-800">{att.name}</td>
                  <td className="px-6 py-3 text-gray-600">{att.email}</td>
                  <td className="px-6 py-3 text-gray-600">
                    {new Date(att.date).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      timeZone: 'Asia/Manila',
                    })}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {new Date(att.timestamp).toLocaleTimeString('en-PH', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true,
                      timeZone: 'Asia/Manila',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceTab;