import React from 'react';
import Modal from './Modal';
import { Phone, Mail, MapPin, Star, Building2, Globe, User, FileText } from 'lucide-react';

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

interface VendorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor;
}

const VendorDetailModal: React.FC<VendorDetailModalProps> = ({
  isOpen,
  onClose,
  vendor,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="업체 상세 정보">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold">{vendor.name}</h3>
          <div className="flex items-center mt-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
              {vendor.category}
            </span>
            <div className="flex items-center ml-4 text-yellow-400">
              <Star className="w-5 h-5 fill-current" />
              <span className="ml-1 text-gray-900">{vendor.rating}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center">
            <Phone className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">연락처</p>
              <p className="font-medium">{vendor.contact}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">이메일</p>
              <p className="font-medium">{vendor.email}</p>
            </div>
          </div>
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">주소</p>
              <p className="font-medium">{vendor.address}</p>
            </div>
          </div>
        </div>

        {vendor.businessNumber && (
          <div className="flex items-center">
            <Building2 className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">사업자 등록번호</p>
              <p className="font-medium">{vendor.businessNumber}</p>
            </div>
          </div>
        )}

        {vendor.representative && (
          <div className="flex items-center">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">대표자</p>
              <p className="font-medium">{vendor.representative}</p>
            </div>
          </div>
        )}

        {vendor.website && (
          <div className="flex items-center">
            <Globe className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">웹사이트</p>
              <a
                href={vendor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-800"
              >
                {vendor.website}
              </a>
            </div>
          </div>
        )}

        {vendor.specialties && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">전문 분야</h4>
            <div className="flex flex-wrap gap-2">
              {vendor.specialties.split(',').map((specialty, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                >
                  {specialty.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="font-medium text-gray-900 mb-2">업체 소개</h4>
          <p className="text-gray-600">{vendor.description}</p>
        </div>

        <div className="text-sm text-gray-500">
          등록일: {new Date(vendor.createdAt).toLocaleDateString()}
        </div>
      </div>
    </Modal>
  );
};

export default VendorDetailModal;