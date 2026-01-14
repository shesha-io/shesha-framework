import React, { FC, useMemo, CSSProperties } from 'react';
import { useStyles } from './styles/styles';
import classNames from 'classnames';
import ShaIcon, { IconType } from '@/components/shaIcon';
import { IAdvancedStatisticProps } from './interfaces';
import { removeUndefinedProps } from '@/utils/object';

const formatValue = (value: number | string | undefined, precision?: number): string => {
  if (value === undefined || value === null) return '';

  if (typeof value === 'number' && precision !== undefined) {
    return value.toFixed(precision);
  }

  return String(value);
};

export const ShaAdvancedStatistic: FC<IAdvancedStatisticProps> = ({
  value,
  precision,
  leftIcon,
  rightIcon,
  topTitle,
  bottomTitle,
  prefix,
  suffix,
  valueFont,
  valueStyle,
  containerStyle,
  onClick,
}) => {
  const { styles } = useStyles();

  const formattedValue = useMemo(() => formatValue(value, precision), [value, precision]);

  const valueFontStyles = useMemo((): CSSProperties => {
    if (!valueFont) return {};
    return removeUndefinedProps({
      fontFamily: valueFont.type,
      fontSize: valueFont.size ? `${valueFont.size}px` : undefined,
      fontWeight: valueFont.weight,
      color: valueFont.color,
    });
  }, [valueFont]);

  const topTitleFontStyles = useMemo((): CSSProperties => {
    if (!topTitle?.font) return {};
    return removeUndefinedProps({
      fontFamily: topTitle.font.type,
      fontSize: topTitle.font.size ? `${topTitle.font.size}px` : undefined,
      fontWeight: topTitle.font.weight,
      color: topTitle.font.color,
    });
  }, [topTitle?.font]);

  const bottomTitleFontStyles = useMemo((): CSSProperties => {
    if (!bottomTitle?.font) return {};
    return removeUndefinedProps({
      fontFamily: bottomTitle.font.type,
      fontSize: bottomTitle.font.size ? `${bottomTitle.font.size}px` : undefined,
      fontWeight: bottomTitle.font.weight,
      color: bottomTitle.font.color,
    });
  }, [bottomTitle?.font]);

  const topTitleStyle = useMemo((): CSSProperties => {
    return removeUndefinedProps({
      ...topTitleFontStyles,
      ...topTitle?.style,
      textAlign: topTitle?.align || 'center',
    });
  }, [topTitleFontStyles, topTitle?.style, topTitle?.align]);

  const bottomTitleStyle = useMemo((): CSSProperties => {
    return removeUndefinedProps({
      ...bottomTitleFontStyles,
      ...bottomTitle?.style,
      textAlign: bottomTitle?.align || 'center',
    });
  }, [bottomTitleFontStyles, bottomTitle?.style, bottomTitle?.align]);

  const leftIconStyle = useMemo((): CSSProperties => {
    return removeUndefinedProps({
      fontSize: leftIcon?.size ? `${leftIcon.size}px` : '48px',
      color: leftIcon?.color,
      ...leftIcon?.style,
    });
  }, [leftIcon]);

  const rightIconStyle = useMemo((): CSSProperties => {
    return removeUndefinedProps({
      fontSize: rightIcon?.size ? `${rightIcon.size}px` : '48px',
      color: rightIcon?.color,
      ...rightIcon?.style,
    });
  }, [rightIcon]);

  const prefixStyle = useMemo((): CSSProperties => {
    return removeUndefinedProps({
      color: prefix?.color,
      fontSize: prefix?.iconSize ? `${prefix.iconSize}px` : undefined,
      ...prefix?.style,
    });
  }, [prefix]);

  const suffixStyle = useMemo((): CSSProperties => {
    return removeUndefinedProps({
      color: suffix?.color,
      fontSize: suffix?.iconSize ? `${suffix.iconSize}px` : undefined,
      ...suffix?.style,
    });
  }, [suffix]);

  const mergedValueStyle = useMemo((): CSSProperties => {
    return removeUndefinedProps({
      ...valueFontStyles,
      ...valueStyle,
    });
  }, [valueFontStyles, valueStyle]);

  return (
    <div
      className={classNames(styles.advancedStatisticContainer)}
      style={containerStyle}
      onClick={onClick}
    >
      {leftIcon?.icon && (
        <div className={styles.leftSideIcon} style={leftIconStyle}>
          <ShaIcon iconName={leftIcon.icon as IconType} />
        </div>
      )}

      <div className={styles.contentContainer}>
        {topTitle?.text && (
          <div className={styles.titleTop} style={topTitleStyle}>
            {topTitle.text}
          </div>
        )}

        <div className={styles.valueContainer}>
          {(prefix?.text || prefix?.icon) && (
            <div className={styles.prefixContainer} style={prefixStyle}>
              {prefix.icon && (
                <span className={styles.prefixSuffixIcon}>
                  <ShaIcon iconName={prefix.icon as IconType} />
                </span>
              )}
              {prefix.text && <span>{prefix.text}</span>}
            </div>
          )}

          <div className={styles.valueMain} style={mergedValueStyle}>
            {formattedValue || '0'}
          </div>

          {(suffix?.text || suffix?.icon) && (
            <div className={styles.suffixContainer} style={suffixStyle}>
              {suffix.text && <span>{suffix.text}</span>}
              {suffix.icon && (
                <span className={styles.prefixSuffixIcon}>
                  <ShaIcon iconName={suffix.icon as IconType} />
                </span>
              )}
            </div>
          )}
        </div>

        {bottomTitle?.text && (
          <div className={styles.titleBottom} style={bottomTitleStyle}>
            {bottomTitle.text}
          </div>
        )}
      </div>

      {rightIcon?.icon && (
        <div className={styles.rightSideIcon} style={rightIconStyle}>
          <ShaIcon iconName={rightIcon.icon as IconType} />
        </div>
      )}
    </div>
  );
};

export default ShaAdvancedStatistic;
