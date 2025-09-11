// import React, { useState, useEffect } from 'react';
// import { MapPin, Star, Phone, Calendar, Filter, Search } from 'lucide-react';
// import DoctorCard from '../components/shared/DoctorCard';
// import LoadingSpinner from '../components/common/LoadingSpinner';
// import { patientService } from '../services/patientService';

// const DoctorRecommendation = () => {
//   const [doctors, setDoctors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedSpecialty, setSelectedSpecialty] = useState('');

//   const specialties = [
//     { value: '', label: 'All Specialties' },
//     { value: 'cardiologist', label: 'Cardiologist' },
//     { value: 'hepatologist', label: 'Hepatologist' },
//     { value: 'general physician', label: 'General Physician' },
//     { value: 'neurologist', label: 'Neurologist' },
//     { value: 'dermatologist', label: 'Dermatologist' }
//   ];

//   useEffect(() => {
//     fetchDoctors();
//   }, [selectedSpecialty]);

//   const fetchDoctors = async () => {
//     setLoading(true);
//     try {
//       const params = {};
//       if (selectedSpecialty) {
//         params.specialization = selectedSpecialty;
//       }
//       if (searchTerm) {
//         params.search = searchTerm;
//       }

//       const response = await patientService.getDoctors(params);
//       setDoctors(response.doctors);
//     } catch (error) {
//       console.error('Error fetching doctors:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (e) => {
//     e.preventDefault();
//     fetchDoctors();
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">
//             Find Specialist Doctors
//           </h1>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//             Connect with experienced doctors in your area. Book consultations and get expert medical advice.
//           </p>
//         </div>

//         {/* Search & Filter */}
//         <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
//           <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//               <input
//                 type="text"
//                 placeholder="Search by name or location"
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             <div className="relative">
//               <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//               <select
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
//                 value={selectedSpecialty}
//                 onChange={(e) => setSelectedSpecialty(e.target.value)}
//               >
//                 {specialties.map(s => (
//                   <option key={s.value} value={s.value}>{s.label}</option>
//                 ))}
//               </select>
//             </div>
//             <button
//               type="submit"
//               className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
//             >
//               Search Doctors
//             </button>
//           </form>
//         </div>

//         {/* Doctor Cards */}
//         {loading ? (
//           <div className="flex justify-center py-12">
//             <LoadingSpinner size="large" />
//           </div>
//         ) : doctors.length === 0 ? (
//           <div className="text-center py-12">
//             <p className="text-gray-500 text-lg">No doctors found matching your criteria</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {doctors.map((doctor) => (
//               <DoctorCard key={doctor._id} doctor={doctor} />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DoctorRecommendation;


import React, { useState, useEffect } from 'react';
import { MapPin, Star, Phone, Calendar, Filter, Search } from 'lucide-react';
import DoctorCard from '../shared/DoctorCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { patientService } from '../services/patientService';

const DoctorRecommendation = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  const specialties = [
    { value: '', label: 'All Specialties' },
    { value: 'cardiologist', label: 'Cardiologist' },
    { value: 'hepatologist', label: 'Hepatologist' },
    { value: 'general physician', label: 'General Physician' },
    { value: 'neurologist', label: 'Neurologist' },
    { value: 'dermatologist', label: 'Dermatologist' }
  ];

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSpecialty) {
        params.specialization = selectedSpecialty;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await patientService.getDoctors(params);
      setDoctors(response.doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Specialist Doctors
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with experienced doctors in your area. Book consultations and get expert medical advice.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name or location"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
              >
                {specialties.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Search Doctors
            </button>
          </form>
        </div>

        {/* Doctor Cards */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No doctors found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorRecommendation;
