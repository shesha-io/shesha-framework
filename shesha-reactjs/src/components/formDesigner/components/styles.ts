import { createStyles } from '@/styles';
import { FormLayout } from 'antd/es/form/Form';

export interface UseStylesProps {
  layout: FormLayout;
  hasLabel: boolean;
}

export const useStyles = createStyles(({ css, cx }, { layout, hasLabel }: UseStylesProps) => {
  const LABEL_HEIGHT = '32px';

  const formItem = cx(css`
        --ant-form-item-margin-bottom: 0px !important;
        .ant-form-item-row {
            height: 100%;
            width: 100%;
        }

        .ant-row .ant-form-item-control {
            width: 100% !important;
            height: ${layout === 'vertical' && hasLabel ? `calc(100% - ${LABEL_HEIGHT})` : '100%'} !important;
            max-height: ${layout === 'vertical' && hasLabel ? `calc(100% - ${LABEL_HEIGHT})` : '100%'};

            .ant-form-item-control-input {
                min-height : 0px !important;
                height: 100%;
                width: 100%;

                .ant-form-item-control-input-content {
                    height: 100%;
                    width: 100%;
                    > div:not(.sha-style-box) {
                     height: 100%;
                     width: 100%;
                    }
                }
            }
        }
  `);
  return {
    formItem,
  };
});
