import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SystemService, SystemInfo, SystemMetric } from '../../services/systemService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SystemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [system, setSystem] = useState<SystemInfo | null>(null);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('시스템 ID가 유효하지 않습니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      
      // 시스템 정보 가져오기
      const systemResponse = await SystemService.getSystemById(id);
      
      if (systemResponse.status === 'success' && systemResponse.data) {
        setSystem(systemResponse.data);
        
        // 시스템 메트릭 가져오기
        const metricsResponse = await SystemService.getSystemMetrics(id, 50);
        
        if (metricsResponse.status === 'success' && metricsResponse.data) {
          // 날짜 기준으로 정렬
          const sortedMetrics = [...metricsResponse.data].sort((a, b) => {
            return new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime();
          });
          
          setMetrics(sortedMetrics);
          setError(null);
        } else {
          setError('시스템 메트릭을 가져오는 데 실패했습니다.');
          setMetrics([]);
        }
      } else {
        setError(systemResponse.error || '시스템 정보를 가져오는 데 실패했습니다.');
        setSystem(null);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleDeleteSystem = async () => {
    if (!id || !system) return;
    
    if (window.confirm('정말로 이 시스템을 삭제하시겠습니까?')) {
      setLoading(true);
      const response = await SystemService.deleteSystem(id);
      
      if (response.status === 'success') {
        navigate('/systems');
      } else {
        setError(response.error || '시스템 삭제에 실패했습니다.');
        setLoading(false);
      }
    }
  };

  // 차트 데이터 형식 변환
  const chartData = metrics.map(metric => ({
    timestamp: new Date(metric.timestamp || '').toLocaleTimeString(),
    cpu: metric.cpu_usage,
    memory: metric.memory_usage,
    disk: metric.disk_usage
  }));

  if (loading && !system) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!system && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error || '시스템을 찾을 수 없습니다.'}</p>
        </div>
        <Link to="/systems" className="text-blue-600 hover:text-blue-800">
          시스템 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* 시스템 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{system?.name}</h1>
              <p className="text-gray-600 mt-1">{system?.description || '설명 없음'}</p>
            </div>
            
            <div className="flex items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                system?.status === 'online' ? 'bg-green-100 text-green-800' :
                system?.status === 'offline' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {system?.status || '상태 없음'}
              </span>
            </div>
          </div>
        </div>
        
        {/* 시스템 정보 */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">시스템 정보</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">IP 주소</p>
              <p className="font-medium">{system?.ip_address || '없음'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">생성 일자</p>
              <p className="font-medium">
                {system?.created_at ? new Date(system.created_at).toLocaleString() : '없음'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">마지막 업데이트</p>
              <p className="font-medium">
                {system?.updated_at ? new Date(system.updated_at).toLocaleString() : '없음'}
              </p>
            </div>
          </div>
        </div>
        
        {/* 시스템 메트릭 */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">시스템 메트릭</h2>
          
          {metrics.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU 사용량 (%)" />
                  <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="메모리 사용량 (%)" />
                  <Line type="monotone" dataKey="disk" stroke="#ffc658" name="디스크 사용량 (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="text-gray-600">사용 가능한 메트릭 데이터가 없습니다.</p>
            </div>
          )}
        </div>
        
        {/* 작업 버튼 */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between">
          <Link to="/systems" className="text-gray-600 hover:text-gray-800">
            목록으로 돌아가기
          </Link>
          
          <div className="space-x-4">
            <Link 
              to={`/systems/${id}/edit`} 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              수정
            </Link>
            <button 
              onClick={handleDeleteSystem}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemDetail;
