import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import DateRangePicker from './DateRangePicker';
import { eventTypes } from '../data/mockData';

interface ProjectSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectSetupModal: React.FC<ProjectSetupModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: eventTypes[0],
    budget: 10000000,
    attendees: 100,
    location: '',
    description: '',
    dateRange: [null, null] as [Date | null, Date | null],
    manager: '',
    contact: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 프로젝트 생성 로직 구현
    navigate('/projects');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="새 프로젝트 설정">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">프로젝트명</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input"
            required
          />
        </div>

        <div>
          <label className="label">이벤트 유형</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="input"
          >
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">예산</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) =>
                setFormData({ ...formData, budget: Number(e.target.value) })
              }
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">참석자 수</label>
            <input
              type="number"
              value={formData.attendees}
              onChange={(e) =>
                setFormData({ ...formData, attendees: Number(e.target.value) })
              }
              className="input"
              required
            />
          </div>
        </div>

        <div>
          <label className="label">행사 기간</label>
          <DateRangePicker
            startDate={formData.dateRange[0]}
            endDate={formData.dateRange[1]}
            onChange={(dates) => setFormData({ ...formData, dateRange: dates })}
          />
        </div>

        <div>
          <label className="label">장소</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="input"
            required
          />
        </div>

        <div>
          <label className="label">프로젝트 설명</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="input h-24"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">담당자</label>
            <input
              type="text"
              value={formData.manager}
              onChange={(e) =>
                setFormData({ ...formData, manager: e.target.value })
              }
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">연락처</label>
            <input
              type="tel"
              value={formData.contact}
              onChange={(e) =>
                setFormData({ ...formData, contact: e.target.value })
              }
              className="input"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            취소
          </button>
          <button type="submit" className="btn btn-primary">
            프로젝트 생성
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectSetupModal;