import React from 'react';

interface Stat {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
}

interface StatsProps {
  stats: Stat[];
}

const Stats: React.FC<StatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white overflow-hidden shadow rounded-lg p-5"
        >
          <dt className="text-sm font-medium text-gray-500 truncate">
            {stat.label}
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {stat.value}
          </dd>
          {stat.change && (
            <div
              className={`mt-2 flex items-center text-sm ${
                stat.change.type === 'increase'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              <span>
                {stat.change.type === 'increase' ? '+' : '-'}
                {Math.abs(stat.change.value)}%
              </span>
              <span className="ml-2">전월 대비</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Stats;