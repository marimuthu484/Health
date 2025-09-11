import React, { useState } from 'react';
import { User, Search, Filter, Eye, Edit, FileText, Calendar, Phone, Mail, Heart, Activity, Plus, Download, X, Clock } from 'lucide-react';

// Subcomponent: Search & Filter
const SearchFilterBar = ({ searchTerm, setSearchTerm, filterCondition, setFilterCondition }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search patients by name or email..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <select
          className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          value={filterCondition}
          onChange={(e) => setFilterCondition(e.target.value)}
        >
          <option value="all">All Conditions</option>
          <option value="heart">Heart Disease</option>
          <option value="liver">Liver Disease</option>
        </select>
      </div>
    </div>
  </div>
);

// Subcomponent: Patient Card
const PatientCard = ({ patient, onViewDetails }) => {
  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4 mb-4">
        <img src={patient.avatar} alt={patient.name} className="w-16 h-16 rounded-full object-cover" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{patient.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{patient.gender}, {patient.age} years old</p>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(patient.riskLevel)}`}>
            {patient.riskLevel} Risk
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          {patient.condition === 'Heart Disease' ? <Heart className="h-4 w-4 text-red-500" /> : <Activity className="h-4 w-4 text-green-500" />}
          <span className="text-gray-700">{patient.condition}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Last visit: {patient.lastVisit}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>Next: {patient.nextAppointment}</span>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <button
          onClick={() => onViewDetails(patient)}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Eye className="h-4 w-4" />
          <span>View Details</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            <Phone className="h-3 w-3" /><span>Call</span>
          </button>
          <button className="flex items-center justify-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            <Mail className="h-3 w-3" /><span>Email</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);

  const [patients] = useState([
    // ... Your patient objects here
  ]);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCondition = filterCondition === 'all' || patient.condition.toLowerCase().includes(filterCondition.toLowerCase());
    return matchesSearch && matchesCondition;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Patient Management</h2>
          <p className="text-gray-600">View and manage your patient records and medical history</p>
        </div>
        <button className="mt-4 lg:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Add New Patient</span>
        </button>
      </div>

      <SearchFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterCondition={filterCondition}
        setFilterCondition={setFilterCondition}
      />

      {/* Patients List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            onViewDetails={(p) => { setSelectedPatient(p); setShowPatientDetails(true); }}
          />
        ))}
      </div>

      {/* Modal would go here... */}
    </div>
  );
};

export default PatientManagement;
