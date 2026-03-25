import { createStyles, sheshaStyles } from '@/styles';

export interface StatusTagStyleProps {
  readOnly?: boolean;
}

export const useStyles = createStyles(({ css, cx }, props: StatusTagStyleProps) => {
  const { readOnly } = props;
   const shaStatusTag = cx("sha-status-tag", css`
    text-transform: uppercase;
    text-align: center;
    align-self: center;
    margin: ${readOnly ? `0 ${sheshaStyles.paddingLG}px` : '0'} !important;
  `);
  return {
    shaStatusTag,
  };
});