import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const image = cx(css`
        max-width: 150px;
        
        .ant-upload-list-item-container {
         top: 25px !important;
         position: relative;
        }
    `);


  return {
    image,
  };
});
