import { createStyles, sheshaStyles } from '@/styles';
import { ISectionSeparatorProps } from '..';
import { addPx } from '@/utils/style';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { fontStyles, marginStyles, paddingStyles } from '@/designer-components/_common/styles/utils';

export const useStyles = createStyles(({ css, cx, token }, model: ISectionSeparatorProps) => {
  const primaryColor = token.colorPrimary;

  const border = `${model.lineThickness ?? 2}px ${isNullOrWhiteSpace(model.lineType) ? 'solid' : model.lineType} ${isNullOrWhiteSpace(model.lineColor) ? primaryColor : model.lineColor}`;

  const titleMargin = isDefined(model.titleMargin)
    ? 'margin: 0 8px;'
    : model.labelAlign === 'left'
      ? 'margin: 0 8px 0 0;'
      : model.labelAlign === 'right'
        ? 'margin: 0 0 0 8px;'
        : 'margin: 0 8px;';

  const shaSectionSeparatorLineLeft = 'sha-section-separator-line';
  const shaSectionSeparatorLineRight = 'sha-section-separator-line-right';
  const shaSectionSeparatorTitle = 'sha-section-separator-title';

  const shaSectionSeparatorWrapperHorisontal = cx('sha-section-separator-wrapper-horizontal', css`
    height: max-content;
    display: flex;
    flex-direction: row;
    align-items: center;
    width: ${addPx(model.lineWidth) ?? '100%'};
  `);

  const shaSectionSeparatorWrapperVertical = cx('sha-section-separator-wrapper-vertical', css`
    width: max-content;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: ${addPx(model.lineHeight) ?? '100%'};
  `);

  const shaSectionSeparator = cx("sha-section-separator", css`
    ${marginStyles(model.containerStylingBoxJson)}
    height: ${sheshaStyles.pageHeadingHeight}px;
    width: 100%;
    border-bottom: ${model.inline === true && Boolean(model.title) ? 'none' : border};

    .inline {
      border-bottom: ${border};
    }
  `);

  const titleContainer = cx("title-container", css`
      align-items: center;
      display: flex;
      width: 100%;
      flex-wrap: nowrap;
      align-items: center;

      .${shaSectionSeparatorLineLeft} {
        width: 100%;
        border-bottom: ${model.inline === true ? border : 'none'};
        padding-right: ${model.titleMargin ?? 8}px;
      }
      .${shaSectionSeparatorLineRight} {
        width: 100%;
        border-bottom: ${model.inline === true ? border : 'none'};
        padding-left: ${model.titleMargin ?? 8}px;
      }

      .${shaSectionSeparatorTitle} {
        ${paddingStyles(model.containerStylingBoxJson)}

        ${fontStyles(model.font)}
        white-space: nowrap;
        display: flex;
        align-items: center;
        ${titleMargin}
      }
  `);

  const vertical = cx("vertical-separator", css`
        width: max-content;
        height: ${addPx(model.lineHeight) ?? '0.9em'};
        min-width: 0 !important;
        ${marginStyles(model.containerStylingBoxJson)}
        border-right: ${border};
    `);

  const helpIcon = cx("help-icon-question-circle", css`
        color: #aaa;
        margin-left: 8px;
        font-size: 14px !important;
    `);

  return {
    shaSectionSeparatorWrapperHorisontal,
    shaSectionSeparatorWrapperVertical,
    shaSectionSeparator,
    primaryColor,
    helpIcon,
    titleContainer,
    shaSectionSeparatorLineLeft,
    shaSectionSeparatorLineRight,
    shaSectionSeparatorTitle,
    vertical,
  };
});
