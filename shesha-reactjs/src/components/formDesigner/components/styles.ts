import { createStyles } from '@/styles';
import { FormLayout } from 'antd/es/form/Form';
import { IToolboxComponent } from '@/interfaces';

export interface UseStylesProps {
  layout: FormLayout;
  hasLabel: boolean;
  noLabelAutoMargin?: boolean;
  preserveDimensionsInDesigner?: IToolboxComponent['preserveDimensionsInDesigner'];
}

/**
 * Checks if height should be preserved based on preserveDimensionsInDesigner.
 * Returns true if all dimensions are preserved (true) or height is in the array.
 */
const shouldPreserveHeight = (preserve: IToolboxComponent['preserveDimensionsInDesigner']): boolean => {
  if (preserve === true) return true;
  if (Array.isArray(preserve)) return preserve.includes('height');
  return false;
};

export const useStyles = createStyles(({ css, cx }, { layout, hasLabel, noLabelAutoMargin, preserveDimensionsInDesigner }: UseStylesProps) => {
  const LABEL_HEIGHT = '32px';
  const preserveHeight = shouldPreserveHeight(preserveDimensionsInDesigner);

  const formItem = cx(css`
        --ant-form-item-margin-bottom: 0px !important;
        position: relative;
        height: 100%;
        
        .ant-form-item-row {
            height: 100%;
            width: 100%;

          >.ant-form-item-label  {
            ${noLabelAutoMargin ? 'margin: unset;' : 'margin: auto 0;'};
          }
        }

        .ant-row .ant-form-item-control {
            width: 100% !important;
            height: ${layout === 'vertical' && hasLabel ? `calc(100% - ${LABEL_HEIGHT})` : 'auto'} !important;
            max-height: ${layout === 'vertical' && hasLabel ? `calc(100% - ${LABEL_HEIGHT})` : '100%'};

            .ant-form-item-control-input {
                min-height : 0px !important;
                flex: 1;
                width: 100%;
                height: 100%;

                .ant-form-item-control-input-content {
                    ${preserveHeight ? 'height: auto' : 'height: 100%'};
                    width: 100%;
                    > div {
                     &:empty {
                       display: none;
                     }
                    }
                }
            }

            .ant-form-item-additional {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                transform: translateY(100%);
                z-index: 1;
            }
        }
  `);
  return {
    formItem,
  };
});
