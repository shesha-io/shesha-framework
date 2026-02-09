import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const wrapper = cx('sha-context-property-autocomplete', css`
    margin-bottom: 10px;
  `);

  const bindingOptionBtn = cx('sha-binding-option-button', css`
    margin-top: 10px;
  `);

  const label = cx("properties-label", css`
    font-size: 12px;
    color: darkslategrey;
    font-weight: 500;
    position: relative;
    
    +.ant-form-item-tooltip {
        align-self: end !important;
        position: relative;
        bottom: -2px;
        margin-right: 8px;
    }

    +.sha-required-mark {
        position: relative;
        bottom: -8px;
    }
`);

  return {
    label,
    wrapper,
    bindingOptionBtn,
  };
});
