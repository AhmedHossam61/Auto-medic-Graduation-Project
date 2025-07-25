import React, { useState, useEffect } from "react";
import {
  Users,
  ArrowLeft,
  Heart,
  Activity,
  Phone,
  User,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { mockHeartData } from "../data/mockData";
import HeartSignalChart from "../shared/HeartSignalChart";
import { getOxiDat, getPaitentsData } from "../data/getdata";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [oxiData, setOxiData] = useState([]);
  const [patients, setPatients] = useState([]);
  const [mergedPatientData, setMergedPatientData] = useState([]);
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [vitalHistory, setVitalHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getOxiDat();
      if (data && data.data && data.data.data) {
        setOxiData(data.data.data);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      const data = await getPaitentsData();
      if (data && data.data && data.data.data) {
        setPatients(data.data.data);
      }
    };
    fetchPatients();
  }, []);

  // Merge patient data with oxi data
  useEffect(() => {
    if (patients && patients.length > 0 && oxiData && oxiData.length > 0) {
      const merged = patients.map((patient) => {
        const patientOxiData = oxiData
          .filter((oxi) => oxi.patientId._id === patient._id)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

        return {
          id: patient._id,
          name: `${patient.firstName} ${patient.lastName}`,
          age: calculateAge(patient.dateOfBirth),
          email: patient.email,
          phoneNumber: patient.phoneNumber,
          address: patient.address,
          condition: patient.patientInfo.medicalHistory || "No medical history",
          heartRate: patientOxiData ? patientOxiData.heartRate : "N/A",
          oxygenPercentage: patientOxiData
            ? patientOxiData.oxygenPercentage
            : "N/A",
          lastUpdate: patientOxiData
            ? new Date(patientOxiData.timestamp).toLocaleString()
            : "No data",
          emergencyContact: patient.patientInfo.emergencyContact,
          active: patient.active,
          createdAt: patient.createdAt,
          patientData: patient, // Store original patient data
        };
      });
      setMergedPatientData(merged);
    } else if (patients && patients.length > 0) {
      const merged = patients.map((patient) => ({
        id: patient._id,
        name: `${patient.firstName} ${patient.lastName}`,
        age: calculateAge(patient.dateOfBirth),
        email: patient.email,
        phoneNumber: patient.phoneNumber,
        address: patient.address,
        condition: patient.patientInfo.medicalHistory || "No medical history",
        heartRate: "N/A",
        oxygenPercentage: "N/A",
        lastUpdate: "No data",
        emergencyContact: patient.patientInfo.emergencyContact,
        active: patient.active,
        createdAt: patient.createdAt,
        patientData: patient,
      }));
      setMergedPatientData(merged);
    }
  }, [patients, oxiData]);

  // Fetch vital history when showing medical history
  useEffect(() => {
    if (showMedicalHistory && selectedPatient && oxiData.length > 0) {
      const patientVitals = oxiData
        .filter((oxi) => oxi.patientId._id === selectedPatient.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setVitalHistory(patientVitals);
    }
  }, [showMedicalHistory, selectedPatient, oxiData]);

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const getVitalStatus = (heartRate, oxygenPercentage) => {
    if (heartRate === "N/A" || oxygenPercentage === "N/A") {
      return {
        status: "unknown",
        color: "gray",
        bgColor: "bg-gray-50",
        textColor: "text-gray-700",
      };
    }

    const hr = parseInt(heartRate);
    const oxygen = parseInt(oxygenPercentage);

    if (hr > 100 || hr < 60 || oxygen < 95) {
      return {
        status: "critical",
        color: "red",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
      };
    } else if (hr > 90 || oxygen < 98) {
      return {
        status: "warning",
        color: "orange",
        bgColor: "bg-orange-50",
        textColor: "text-orange-700",
      };
    } else {
      return {
        status: "normal",
        color: "green",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
      };
    }
  };

  const handleViewMedicalHistory = () => {
    if (selectedPatient) {
      setShowMedicalHistory(true);
    }
  };

  const handleBackToDashboard = () => {
    setShowMedicalHistory(false);
  };

  // Medical History View
  if (showMedicalHistory && selectedPatient) {
    const latestVitals = vitalHistory[0];
    const vitalStatus = latestVitals
      ? getVitalStatus(latestVitals.heartRate, latestVitals.oxygenPercentage)
      : null;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={handleBackToDashboard}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Dashboard
                </button>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Medical History
              </h1>
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
                    {selectedPatient.name}
                  </h2>
                  <p className="text-gray-600">
                    Age: {selectedPatient.age} years
                  </p>
                  <p className="text-gray-600">
                    Patient ID: {selectedPatient.id}
                  </p>
                </div>
              </div>
              {vitalStatus && (
                <div
                  className={`px-3 py-1 rounded-full ${vitalStatus.bgColor}`}
                >
                  <span
                    className={`text-sm font-medium ${vitalStatus.textColor} capitalize`}
                  >
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
                    <p className="text-gray-900">{selectedPatient.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone</p>
                    <p className="text-gray-900">
                      {selectedPatient.phoneNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Address</p>
                    <p className="text-gray-900">
                      {selectedPatient.address.street}
                      <br />
                      {selectedPatient.address.city},{" "}
                      {selectedPatient.address.state}
                      <br />
                      {selectedPatient.address.zipCode},{" "}
                      {selectedPatient.address.country}
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              {selectedPatient.emergencyContact.name && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    Emergency Contact
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Name</p>
                      <p className="text-gray-900">
                        {selectedPatient.emergencyContact.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Relationship
                      </p>
                      <p className="text-gray-900">
                        {selectedPatient.emergencyContact.relationship}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone</p>
                      <p className="text-gray-900">
                        {selectedPatient.emergencyContact.phoneNumber}
                      </p>
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
                    <p className="text-sm font-medium text-gray-700">
                      Medical History
                    </p>
                    <p className="text-gray-900">{selectedPatient.condition}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Patient Since
                    </p>
                    <p className="text-gray-900">
                      {new Date(selectedPatient.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedPatient.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedPatient.active ? "Active" : "Inactive"}
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
                      <h4 className="font-medium text-blue-900">
                        Oxygen Level
                      </h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {latestVitals.oxygenPercentage}%
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Last updated:{" "}
                    {new Date(latestVitals.timestamp).toLocaleString()}
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
                      const status = getVitalStatus(
                        vital.heartRate,
                        vital.oxygenPercentage
                      );
                      return (
                        <div key={vital._id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-4">
                                <div className="text-sm">
                                  <span className="font-medium">HR:</span>{" "}
                                  {vital.heartRate} BPM
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">O2:</span>{" "}
                                  {vital.oxygenPercentage}%
                                </div>
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${status.bgColor} ${status.textColor} capitalize`}
                                >
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
                        Showing latest 10 readings out of {vitalHistory.length}{" "}
                        total
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
  }

  // Dashboard View (Default)
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Doctor Dashboard - Welcome, {user?.firstName}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900">Total Patients</h3>
            <p className="text-2xl font-bold text-blue-600">
              {mergedPatientData.length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900">Active Patients</h3>
            <p className="text-2xl font-bold text-green-600">
              {mergedPatientData.filter((p) => p.active).length}
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="font-semibold text-orange-900">Critical Vitals</h3>
            <p className="text-2xl font-bold text-orange-600">
              {
                mergedPatientData.filter(
                  (p) =>
                    getVitalStatus(p.heartRate, p.oxygenPercentage).status ===
                    "critical"
                ).length
              }
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 text-blue-500 mr-2" />
            Patient List
          </h3>
          <div className="space-y-3">
            {mergedPatientData.length > 0 ? (
              mergedPatientData.map((patient) => {
                const vitalStatus = getVitalStatus(
                  patient.heartRate,
                  patient.oxygenPercentage
                );
                return (
                  <div
                    key={patient.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPatient?.id === patient.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {patient.name}
                          </h4>
                          <div
                            className={`w-3 h-3 rounded-full bg-${vitalStatus.color}-500`}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600">
                          Age: {patient.age}
                        </p>
                        <p className="text-sm text-gray-600">
                          {patient.condition}
                        </p>
                        <p className="text-xs text-gray-500">
                          Last update: {patient.lastUpdate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          HR:{" "}
                          <span
                            className={`font-semibold text-${vitalStatus.color}-600`}
                          >
                            {patient.heartRate}{" "}
                            {patient.heartRate !== "N/A" ? "BPM" : ""}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          O2:{" "}
                          <span
                            className={`font-semibold text-${vitalStatus.color}-600`}
                          >
                            {patient.oxygenPercentage}{" "}
                            {patient.oxygenPercentage !== "N/A" ? "%" : ""}
                          </span>
                        </p>
                        <p
                          className={`text-xs font-medium text-${vitalStatus.color}-600 capitalize`}
                        >
                          {vitalStatus.status}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>Loading patient data...</p>
              </div>
            )}
          </div>
        </div>

        {selectedPatient && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Patient Details - {selectedPatient.name}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-700">Heart Rate</h4>
                  <p className="text-xl font-bold text-red-600">
                    {selectedPatient.heartRate}{" "}
                    {selectedPatient.heartRate !== "N/A" ? "BPM" : ""}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-700">Oxygen Level</h4>
                  <p className="text-xl font-bold text-blue-600">
                    {selectedPatient.oxygenPercentage}{" "}
                    {selectedPatient.oxygenPercentage !== "N/A" ? "%" : ""}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-700">
                  Contact Information
                </h4>
                <p className="text-sm text-gray-600">
                  Email: {selectedPatient.email}
                </p>
                <p className="text-sm text-gray-600">
                  Phone: {selectedPatient.phoneNumber}
                </p>
                <p className="text-sm text-gray-600">
                  Address: {selectedPatient.address.street},{" "}
                  {selectedPatient.address.city},{" "}
                  {selectedPatient.address.state}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-700">Medical History</h4>
                <p className="text-lg">{selectedPatient.condition}</p>
              </div>

              {selectedPatient.emergencyContact.name && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-700">
                    Emergency Contact
                  </h4>
                  <p className="text-sm text-gray-600">
                    Name: {selectedPatient.emergencyContact.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Relationship:{" "}
                    {selectedPatient.emergencyContact.relationship}
                  </p>
                  <p className="text-sm text-gray-600">
                    Phone: {selectedPatient.emergencyContact.phoneNumber}
                  </p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-700">Last Data Update</h4>
                <p className="text-lg">{selectedPatient.lastUpdate}</p>
              </div>

              <button
                onClick={handleViewMedicalHistory}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Full Medical History
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedPatient && <HeartSignalChart data={mockHeartData} />}
    </div>
  );
};

export default DoctorDashboard;
