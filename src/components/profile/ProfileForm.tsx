import { useState, useEffect } from 'react';
import { ProfileService, UserProfile } from '../../services/profileService';

interface ProfileFormProps {
  onProfileUpdate?: (profile: UserProfile) => void;
}

const ProfileForm = ({ onProfileUpdate }: ProfileFormProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // 프로필 정보 가져오기
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const response = await ProfileService.getCurrentProfile();
      
      if (response.status === 'success' && response.data) {
        setProfile(response.data);
        setFormData({
          full_name: response.data.full_name || '',
          email: response.data.email || '',
        });
        setError(null);
      } else {
        setError(response.error || '프로필 정보를 가져오는 데 실패했습니다.');
        setProfile(null);
      }
      
      setLoading(false);
    };

    fetchProfile();
  }, []);

  // 입력 필드 변경 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 아바타 파일 변경 처리
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // 프로필 정보 업데이트
      const profileResponse = await ProfileService.updateProfile({
        full_name: formData.full_name,
        email: formData.email,
      });
      
      if (profileResponse.status !== 'success') {
        throw new Error(profileResponse.error || '프로필 업데이트에 실패했습니다.');
      }
      
      // 아바타 업로드 (있는 경우)
      if (avatarFile) {
        const avatarResponse = await ProfileService.uploadAvatar(avatarFile);
        
        if (avatarResponse.status !== 'success') {
          throw new Error(avatarResponse.error || '아바타 업로드에 실패했습니다.');
        }
      }
      
      // 최신 프로필 정보 가져오기
      const updatedProfileResponse = await ProfileService.getCurrentProfile();
      
      if (updatedProfileResponse.status === 'success' && updatedProfileResponse.data) {
        setProfile(updatedProfileResponse.data);
        
        if (onProfileUpdate) {
          onProfileUpdate(updatedProfileResponse.data);
        }
        
        setSuccess('프로필이 성공적으로 업데이트되었습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">내 프로필</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
          <p>{success}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-2">
            {(avatarPreview || profile?.avatar_url) ? (
              <img 
                src={avatarPreview || profile?.avatar_url} 
                alt="프로필 이미지" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                <span className="text-gray-600 text-2xl">👤</span>
              </div>
            )}
          </div>
          
          <label className="cursor-pointer text-blue-600 hover:text-blue-800">
            이미지 변경
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="full_name">
            이름
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            value={formData.full_name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="이름을 입력하세요"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="이메일을 입력하세요"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
