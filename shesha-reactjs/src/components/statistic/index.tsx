import React, { FC } from 'react';
import { joinStringValues } from '@/utils';
import { Statistic, StatisticProps } from 'antd';

export interface IShaStatisticProps extends StatisticProps {}

export const ShaStatistic: FC<IShaStatisticProps> = ({ className, ...rest }) => {
  return <Statistic className={joinStringValues(['sha-statistic', className])} {...rest} />;
};

export default ShaStatistic;
