import React, { useState } from 'react';
import { FileText, Edit, Trash } from 'lucide-react';
import QuoteGenerator from '../components/QuoteGenerator';
import QuoteDetailModal from '../components/QuoteDetailModal';
import QuoteEditModal from '../components/QuoteEditModal';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import Table from '../components/Table';
import { ColumnDef } from '@tanstack/react-table';
import SearchInput from '../components/SearchInput';
import FilterDropdown from '../components/FilterDropdown';
import Pagination from '../components/Pagination';
import QuotationButton from '../components/quotation/QuotationButton';

interface Quote {
  id: string;
  clientName: string;
  eventName: string;
  date: string;
  amount: number;
  status: string;
  validUntil: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    days: number;
  }>;
  description?: string;
  terms?: string;
}

const statusOptions = [
  { value: 'all', label: '전체' },
  { value: '승인대기', label: '승인대기' },
  { value: '승인완료', label: '승인완료' },
  { value: '검토중', label: '검토중' },
  { value: '반려', label: '반려' },
];

const Quotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    // 로컬스토리지에서 견적서 목록 불러오기
    const savedQuotes = localStorage.getItem('quotes');
    if (savedQuotes) {
      return JSON.parse(savedQuotes);
    }
    
    // 기본 샘플 데이터
    return [
      {
        id: 'Q2024001',
        clientName: '테크놀로지 컴퍼니',
        eventName: '2024 테크 컨퍼런스',
        date: '2024-03-15',
        amount: 15000000,
        status: '승인대기',
        validUntil: '2024-03-30',
        items: [
          { name: '음향 시스템', quantity: 1, price: 5000000, days: 2 },
          { name: '조명 세트', quantity: 2, price: 2500000, days: 2 },
        ],
      },
      {
        id: 'Q2024002',
        clientName: '글로벌 전자',
        eventName: '신제품 런칭 이벤트',
        date: '2024-03-14',
        amount: 8000000,
        status: '승인완료',
        validUntil: '2024-03-29',
        items: [
          { name: '무대 구조물', quantity: 1, price: 3000000, days: 1 },
          { name: 'LED 스크린', quantity: 2, price: 2500000, days: 1 },
        ],
      },
      {
        id: 'Q2024003',
        clientName: '엔터테인먼트 그룹',
        eventName: '여름 뮤직 페스티벌',
        date: '2024-03-13',
        amount: 25000000,
        status: '검토중',
        validUntil: '2024-03-28',
        items: [
          { name: '프리미엄 음향 시스템', quantity: 2, price: 5000000, days: 3 },
          { name: '무대 조명 패키지', quantity: 1, price: 8000000, days: 3 },
          { name: '특수 효과 세트', quantity: 1, price: 7000000, days: 3 },
        ],
      },
    ];
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const itemsPerPage = 10;

  const handleEdit = (updatedQuote: Quote) => {
    const updatedQuotes = quotes.map(q => q.id === updatedQuote.id ? updatedQuote : q);
    setQuotes(updatedQuotes);
    localStorage.setItem('quotes', JSON.stringify(updatedQuotes));
  };

  const handleDelete = () => {
    if (selectedQuote) {
      const updatedQuotes = quotes.filter(q => q.id !== selectedQuote.id);
      setQuotes(updatedQuotes);
      localStorage.setItem('quotes', JSON.stringify(updatedQuotes));
      setSelectedQuote(null);
    }
  };

  const columns: ColumnDef<Quote>[] = [
    {
      accessorKey: 'id',
      header: '견적번호',
    },
    {
      accessorKey: 'clientName',
      header: '고객사',
    },
    {
      accessorKey: 'eventName',
      header: '행사명',
    },
    {
      accessorKey: 'amount',
      header: '견적금액',
      cell: ({ row }) => `${row.original.amount.toLocaleString()}원`,
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
            ${
              row.original.status === '승인완료'
                ? 'bg-green-100 text-green-800'
                : row.original.status === '승인대기'
                ? 'bg-yellow-100 text-yellow-800'
                : row.original.status === '반려'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'validUntil',
      header: '유효기간',
    },
    {
      id: 'actions',
      header: '작업',
      cell: ({ row }) => {
        // 견적서 데이터를 QuotationButton에 전달할 형식으로 변환
        const quotationData = {
          id: row.original.id,
          client: row.original.clientName,
          title: row.original.eventName,
          amount: row.original.amount,
          status: row.original.status,
          dueDate: row.original.validUntil,
          items: row.original.items?.map(item => ({
            id: `${item.name}-${Math.random().toString(36).substring(2, 9)}`,
            description: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            amount: item.price * item.quantity
          })) || []
        };
        
        return (
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setSelectedQuote(row.original);
                setIsDetailModalOpen(true);
              }}
              className="text-blue-600 hover:text-blue-900"
              title="상세 정보"
            >
              <FileText className="w-5 h-5" />
            </button>
            <QuotationButton quotationData={quotationData} />
            <button
              onClick={() => {
                setSelectedQuote(row.original);
                setIsEditModalOpen(true);
              }}
              className="text-green-600 hover:text-green-900"
              title="수정"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setSelectedQuote(row.original);
                setIsDeleteDialogOpen(true);
              }}
              className="text-red-600 hover:text-red-900"
              title="삭제"
            >
              <Trash className="w-5 h-5" />
            </button>
          </div>
        );
      },
    },
  ];

  const handleGenerateQuote = (quote: Quote) => {
    const updatedQuotes = [quote, ...quotes];
    setQuotes(updatedQuotes);
    localStorage.setItem('quotes', JSON.stringify(updatedQuotes));
  };

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.clientName.toLowerCase().includes(search.toLowerCase()) ||
      quote.eventName.toLowerCase().includes(search.toLowerCase()) ||
      quote.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
  const paginatedQuotes = filteredQuotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">견적서 관리</h2>
        <QuoteGenerator onGenerate={handleGenerateQuote} />
      </div>

      <div className="flex space-x-4 mb-4">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="견적번호, 고객사, 행사명으로 검색"
          />
        </div>
        <FilterDropdown
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          label="상태"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table data={paginatedQuotes} columns={columns} />
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {selectedQuote && (
        <>
          <QuoteDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedQuote(null);
            }}
            quote={selectedQuote}
          />

          <QuoteEditModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedQuote(null);
            }}
            quote={selectedQuote}
            onSave={handleEdit}
          />

          <ConfirmDeleteDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false);
              setSelectedQuote(null);
            }}
            onConfirm={handleDelete}
            title="견적서 삭제"
            message="정말로 이 견적서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
          />
        </>
      )}
    </div>
  );
};

export default Quotes;