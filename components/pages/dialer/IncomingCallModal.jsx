// components/IncomingCallModal.jsx
import { Phone, PhoneOff } from 'lucide-react';

export default function IncomingCallModal({
  handleAnswerIncoming,
  handleRejectIncoming
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-blue-600 animate-pulse" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Incoming Call
        </h3>
        <p className="text-gray-600 mb-6">Unknown Number</p>
        <div className="flex space-x-3">
          <button
            onClick={handleRejectIncoming}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <PhoneOff className="w-5 h-5" />
            <span>Decline</span>
          </button>
          <button
            onClick={handleAnswerIncoming}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Phone className="w-5 h-5" />
            <span>Answer</span>
          </button>
        </div>
      </div>
    </div>
  );
}