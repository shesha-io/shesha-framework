import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const dynamicModalBody = cx("sha-dynamic-modal-body", css`
        overflow: auto;
        max-height: 70vh;
    `);

  return {
    dynamicModalBody,
  };
});
