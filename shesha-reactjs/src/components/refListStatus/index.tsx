import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { useReferenceListItem } from '@/providers/referenceListDispatcher';
import { extractErrorMessage } from '@/providers/referenceListDispatcher/models';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { Alert, Skeleton } from 'antd';
import { CSSProperties, FC, useEffect } from 'react';
import { ShaIcon } from '../shaIcon';
import { RefListStatusPlaceholder } from './placeholder';
import { useStyles } from './styles/styles';
import RefTag from './tag';
import { DescriptionTooltip } from './tooltip';
import { DEFAULT_SOLID_COLOR, PLAIN_TEXT_STYLE, resolveColor, solidTagProps, SOLID_TEXT_COLOR } from './utils';
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
  /** Names the component on the designer canvas, where there is no value to show instead. */
  propertyName?: string | undefined;
  /**
   * Whether the display setting is a JS expression rather than a chosen mode. The designer canvas
   * has no data to evaluate one against, so it previews a fixed representative tag instead of
   * guessing which of the modes the expression will pick.
   */
  displayIsDynamic?: boolean | undefined;
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
    propertyName,
    displayIsDynamic = false,
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

  /**
   * A solid badge pulls its colour from the reference list item, the way the chevron does when its
   * colour source is set to the reference list. Items with no colour fall back to grey rather than
   * to nothing at all, which is what left Show Solid Background inert for colourless lists.
   */
  const solidColor = resolveColor(itemData?.color) ?? DEFAULT_SOLID_COLOR;

  // In designer mode, show a placeholder when there's no value or data
  if (typeof itemData?.itemValue === 'undefined' && !listItem.loading) {
    if (isDesigner) {
      return (
        <div className={cx(styles.shaStatusTagContainer, className)}>
          <RefListStatusPlaceholder
            referenceListId={referenceListId}
            propertyName={propertyName}
            displayIsDynamic={displayIsDynamic}
            showIcon={showIcon === true}
            showReflistName={showReflistName}
            solidBackground={solidBackground === true}
            style={style}
            tagClassName={cx(styles.shaStatusTag, disabled ? styles.shaStatusTagDisabled : undefined)}
          />
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
          {...(solidBackground === true ? solidTagProps(solidColor) : {})}
          icon={canShowIcon && !isNullOrWhiteSpace(itemData.icon) ? <ShaIcon iconName={itemData.icon} /> : null}
          /* With the name hidden the tag carries no text of its own, so name it explicitly - the
             description tooltip only reaches pointer users. */
          aria-label={showReflistName ? undefined : itemData.item ?? undefined}
          /* A solid badge paints its own background, so the caller's background declarations are
             dropped from the inline style and the text is forced white - the icon follows through
             `currentColor`. With the badge off there is no chrome at all, just the text. */
          style={solidBackground === true
            ? { ...rest, color: SOLID_TEXT_COLOR }
            : { ...style, ...PLAIN_TEXT_STYLE }}
          className={cx(styles.shaStatusTag, disabled ? styles.shaStatusTagDisabled : undefined)}
        >
          {showReflistName && itemData.item}
        </RefTag>
      </DescriptionTooltip>
    </div>
  );
};
