import UnAuthedAccountPageLayout from '@/components/unAuthedAccountPageLayout';
import styled from 'styled-components';

export const ResetPasswordContainer = styled(UnAuthedAccountPageLayout)`
  &.not-authorized {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
`;
