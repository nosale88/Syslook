import { useState } from 'react';
import { Edit, Calendar as CalendarIcon, Users, DollarSign, MapPin, List } from 'lucide-react';
import ProjectSetupModal from '../components/ProjectSetupModal';
import ProjectDetailModal from '../components/ProjectDetailModal';
import ProjectEditModal from '../components/ProjectEditModal';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import SearchInput from '../components/SearchInput';
import FilterDropdown from '../components/FilterDropdown';
import { motion } from 'framer-motion';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface Project {
  id: number;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  budget: number;
  attendees: number;
  location: string;
  progress: number;
  description?: string;
  manager?: string;
  contact?: string;
}

const initialProjects = [
  {
    id: 1,
    name: '2024 테크 컨퍼런스',
    status: '진행중',
    startDate: '2024-04-15',
    endDate: '2024-04-16',
    budget: 15000000,
    attendees: 500,
    location: '코엑스 그랜드볼룸',
    progress: 65,
    description: '최신 기술 트렌드를 공유하는 대규모 컨퍼런스',
    manager: '김기술',
    contact: '010-1234-5678',
  },
  {
    id: 2,
    name: '신제품 런칭 이벤트',
    status: '계획중',
    startDate: '2024-05-20',
    endDate: '2024-05-20',
    budget: 8000000,
    attendees: 200,
    location: '그랜드 하얏트 서울',
    progress: 30,
    description: '신제품 출시 기념 미디어 행사',
    manager: '이홍보',
    contact: '010-2345-6789',
  },
  {
    id: 3,
    name: '여름 뮤직 페스티벌',
    status: '준비중',
    startDate: '2024-07-10',
    endDate: '2024-07-12',
    budget: 25000000,
    attendees: 1000,
    location: '올림픽 공원',
    progress: 15,
    description: '3일간 진행되는 대규모 음악 페스티벌',
    manager: '박음악',
    contact: '010-3456-7890',
  },
];

