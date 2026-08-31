import { createStyles } from '@/styles';
import { backgroundStyles, borderStyles, cssPropertiesToString, dimensionsStyles, fontStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
import { IRefListStatusComponentProps } from './interfaces';

export const useStyles = createStyles(({ css, cx, token }, model: IRefListStatusComponentProps) => {
  const refListStatus = cx('sha-ref-list-status', css`
    display: flex;
    align-items: center;
    width: fit-content;

    .ant-tag {
      display: flex;
      align-items: center;
      justify-content: ${model.font?.align === 'center' ? 'center' : model.font?.align === 'right' ? 'flex-end' : 'flex-start'};
      width: 100%;
      margin-inline-end: 0;
      text-transform: uppercase;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      ${borderStyles(model.border)}
      ${shadowStyles(model.shadow)}
      ${paddingStyles(model.stylingBoxJson)}
      ${dimensionsStyles(model.dimensions)}
      ${fontStyles(model.font)}
      ${backgroundStyles(model.background)}
      ${cssPropertiesToString(model.styleCss)}

      .sha-help-icon {
        cursor: help;
        font-size: 14px;
        color: #ad393981;
      }
    }
  `);

  /**
   * Traces the tag on the canvas, which the plain-text state otherwise gives no clue about. An
   * outline takes no space, and inset keeps it off the designer's own hover border on the ancestor.
   */
  const designerFootprint = cx('sha-ref-list-status-footprint', css`
    .ant-tag {
      outline: 1px dashed ${token.colorBorder};
      outline-offset: -1px;
    }
  `);

  return {
    refListStatus,
    designerFootprint,
  };
});
