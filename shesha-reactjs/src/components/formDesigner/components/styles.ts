import { createStyles } from '@/styles';

export interface UseStylesProps {
  autoAlignLabel?: boolean;
}
export const useStyles = createStyles(({ css, cx }, { autoAlignLabel = true }) => {
  const settingsFormItem = cx(css`
        margin: 0px !important;
  `);

  const formItem = cx(css`
    --ant-form-item-margin-bottom: 0px !important;
    position: relative;
    height: auto;
    
    .ant-form-item-row {
        height: 100%;
        width: 100%;

      >.ant-form-item-label  {
        ${autoAlignLabel ? 'margin: auto 0;' : 'margin: unset;'};
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
    settingsFormItem,
  };
});
