import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { useReferenceListItem } from '@/providers/referenceListDispatcher';
import { extractErrorMessage } from '@/providers/referenceListDispatcher/models';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { Alert, Skeleton } from 'antd';
import { CSSProperties, FC, useEffect } from 'react';
import { ShaIcon } from '../shaIcon';
import { useStyles } from './styles/styles';
import RefTag from './tag';
import { DescriptionTooltip } from './tooltip';
import { CSSObject } from 'antd-style';

export interface IRefListStatusProps {
  referenceListId: IReferenceListIdentifier;
  showIcon?: boolean | undefined;
  solidBackground?: boolean | undefined;
  showReflistName?: boolean | undefined;
  style?: CSSProperties | undefined;
  value?: number | undefined;
  isDesigner?: boolean | undefined;
  readOnly?: boolean;
  /**
   * Greys the tag out and blocks pointer interaction. Distinct from `readOnly`, which keeps the
   * value fully legible and hoverable.
   *
   * Tab order and ARIA state are unchanged: the tag renders as a `span`, which is not focusable to
   * begin with, and carries no interactive role for `aria-disabled` to qualify.
   */
  disabled?: boolean | undefined;
  /** Emotion class carrying the configured appearance; applied to the tag container. */
  className?: string | undefined;
  /** Reports the resolved item text so a caller can expose it (e.g. through the component API). */
  onItemTextChange?: ((itemText: string | null | undefined) => void) | undefined;
}

export const RefListStatus: FC<IRefListStatusProps> = (props) => {
  const {
    value,
    referenceListId,
    showIcon,
    solidBackground,
    showReflistName = false,
    style = {},
    isDesigner = false,
    readOnly = false,
    disabled = false,
    className,
    onItemTextChange,
  } = props;
  const { width, height, minHeight, minWidth, maxHeight, maxWidth } = style;
  const dimensionsStyles = { width, height, minHeight, minWidth, maxHeight, maxWidth };
  const { fontSize, fontWeight, textAlign, color, backgroundColor, backgroundImage, ...rest } = style;
  const fontStyles = { fontSize, fontWeight, textAlign };
  const { styles, cx } = useStyles({ dimensionsStyles, fontStyles: fontStyles as CSSObject, readOnly });
  const listItem = useReferenceListItem(referenceListId.module, referenceListId.name, value);

  const resolvedItemText = listItem.data?.item;
  useEffect(() => {
    onItemTextChange?.(resolvedItemText);
  }, [onItemTextChange, resolvedItemText]);

  if (listItem.error && !listItem.loading) {
    return (
      <Alert
        showIcon
        title="Something went during Reflists fetch"
        description={extractErrorMessage(listItem.error)}
        type="error"
      />
    );
  }

  const itemData = listItem.data;

  const canShowIcon = showIcon && itemData?.icon;

  // In designer mode, show a placeholder when there's no value or data
  if (typeof itemData?.itemValue === 'undefined' && !listItem.loading) {
    if (isDesigner) {
      return (
        <div className={cx(styles.shaStatusTagContainer, className)}>
          <RefTag
            color="#d9d9d9"
            icon={null}
            style={style}
            className={cx(styles.shaStatusTag, disabled ? styles.shaStatusTagDisabled : undefined)}
          >
            {showReflistName ? 'Reference List Item' : 'N/A'}
          </RefTag>
        </div>
      );
    }
    return null;
  }

  return listItem.loading || !itemData ? (
    <Skeleton.Button />
  ) : (

    <div className={cx(styles.shaStatusTagContainer, className)}>
      <DescriptionTooltip showReflistName={showReflistName} currentStatus={itemData}>
        <RefTag
          {...(solidBackground && !isNullOrWhiteSpace(itemData.color) ? { color: itemData.color } : {})}
          icon={canShowIcon && !isNullOrWhiteSpace(itemData.icon) ? <ShaIcon iconName={itemData.icon} /> : null}
          style={!solidBackground || !itemData.color ? style : { ...rest }}
          className={cx(styles.shaStatusTag, disabled ? styles.shaStatusTagDisabled : undefined)}
        >
          {showReflistName && itemData.item}
        </RefTag>
      </DescriptionTooltip>
    </div>
  );
};
