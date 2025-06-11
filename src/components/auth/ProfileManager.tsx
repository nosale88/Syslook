import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  email: string;
  updated_at: string;
}

const ProfileManager: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (error: any) {
      console.error('프로필 조회 오류:', error.message);
      toast.error('프로필을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setLoading(true);

      // 아바타 이미지 업로드 처리
      let newAvatarUrl = avatarUrl;
      if (avatarFile) {
        setUploading(true);
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) {
          throw uploadError;
        }

        // 업로드된 이미지의 공개 URL 가져오기
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        newAvatarUrl = data.publicUrl;
        setUploading(false);
      }

      // 프로필 업데이트
      const updates = {
        id: user.id,
        full_name: fullName,
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'id' });

      if (error) {
        throw error;
      }

      toast.success('프로필이 성공적으로 업데이트되었습니다.');
      fetchProfile(); // 업데이트된 프로필 다시 불러오기
    } catch (error: any) {
      console.error('프로필 업데이트 오류:', error.message);
      toast.error('프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error('이미지 크기는 2MB 이하여야 합니다.');
        return;
      }
      
      setAvatarFile(file);
      // 미리보기 URL 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return (
      <div className="text-center p-8">
        <p>프로필을 보려면 로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">내 프로필</h2>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-6 flex flex-col items-center">
            <div className="relative w-24 h-24 mb-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="프로필 이미지"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  {fullName.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            
            <p className="text-sm text-gray-500 mb-2">
              {user.email}
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="full-name">
              이름
            </label>
            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="이름을 입력하세요"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || uploading}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                (loading || uploading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading || uploading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileManager;
