import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const sliderWrapper = cx("sha-slider-wrapper", css`
    .ant-form-item-control-input-content {
        margin-right: 8px !important;
    }
  `);

  return {
    sliderWrapper,
  };
});
