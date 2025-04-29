import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

const Analytics = () => {
  const monthlyData = [
    { month: '1월', 수입: 5000000, 지출: 4200000 },
    { month: '2월', 수입: 6200000, 지출: 5100000 },
    { month: '3월', 수입: 7800000, 지출: 6300000 },
    { month: '4월', 수입: 8500000, 지출: 7200000 },
    { month: '5월', 수입: 9200000, 지출: 7800000 },
    { month: '6월', 수입: 11000000, 지출: 9500000 },
  ];

  const categoryData = [
    { name: '음향/영상', 비용: 8500000 },
    { name: '조명', 비용: 6200000 },
    { name: '무대/구조물', 비용: 7300000 },
    { name: '전력/케이블', 비용: 4200000 },
    { name: '위생/편의', 비용: 3100000 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}원
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-6">월별 수입/지출 현황</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="수입"
                stroke="#8884d8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="지출"
                stroke="#82ca9d"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorExpense)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-6">카테고리별 지출</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="비용" 
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;