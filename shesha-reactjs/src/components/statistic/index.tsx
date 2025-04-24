import React, { FC } from 'react';
import { Statistic, StatisticProps } from 'antd';
import { useStyles } from './styles/styles';
import classNames from 'classnames';

export interface IShaStatisticProps extends StatisticProps {
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

export const ShaStatistic: FC<IShaStatisticProps> = ({ className, ...rest }) => {
  const { styles } = useStyles({
    token: {
      fontSize: rest.valueStyle?.fontSize,
    },
  });

  const marginStyles = rest.style
    ? {
        margin: rest.style.margin,
        marginRight: rest.style.marginRight,
        marginLeft: rest.style.marginLeft,
        marginTop: rest.style.marginTop,
        marginBottom: rest.style.marginBottom,
      }
    : {};

  const restStyle = rest.style ? { ...rest.style } : {};
  if (restStyle) {
    delete restStyle.margin;
    delete restStyle.marginRight;
    delete restStyle.marginLeft;
    delete restStyle.marginTop;
    delete restStyle.marginBottom;
  }

  return (
    <div
      className={classNames(styles['container-div-zero-padding-margin'], styles['content-box'])}
      onClick={rest.onClick ? (e) => rest.onClick(e) : undefined}
      style={{
        ...marginStyles,
      }}
    >
      <Statistic className={classNames(styles.shaStatistic, className)} {...{ ...rest, style: restStyle }} />
    </div>
  );
};

export default ShaStatistic;
