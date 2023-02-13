import React, { FC } from 'react';
import { Statistic, StatisticProps } from 'antd';
import { joinStringValues } from '../..';

export interface IShaStatisticProps extends StatisticProps {}

export const ShaStatistic: FC<IShaStatisticProps> = ({ className, ...rest }) => {
  return <Statistic className={joinStringValues(['sha-statistic', className])} {...rest} />;
};

export default ShaStatistic;
