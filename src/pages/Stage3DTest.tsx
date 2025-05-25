import React from 'react';
import Stage3DConfigurator from '../components/Stage3DConfigurator';

const Stage3DTest: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">3D 무대 구성 및 견적 테스트</h1>
      <Stage3DConfigurator />
    </div>
  );
};

export default Stage3DTest;
