// src/components/Dashboard/MyQrTab.tsx
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../contexts/AuthContext';

const MyQrTab = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
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
  );
};

export default MyQrTab;