const statusOptions = [
  { value: 'all', label: '전체' },
  { value: '진행중', label: '진행중' },
  { value: '계획중', label: '계획중' },
  { value: '준비중', label: '준비중' },
  { value: '완료', label: '완료' },
];

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ko }),
  getDay,
  locales: { ko },
});

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewType, setViewType] = useState<'list' | 'calendar'>('list');
  const [calendarView, setCalendarView] = useState<View>('month');

  const calendarEvents = projects.map(project => ({
    id: project.id,
    title: project.name,
    start: new Date(project.startDate),
    end: new Date(project.endDate),
    resource: project,
  }));

  const handleEventSelect = (event: any) => {
    const project = event.resource;
    setSelectedProject(project);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleDelete = () => {
    if (selectedProject) {
      setProjects(projects.filter(p => p.id !== selectedProject.id));
      setSelectedProject(null);
    }
  };

  const eventStyleGetter = (event: any) => {
    const status = event.resource.status;
    let backgroundColor = '#3B82F6';
    let borderColor = '#2563EB';

    switch (status) {
      case '진행중':
        backgroundColor = '#10B981';
        borderColor = '#059669';
        break;
      case '계획중':
        backgroundColor = '#3B82F6';
        borderColor = '#2563EB';
        break;
      case '준비중':
        backgroundColor = '#F59E0B';
        borderColor = '#D97706';
        break;
      case '완료':
        backgroundColor = '#6B7280';
        borderColor = '#4B5563';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '4px',
        color: 'white',
        padding: '4px 8px',
        fontSize: '0.875rem',
      }
    };
  };

  const CustomEvent = ({ event }: any) => {
    const project = event.resource;
    return (
      <div className="flex flex-col h-full">
        <div className="font-medium">{event.title}</div>
        <div className="text-xs mt-1 opacity-90">
          <div className="flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            {project.location}
          </div>
          <div className="flex items-center mt-1">
            <Users className="w-3 h-3 mr-1" />
            {project.attendees}명
          </div>
        </div>
      </div>
    );
  };

  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
      toolbar.onNavigate('TODAY');
    };

    return (
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button
            onClick={goToBack}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            이전
          </button>
          <button
            onClick={goToCurrent}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            오늘
          </button>
          <button
            onClick={goToNext}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            다음
          </button>
        </div>
        <h3 className="text-xl font-semibold">
          {format(toolbar.date, 'yyyy년 MM월', { locale: ko })}
        </h3>
        <div className="flex space-x-2">
          {toolbar.views.map((view: string) => (
            <button
              key={view}
              onClick={() => toolbar.onView(view)}
              className={`px-3 py-2 border rounded-md ${
                toolbar.view === view
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {view === 'month' ? '월간' : view === 'week' ? '주간' : '일간'}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">프로젝트 목록</h2>
        <div className="flex items-center space-x-4">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewType('list')}
              className={`px-4 py-2 flex items-center ${
                viewType === 'list'
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="w-5 h-5 mr-2" />
              목록
            </button>
            <button
              onClick={() => setViewType('calendar')}
              className={`px-4 py-2 flex items-center ${
                viewType === 'calendar'
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CalendarIcon className="w-5 h-5 mr-2" />
              캘린더
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            새 프로젝트
          </button>
        </div>
      </div>

      <div className="flex space-x-4 mb-4">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="프로젝트명으로 검색"
          />
        </div>
        <FilterDropdown
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          label="상태"
        />
      </div>

      {viewType === 'list' ? (
        <div className="grid grid-cols-1 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-md overflow-hidden border-l-4 ${project.status === '진행중' ? 'border-green-500' : project.status === '계획중' ? 'border-blue-500' : 'border-yellow-500'}`}
            >
              {/* 헤더 영역 - 프로젝트 이름과 상태 */}
              <div className="p-6 bg-gray-50 border-b">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{project.name}</h3>
                    <div className="flex items-center mt-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                          ${
                            project.status === '진행중'
                              ? 'bg-green-100 text-green-800'
                              : project.status === '계획중'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          project.status === '진행중'
                            ? 'bg-green-500'
                            : project.status === '계획중'
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                        }`}></span>
                        {project.status}
                      </span>
                      
                      {/* 관리자 정보 */}
                      {project.manager && (
                        <span className="ml-4 text-sm text-gray-500 flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          관리자: {project.manager}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* 진행률 */}
                  <div className="text-right">
                    <div className="flex items-center justify-end">
                      <p className="text-sm font-medium mr-2">진행률:</p>
                      <p className="text-lg font-bold text-blue-600">{project.progress}%</p>
                    </div>
                    <div className="mt-2 h-3 w-32 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${project.progress > 66 ? 'bg-green-500' : project.progress > 33 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 상세 정보 영역 */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CalendarIcon className="w-5 h-5 text-blue-500 mr-2" />
                      <h4 className="font-medium text-gray-700">일정</h4>
                    </div>
                    <p className="text-sm text-gray-800 font-medium">
                      {project.startDate} ~ {project.endDate}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Users className="w-5 h-5 text-blue-500 mr-2" />
                      <h4 className="font-medium text-gray-700">참석자</h4>
                    </div>
                    <p className="text-sm text-gray-800 font-medium">{project.attendees.toLocaleString()}명</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <DollarSign className="w-5 h-5 text-blue-500 mr-2" />
                      <h4 className="font-medium text-gray-700">예산</h4>
                    </div>
                    <p className="text-sm text-gray-800 font-medium">
                      {project.budget.toLocaleString()}원
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <MapPin className="w-5 h-5 text-blue-500 mr-2" />
                      <h4 className="font-medium text-gray-700">장소</h4>
                    </div>
                    <p className="text-sm text-gray-800 font-medium">{project.location}</p>
                  </div>
                </div>
                
                {/* 버튼 그룹 */}
                <div className="mt-6 flex space-x-3 justify-end">
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setIsDetailModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors flex items-center"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    상세보기
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setIsEditModalOpen(true);
                    }}
                    className="px-4 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    수정하기
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors flex items-center"
                  >
                    삭제하기
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6" style={{ height: 'calc(100vh - 250px)' }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={['month', 'week', 'day'] as View[]}
            view={calendarView}
            onView={(view: View) => setCalendarView(view)}
            onSelectEvent={handleEventSelect}
            eventPropGetter={eventStyleGetter}
            components={{
              event: CustomEvent,
              toolbar: CustomToolbar,
            }}
            messages={{
              month: '월간',
              week: '주간',
              day: '일간',
              today: '오늘',
              previous: '이전',
              next: '다음',
            }}
            popup
            tooltipAccessor={(event) => {
              const project = event.resource;
              return `${project.name}\n장소: ${project.location}\n참석자: ${project.attendees}명\n예산: ${project.budget.toLocaleString()}원`;
            }}
          />
        </div>
      )}

      <ProjectSetupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {selectedProject && (
        <>
          <ProjectDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedProject(null);
            }}
            project={selectedProject}
          />

          <ProjectEditModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedProject(null);
            }}
            project={selectedProject}
            onSave={handleEdit}
          />

          <ConfirmDeleteDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false);
              setSelectedProject(null);
            }}
            onConfirm={handleDelete}
            title="프로젝트 삭제"
            message="정말로 이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
          />
        </>
      )}
    </div>
  );
};

export default Projects;