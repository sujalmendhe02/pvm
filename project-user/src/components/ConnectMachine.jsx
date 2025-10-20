import { useState } from 'react';
import { Printer, Loader2, QrCode } from 'lucide-react';
import QRScanner from './QRScanner';

export default function ConnectMachine({ onConnect }) {
  const [step, setStep] = useState('scan');
  const [machineKey, setMachineKey] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const handleQRScanSuccess = (scannedKey) => {
    setMachineKey(scannedKey);
    setShowScanner(false);
    setStep('userName');
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      setStep('confirm');
    }
  };

  const handleConnect = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/machine/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ machineKey, userName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect to machine');
      }

      onConnect(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = () => {
    setStep('manual');
  };

  const handleBackToScan = () => {
    setMachineKey('');
    setUserName('');
    setStep('scan');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Printer className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">PrintVend</h1>
          <p className="text-gray-600">
            {step === 'scan' && 'Scan QR code to connect'}
            {step === 'userName' && 'Enter your name'}
            {step === 'manual' && 'Enter machine details'}
            {step === 'confirm' && 'Ready to connect'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {step === 'scan' && (
          <div className="space-y-4">
            <button
              onClick={() => setShowScanner(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-4 rounded-lg transition flex items-center justify-center space-x-3"
            >
              <QrCode className="w-6 h-6" />
              <span>Scan QR Code</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button
              onClick={handleManualEntry}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition"
            >
              Enter Machine Key Manually
            </button>
          </div>
        )}

        {step === 'manual' && (
          <form onSubmit={handleNameSubmit} className="space-y-6">
            <div>
              <label htmlFor="machineKey" className="block text-sm font-medium text-gray-700 mb-2">
                Machine Key
              </label>
              <input
                id="machineKey"
                type="text"
                value={machineKey}
                onChange={(e) => setMachineKey(e.target.value.toUpperCase())}
                placeholder="ABCD1234"
                required
                maxLength={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono text-lg tracking-wider text-center"
              />
            </div>

            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleBackToScan}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                Next
              </button>
            </div>
          </form>
        )}

        {step === 'userName' && (
          <form onSubmit={handleNameSubmit} className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800">
                <strong>Machine Connected:</strong> {machineKey}
              </p>
            </div>

            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                required
                autoFocus
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleBackToScan}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                Next
              </button>
            </div>
          </form>
        )}

        {step === 'confirm' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div>
                <p className="text-sm text-blue-600 font-medium">Name</p>
                <p className="text-blue-900 font-semibold">{userName}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Machine Key</p>
                <p className="text-blue-900 font-mono font-semibold">{machineKey}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleBackToScan}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition"
              >
                Back
              </button>
              <button
                onClick={handleConnect}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <span>Connect</span>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Scan the QR code displayed on any PrintVend machine to get started!</p>
        </div>
      </div>

      {showScanner && (
        <QRScanner
          onScanSuccess={handleQRScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
