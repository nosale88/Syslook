import React, { useState } from 'react';
import { Building2, Phone, Mail, MapPin, Star } from 'lucide-react';
import VendorRegistrationModal from '../components/VendorRegistrationModal';
import VendorDetailModal from '../components/VendorDetailModal';
import VendorEditModal from '../components/VendorEditModal';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import SearchInput from '../components/SearchInput';
import FilterDropdown from '../components/FilterDropdown';

interface Vendor {
  id: number;
  name: string;
  category: string;
  rating: number;
  contact: string;
  email: string;
  address: string;
  description: string;
  businessNumber?: string;
  representative?: string;
  website?: string;
  specialties?: string;
  createdAt: string;
}

const initialVendors = [
  {
    id: 1,
    name: '테크노사운드',
    category: '음향/영상',
    rating: 4.8,
    contact: '02-1234-5678',
    email: 'info@technosound.kr',
    address: '서울시 강남구',
    description: '전문 음향 및 영상 장비 공급업체',
    createdAt: '2024-01-01',
  },
  {
    id: 2,
    name: '라이트매직',
    category: '조명',
    rating: 4.6,
    contact: '02-2345-6789',
    email: 'contact@lightmagic.kr',
    address: '서울시 마포구',
    description: '무대 및 이벤트 조명 전문업체',
    createdAt: '2024-01-02',
  },
  {
    id: 3,
    name: '스테이지프로',
    category: '무대/구조물',
    rating: 4.7,
    contact: '02-3456-7890',
    email: 'info@stagepro.kr',
    address: '서울시 영등포구',
    description: '무대 설치 및 구조물 전문업체',
    createdAt: '2024-01-03',
  },
];

const categoryOptions = [
  { value: 'all', label: '전체' },
  { value: '음향/영상', label: '음향/영상' },
  { value: '조명', label: '조명' },
  { value: '무대/구조물', label: '무대/구조물' },
  { value: '전력/케이블', label: '전력/케이블' },
  { value: '위생/편의', label: '위생/편의' },
  { value: '안전/보안', label: '안전/보안' },
  { value: '통신', label: '통신' },
  { value: '식음료', label: '식음료' },
  { value: '교통/주차', label: '교통/주차' },
  { value: '참가자편의', label: '참가자편의' },
  { value: '행사운영', label: '행사운영' },
  { value: '기타장비', label: '기타장비' },
];

const Vendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleAddVendor = (newVendor: Vendor) => {
    setVendors([newVendor, ...vendors]);
  };

  const handleEdit = (updatedVendor: Vendor) => {
    setVendors(vendors.map(v => v.id === updatedVendor.id ? updatedVendor : v));
  };

  const handleDelete = () => {
    if (selectedVendor) {
      setVendors(vendors.filter(v => v.id !== selectedVendor.id));
      setSelectedVendor(null);
    }
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(search.toLowerCase()) ||
      vendor.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || vendor.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">등록된 업체 목록</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          새 업체 등록
        </button>
      </div>

      <div className="flex space-x-4 mb-4">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="업체명 또는 설명으로 검색"
          />
        </div>
        <FilterDropdown
          options={categoryOptions}
          value={categoryFilter}
          onChange={setCategoryFilter}
          label="카테고리"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map(vendor => (
          <div key={vendor.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{vendor.name}</h3>
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded mt-1">
                  {vendor.category}
                </span>
              </div>
              <div className="flex items-center text-yellow-400">
                <Star className="w-5 h-5 fill-current" />
                <span className="ml-1 text-gray-900">{vendor.rating}</span>
              </div>
            </div>

            <p className="text-gray-600 mt-2">{vendor.description}</p>

            <div className="mt-4 space-y-2">
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <span>{vendor.contact}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <span>{vendor.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{vendor.address}</span>
              </div>
            </div>

            {vendor.website && (
              <div className="mt-2">
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  웹사이트 방문
                </a>
              </div>
            )}

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => {
                  setSelectedVendor(vendor);
                  setIsDetailModalOpen(true);
                }}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
              >
                상세보기
              </button>
              <button
                onClick={() => {
                  setSelectedVendor(vendor);
                  setIsEditModalOpen(true);
                }}
                className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded hover:bg-blue-100"
              >
                수정하기
              </button>
              <button
                onClick={() => {
                  setSelectedVendor(vendor);
                  setIsDeleteDialogOpen(true);
                }}
                className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded hover:bg-red-100"
              >
                삭제하기
              </button>
            </div>
          </div>
        ))}
      </div>

      <VendorRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddVendor}
      />

      {selectedVendor && (
        <>
          <VendorDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedVendor(null);
            }}
            vendor={selectedVendor}
          />

          <VendorEditModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedVendor(null);
            }}
            vendor={selectedVendor}
            onSave={handleEdit}
          />

          <ConfirmDeleteDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false);
              setSelectedVendor(null);
            }}
            onConfirm={handleDelete}
            title="업체 삭제"
            message="정말로 이 업체를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
          />
        </>
      )}
    </div>
  );
};

export default Vendors;