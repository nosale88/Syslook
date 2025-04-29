import React from 'react';
import { QuotationData } from '../QuotationTemplateModal';
import BaseTemplate from './BaseTemplate';

interface QuotationTemplateProps {
  data: QuotationData;
}

const QuotationTemplate9: React.FC<QuotationTemplateProps> = ({ data }) => {
  return <BaseTemplate data={data} />;
};

export default QuotationTemplate9;
