import React, { FC } from 'react';
import { Statistic, StatisticProps } from 'antd';
import { useStyles } from './styles/styles';
import classNames from 'classnames';

export interface IShaStatisticProps extends StatisticProps {
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

export const ShaStatistic: FC<IShaStatisticProps> = ({ className, ...rest }) => {
  const { styles } = useStyles();
  
  return (<div onClick={e => rest.onClick(e)}>
    <Statistic className={classNames(styles.shaStatistic, className)} {...rest} />
  </div>);
};

export default ShaStatistic;
