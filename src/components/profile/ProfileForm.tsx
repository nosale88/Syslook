import React, { useState, useEffect } from 'react';
import { User, Building, Mail, Phone, MapPin, Calendar, Settings, Save, Camera, Edit3, BarChart3, FileText, Package, Star } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  department?: string;
  address?: string;
  avatar_url?: string;
  created_at: string;
  preferences?: {
    default_event_type: string;
    default_budget_range: string;
    notification_email: boolean;
    notification_sms: boolean;
  };
  stats?: {
    total_quotes: number;
    total_projects: number;
    total_spent: number;
    favorite_equipment: string[];
  };
}

interface ProfileFormProps {
  onProfileUpdate?: (profile: UserProfile) => void;
}

const ProfileForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'preferences' | 'stats'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // 프로필 데이터 (실제로는 API에서 가져올 데이터)
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    full_name: '김견적',
    email: 'kim.quote@company.com',
    phone: '010-1234-5678',
    company: '(주)이벤트플래닝',
    position: '이벤트 기획팀장',
    address: '서울시 강남구 테헤란로 123',
    avatar_url: '',
    created_at: '2024-01-15',
    preferences: {
      default_event_type: '기업 세미나',
      default_budget_range: '1000-5000만원',
      notification_email: true,
      notification_sms: false
    },
    stats: {
      total_quotes: 24,
      total_projects: 18,
      total_spent: 125000000,
      favorite_equipment: ['무대', '조명', '음향']
    }
  });

  const [formData, setFormData] = useState(profile);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev: UserProfile) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof UserProfile] as any),
          [child]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      }));
    } else {
      setFormData((prev: UserProfile) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfile(formData);
      setSuccess('프로필이 성공적으로 업데이트되었습니다.');
      setIsEditing(false);
    } catch (err) {
      setError('프로필 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setError(null);
  };

  const tabs = [
    { id: 'profile', label: '기본 정보', icon: <User className="w-4 h-4" /> },
    { id: 'company', label: '회사 정보', icon: <Building className="w-4 h-4" /> },
    { id: 'preferences', label: '환경 설정', icon: <Settings className="w-4 h-4" /> },
    { id: 'stats', label: '이용 통계', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {profile.full_name.charAt(0)}
              </div>
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-shadow">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
              <p className="text-gray-600">{profile.position} • {profile.company}</p>
              <p className="text-sm text-gray-500">가입일: {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                편집
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? '저장 중...' : '저장'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 알림 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* 기본 정보 탭 */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">기본 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">직책</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">주소</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <textarea
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows={2}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 회사 정보 탭 */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">회사 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">회사명</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="company"
                      value={formData.company || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">부서/팀</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 환경 설정 탭 */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">환경 설정</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">기본 설정</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">기본 이벤트 유형</label>
                      <select
                        name="preferences.default_event_type"
                        value={formData.preferences?.default_event_type || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      >
                        <option value="기업 세미나">기업 세미나</option>
                        <option value="제품 런칭">제품 런칭</option>
                        <option value="컨퍼런스">컨퍼런스</option>
                        <option value="전시회">전시회</option>
                        <option value="워크샵">워크샵</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">기본 예산 범위</label>
                      <select
                        name="preferences.default_budget_range"
                        value={formData.preferences?.default_budget_range || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      >
                        <option value="500만원 이하">500만원 이하</option>
                        <option value="500-1000만원">500-1000만원</option>
                        <option value="1000-5000만원">1000-5000만원</option>
                        <option value="5000만원 이상">5000만원 이상</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">알림 설정</h4>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="preferences.notification_email"
                        checked={formData.preferences?.notification_email || false}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">이메일 알림 받기</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="preferences.notification_sms"
                        checked={formData.preferences?.notification_sms || false}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">SMS 알림 받기</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 이용 통계 탭 */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">이용 통계</h3>
              
              {/* 통계 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-600">총 견적서</p>
                      <p className="text-2xl font-bold text-blue-900">{profile.stats?.total_quotes}개</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <Package className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-600">완료 프로젝트</p>
                      <p className="text-2xl font-bold text-green-900">{profile.stats?.total_projects}개</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-purple-600">총 지출</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {((profile.stats?.total_spent || 0) / 10000).toFixed(0)}만원
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 선호 장비 */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">자주 사용하는 장비</h4>
                                 <div className="flex flex-wrap gap-2">
                   {profile.stats?.favorite_equipment.map((equipment: string, index: number) => (
                     <span
                       key={index}
                       className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800"
                     >
                       <Star className="w-3 h-3 mr-1" />
                       {equipment}
                     </span>
                   ))}
                 </div>
              </div>

              {/* 최근 활동 */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">최근 활동</h4>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium">2024 테크 컨퍼런스 견적서 생성</p>
                      <p className="text-xs text-gray-500">2일 전</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium">신제품 런칭 이벤트 프로젝트 완료</p>
                      <p className="text-xs text-gray-500">1주 전</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium">장비 카탈로그에서 LED 월 조회</p>
                      <p className="text-xs text-gray-500">2주 전</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
