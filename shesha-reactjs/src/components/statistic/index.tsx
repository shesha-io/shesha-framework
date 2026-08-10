import React, { FC } from 'react';
import { Statistic, StatisticProps } from 'antd';
import { useStyles } from './styles/styles';
import classNames from 'classnames';
import { StatisticSemanticStyles } from 'antd/lib/statistic';

export interface IShaStatisticProps extends StatisticProps {
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

export const ShaStatistic: FC<IShaStatisticProps> = ({ className, ...rest }) => {
  const fontSize = (rest.styles as StatisticSemanticStyles | undefined)?.content?.fontSize;
  const { styles } = useStyles({
    token: {
      fontSize: fontSize,
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

  delete restStyle.margin;
  delete restStyle.marginRight;
  delete restStyle.marginLeft;
  delete restStyle.marginTop;
  delete restStyle.marginBottom;

  const { onClick } = rest;
  return (
    <div
      className={classNames(styles.containerDivZeroPaddingMargin, styles.contentBox)}
      {...(onClick ? { onClick } : {})}
      style={{
        ...marginStyles,
      }}
    >
      <Statistic className={classNames(styles.shaStatistic, className)} {...{ ...rest, style: restStyle }} />
    </div>
  );
};

export default ShaStatistic;
