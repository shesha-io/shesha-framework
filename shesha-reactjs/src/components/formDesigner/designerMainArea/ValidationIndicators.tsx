import { useAllValidationResults } from '@/providers/validator/hooks';
import { isNullOrWhiteSpace } from '@/utils';
import { ISheshaErrorTypes } from '@/utils/errors';
import { CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import { FC, useMemo } from 'react';

const getValidationTooltip = (errors: number, warnings: number): string => {
  if (errors + warnings === 0)
    return 'No problems found';
  let result = '';
  if (errors > 0)
    result += `Errors: ${errors}`;
  if (warnings > 0) {
    if (!isNullOrWhiteSpace(result))
      result += ', ';
    result += `Warnings: ${warnings}`;
  }
  return result;
};

export const ValidationIndicators: FC = () => {
  const data = useAllValidationResults();
  const counts = useMemo(() => {
    return data.reduce(
      (acc, item) => {
        acc[item.type] = (acc[item.type] ?? 0) + 1;
        return acc;
      },
      {} as Record<ISheshaErrorTypes, number | undefined>,
    );
  }, [data]);

  return (
    <Space size="small" title={getValidationTooltip(counts.error ?? 0, counts.warning ?? 0)}>
      <span><CloseCircleOutlined /> {counts.error ?? 0}</span>
      <span><WarningOutlined /> {counts.warning ?? 0}</span>
    </Space>
  );
};
