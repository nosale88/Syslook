import React from 'react';
import Modal from './Modal';
import { Calendar, Users, MapPin, Clock } from 'lucide-react';

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

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="프로젝트 상세 정보">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold">{project.name}</h3>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2
              ${
                project.status === '진행중'
                  ? 'bg-green-100 text-green-800'
                  : project.status === '계획중'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
          >
            {project.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">일정</p>
              <p className="font-medium">
                {project.startDate} ~ {project.endDate}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Users className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">참석자</p>
              <p className="font-medium">{project.attendees}명</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="w-5 h-5 text-gray-400 mr-2 flex items-center justify-center text-sm font-bold">₩</span>
            <div>
              <p className="text-sm text-gray-500">예산</p>
              <p className="font-medium">{project.budget.toLocaleString()}원</p>
            </div>
          </div>
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">장소</p>
              <p className="font-medium">{project.location}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">진행률</h4>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <p className="mt-1 text-sm text-gray-600">{project.progress}% 완료</p>
        </div>

        {project.description && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">프로젝트 설명</h4>
            <p className="text-gray-600">{project.description}</p>
          </div>
        )}

        {(project.manager || project.contact) && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">담당자 정보</h4>
            {project.manager && (
              <p className="text-gray-600">담당자: {project.manager}</p>
            )}
            {project.contact && (
              <p className="text-gray-600">연락처: {project.contact}</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProjectDetailModal;