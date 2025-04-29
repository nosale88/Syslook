import React from 'react';
import { UserCircle, Mail, Phone, Shield } from 'lucide-react';

const users = [
  {
    id: 1,
    name: '김관리',
    email: 'admin@example.com',
    role: '관리자',
    department: '운영팀',
    phone: '010-1234-5678',
    status: '활성',
    lastLogin: '2024-03-15 14:30',
  },
  {
    id: 2,
    name: '이매니저',
    email: 'manager@example.com',
    role: '매니저',
    department: '기술팀',
    phone: '010-2345-6789',
    status: '활성',
    lastLogin: '2024-03-15 11:20',
  },
  {
    id: 3,
    name: '박스태프',
    email: 'staff@example.com',
    role: '스태프',
    department: '현장팀',
    phone: '010-3456-7890',
    status: '휴가중',
    lastLogin: '2024-03-14 17:45',
  },
];

const Users = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">사용자 관리</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          새 사용자 추가
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="bg-gray-100 rounded-full p-3">
                  <UserCircle className="w-8 h-8 text-gray-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium
                    ${user.status === '활성' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {user.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <Shield className={`w-5 h-5 ${
                  user.role === '관리자' ? 'text-red-500' :
                  user.role === '매니저' ? 'text-blue-500' : 'text-gray-500'
                }`} />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Shield className="w-4 h-4 mr-2" />
                <span>{user.role} - {user.department}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                최근 접속: {user.lastLogin}
              </p>
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200">
                상세정보
              </button>
              <button className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded hover:bg-blue-100">
                권한수정
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;