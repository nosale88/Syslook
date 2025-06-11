import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SystemService, SystemInfo } from '../../services/systemService';

interface SystemFormProps {
  isEditing?: boolean;
}

const SystemForm = ({ isEditing = false }: SystemFormProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<Partial<SystemInfo>>({
    name: '',
    description: '',
    status: 'offline',
    ip_address: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 시스템 정보 가져오기 (편집 모드인 경우)
  useEffect(() => {
    const fetchSystemData = async () => {
      if (isEditing && id) {
        setLoading(true);
        const response = await SystemService.getSystemById(id);
        
        if (response.status === 'success' && response.data) {
          setFormData({
            name: response.data.name || '',
            description: response.data.description || '',
            status: response.data.status || 'offline',
            ip_address: response.data.ip_address || '',
          });
          setError(null);
        } else {
          setError(response.error || '시스템 정보를 가져오는 데 실패했습니다.');
        }
        
        setLoading(false);
      }
    };

    fetchSystemData();
  }, [isEditing, id]);

  // 입력 필드 변경 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let response;
      
      if (isEditing && id) {
        // 시스템 업데이트
        response = await SystemService.updateSystem(id, formData);
      } else {
        // 새 시스템 생성
        response = await SystemService.createSystem(formData as Omit<SystemInfo, 'id' | 'created_at' | 'updated_at'>);
      }
      
      if (response.status === 'success') {
        setSuccess(isEditing ? '시스템이 성공적으로 업데이트되었습니다.' : '새 시스템이 성공적으로 생성되었습니다.');
        
        // 성공 후 리디렉션
        setTimeout(() => {
          navigate(isEditing ? `/systems/${id}` : '/systems');
        }, 1500);
      } else {
        throw new Error(response.error || '작업을 완료할 수 없습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? '시스템 정보 수정' : '새 시스템 추가'}
      </h1>
      
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
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            시스템 이름 *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="시스템 이름을 입력하세요"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            설명
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
            placeholder="시스템에 대한 설명을 입력하세요"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
            상태
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="online">온라인</option>
            <option value="offline">오프라인</option>
            <option value="maintenance">유지보수 중</option>
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ip_address">
            IP 주소
          </label>
          <input
            id="ip_address"
            name="ip_address"
            type="text"
            value={formData.ip_address}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="예: 192.168.1.1"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/systems')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? '저장 중...' : isEditing ? '수정' : '추가'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemForm;
