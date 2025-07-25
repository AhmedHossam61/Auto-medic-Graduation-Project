import React from 'react';
import { Activity } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { mockPatients, mockHeartData } from '../data/mockData';
import HeartSignalChart from '../shared/HeartSignalChart';

const PatientDashboard = () => {
  const { user } = useAuth();
  const patientData = mockPatients.find(p => p.id === 1) || {
    name: user?.name || 'Patient',
    age: 30,
    condition: 'General Health',
    lastVisit: '2025-06-02',
    heartRate: 75,
    oxygenPercentage: '120/80'
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome, {patientData.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900">Age</h3>
            <p className="text-2xl font-bold text-blue-600">{patientData.age}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900">Heart Rate</h3>
            <p className="text-2xl font-bold text-green-600">{patientData.heartRate} BPM</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900">BOxygen Percentage</h3>
            <p className="text-2xl font-bold text-purple-600">{patientData.oxygenPercentage}</p>
          </div>
        </div>
      </div>

      <HeartSignalChart data={mockHeartData} />

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 text-blue-500 mr-2" />
          Medical Summary
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Condition:</span>
            <span className="font-medium">{patientData.condition}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Visit:</span>
            <span className="font-medium">{patientData.lastVisit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Stable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;