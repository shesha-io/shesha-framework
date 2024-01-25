import React, { FC } from 'react';
import { Statistic, StatisticProps } from 'antd';
import { useStyles } from './styles/styles';
import classNames from 'classnames';

export interface IShaStatisticProps extends StatisticProps { }

export const ShaStatistic: FC<IShaStatisticProps> = ({ className, ...rest }) => {
  const { styles } = useStyles();
  return <Statistic className={classNames(styles.shaStatistic, className)} {...rest} />;
};

export default ShaStatistic;
