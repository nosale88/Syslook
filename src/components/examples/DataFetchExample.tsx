import { useEffect, useState } from 'react';
import { DataService, BaseRecord, ServiceResponse } from '../../services/dataService';

// Example component showing how to fetch data from Supabase
// Define a type for table data extending BaseRecord
interface TableData extends BaseRecord {
  name?: string;
  description?: string;
  // Add other fields specific to your table
}

const DataFetchExample = () => {
  const [data, setData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Example table name - replace with your actual table name
  const tableName = 'example_table';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch data using the DataService
      const response = await DataService.getAll<TableData>(tableName);
      
      if (response.status === 'success' && response.data) {
        setData(response.data);
        setError(null);
      } else {
        console.error('Error fetching data:', response.error);
        setError(response.error || 'Failed to load data. Please try again later.');
        setData([]);
      }
      
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Data from Supabase</h2>
      
      {data.length === 0 ? (
        <p className="text-gray-500">No data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                {/* Dynamically generate table headers based on first data item */}
                {Object.keys(data[0]).map((key) => (
                  <th key={key} className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {Object.values(item).map((value: any, i) => (
                    <td key={i} className="py-2 px-4 border-b border-gray-200 text-sm">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DataFetchExample;
