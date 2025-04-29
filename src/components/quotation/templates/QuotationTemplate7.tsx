import React from 'react';
import { QuotationData } from '../QuotationTemplateModal';
import BaseTemplate from './BaseTemplate';

interface QuotationTemplateProps {
  data: QuotationData;
}

const QuotationTemplate7: React.FC<QuotationTemplateProps> = ({ data }) => {
  return <BaseTemplate data={data} />;
};

export default QuotationTemplate7;
