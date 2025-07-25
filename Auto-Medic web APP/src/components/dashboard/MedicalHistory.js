import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Activity, Phone, User, Calendar, MapPin, AlertTriangle } from "lucide-react";
import { getOxiDat, getPaitentsData } from "../data/getdata";

const MedicalHistory = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [vitalHistory, setVitalHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        
        // Fetch patient data
        const patientsResponse = await getPaitentsData();
        const patients = patientsResponse?.data?.data || [];
        const currentPatient = patients.find(p => p._id === patientId);
        
        if (currentPatient) {
          setPatient(currentPatient);
        }

        // Fetch vital signs history
        const oxiResponse = await getOxiDat();
        const oxiData = oxiResponse?.data?.data || [];
        const patientVitals = oxiData
          .filter(oxi => oxi.patientId._id === patientId)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setVitalHistory(patientVitals);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getVitalStatus = (heartRate, oxygenPercentage) => {
    const hr = parseInt(heartRate);
    const oxygen = parseInt(oxygenPercentage);
    
    if (hr > 100 || hr < 60 || oxygen < 95) {
      return { status: "Critical", color: "red", bgColor: "bg-red-50", textColor: "text-red-700" };
    } else if (hr > 90 || oxygen < 98) {
      return { status: "Warning", color: "orange", bgColor: "bg-orange-50", textColor: "text-orange-700" };
    } else {
      return { status: "Normal", color: "green", bgColor: "bg-green-50", textColor: "text-green-700" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Patient Not Found</h2>
          <p className="text-gray-600 mb-4">The requested patient could not be found.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const latestVitals = vitalHistory[0];
  const vitalStatus = latestVitals ? getVitalStatus(latestVitals.heartRate, latestVitals.oxygenPercentage) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Medical History</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {patient.firstName} {patient.lastName}
                </h2>
                <p className="text-gray-600">Age: {calculateAge(patient.dateOfBirth)} years</p>
                <p className="text-gray-600">Patient ID: {patient._id}</p>
              </div>
            </div>
            {vitalStatus && (
              <div className={`px-3 py-1 rounded-full ${vitalStatus.bgColor}`}>
                <span className={`text-sm font-medium ${vitalStatus.textColor}`}>
                  {vitalStatus.status}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Patient Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="h-5 w-5 text-blue-500 mr-2" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-gray-900">{patient.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-gray-900">{patient.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Address</p>
                  <p className="text-gray-900">
                    {patient.address.street}<br />
                    {patient.address.city}, {patient.address.state}<br />
                    {patient.address.zipCode}, {patient.address.country}
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            {patient.patientInfo.emergencyContact.name && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  Emergency Contact
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Name</p>
                    <p className="text-gray-900">{patient.patientInfo.emergencyContact.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Relationship</p>
                    <p className="text-gray-900">{patient.patientInfo.emergencyContact.relationship}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone</p>
                    <p className="text-gray-900">{patient.patientInfo.emergencyContact.phoneNumber}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Medical History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 text-green-500 mr-2" />
                Medical History
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Medical History</p>
                  <p className="text-gray-900">
                    {patient.patientInfo.medicalHistory || "No medical history recorded"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Patient Since</p>
                  <p className="text-gray-900">
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    patient.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {patient.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Vital Signs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Vitals */}
            {latestVitals && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="h-5 w-5 text-red-500 mr-2" />
                  Current Vital Signs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-medium text-red-900">Heart Rate</h4>
                    <p className="text-2xl font-bold text-red-600">
                      {latestVitals.heartRate} BPM
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900">Oxygen Level</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {latestVitals.oxygenPercentage}%
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Last updated: {new Date(latestVitals.timestamp).toLocaleString()}
                </p>
              </div>
            )}

            {/* Vital Signs History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 text-purple-500 mr-2" />
                Vital Signs History
              </h3>
              {vitalHistory.length > 0 ? (
                <div className="space-y-3">
                  {vitalHistory.slice(0, 10).map((vital, index) => {
                    const status = getVitalStatus(vital.heartRate, vital.oxygenPercentage);
                    return (
                      <div key={vital._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <div className="text-sm">
                                <span className="font-medium">HR:</span> {vital.heartRate} BPM
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">O2:</span> {vital.oxygenPercentage}%
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.bgColor} ${status.textColor}`}>
                                {status.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(vital.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {vitalHistory.length > 10 && (
                    <p className="text-sm text-gray-500 text-center mt-4">
                      Showing latest 10 readings out of {vitalHistory.length} total
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>No vital signs data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistory;

