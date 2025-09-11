import React, { useState } from 'react';
import { 
  FileText, Plus, Search, Filter, Edit, Trash2, Download, Send, 
  Clock, Pill, AlertCircle, X 
} from 'lucide-react';

const PrescriptionManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [prescriptionForm, setPrescriptionForm] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    refills: 0
  });

  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      patient: {
        name: 'John Smith',
        age: 45,
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
      },
      medication: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      duration: '30 days',
      instructions: 'Take with food in the morning',
      refills: 2,
      dateIssued: '2025-01-15',
      status: 'active',
      condition: 'Hypertension'
    },
    {
      id: 2,
      patient: {
        name: 'Sarah Wilson',
        age: 38,
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
      },
      medication: 'Ursodiol',
      dosage: '300mg',
      frequency: 'Twice daily',
      duration: '60 days',
      instructions: 'Take with meals, morning and evening',
      refills: 1,
      dateIssued: '2025-01-10',
      status: 'active',
      condition: 'Liver Disease'
    },
    {
      id: 3,
      patient: {
        name: 'Michael Johnson',
        age: 52,
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
      },
      medication: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once daily',
      duration: '90 days',
      instructions: 'Take at bedtime',
      refills: 3,
      dateIssued: '2025-01-08',
      status: 'pending',
      condition: 'High Cholesterol'
    },
    {
      id: 4,
      patient: {
        name: 'Emily Davis',
        age: 29,
        avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
      },
      medication: 'Aspirin',
      dosage: '81mg',
      frequency: 'Once daily',
      duration: '30 days',
      instructions: 'Take with food to prevent stomach upset',
      refills: 0,
      dateIssued: '2025-01-05',
      status: 'completed',
      condition: 'Preventive Care'
    }
  ]);

  const patients = [
    { id: 1, name: 'John Smith', condition: 'Heart Disease' },
    { id: 2, name: 'Sarah Wilson', condition: 'Liver Disease' },
    { id: 3, name: 'Michael Johnson', condition: 'Heart Disease' },
    { id: 4, name: 'Emily Davis', condition: 'Preventive Care' }
  ];

  const commonMedications = [
    { name: 'Lisinopril', dosages: ['5mg', '10mg', '20mg'], condition: 'Hypertension' },
    { name: 'Atorvastatin', dosages: ['10mg', '20mg', '40mg'], condition: 'High Cholesterol' },
    { name: 'Metformin', dosages: ['500mg', '850mg', '1000mg'], condition: 'Diabetes' },
    { name: 'Ursodiol', dosages: ['250mg', '300mg', '500mg'], condition: 'Liver Disease' },
    { name: 'Aspirin', dosages: ['81mg', '325mg'], condition: 'Cardiovascular Protection' }
  ];

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prescription.medication.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePrescription = () => {
    if (!selectedPatient || !prescriptionForm.medication || !prescriptionForm.dosage) {
      alert('Please fill in all required fields');
      return;
    }

    const newPrescription = {
      id: Date.now(),
      patient: patients.find(p => p.id === parseInt(selectedPatient)),
      ...prescriptionForm,
      dateIssued: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    setPrescriptions(prev => [newPrescription, ...prev]);
    setShowNewPrescription(false);
    setPrescriptionForm({
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      refills: 0
    });
    setSelectedPatient('');
    alert('Prescription created successfully!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConditionColor = (condition) => {
    if (condition.includes('Heart')) return 'text-red-600';
    if (condition.includes('Liver')) return 'text-green-600';
    return 'text-blue-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Prescription Management</h2>
          <p className="text-gray-600">Create, manage, and track patient prescriptions</p>
        </div>
        
        <button
          onClick={() => setShowNewPrescription(true)}
          className="mt-4 lg:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Prescription</span>
        </button>
      </div>

      {/* Search, filters, stats, prescriptions list, modal, quick actions, refill requests */}
      {/* ... (Rest of your JSX remains the same) ... */}
    </div>
  );
};

export default PrescriptionManagement;
