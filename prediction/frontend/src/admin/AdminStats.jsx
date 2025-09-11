import React from 'react';
import { Users, UserCheck, Clock, Calendar } from 'lucide-react';

const AdminStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Doctors',
      value: stats.totalDoctors || 0,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Pending Approval',
      value: stats.pendingDoctors || 0,
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'Active Doctors',
      value: stats.approvedDoctors || 0,
      icon: UserCheck,
      color: 'green'
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients || 0,
      icon: Users,
      color: 'purple'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`bg-${stat.color}-100 p-3 rounded-full`}>
              <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;
