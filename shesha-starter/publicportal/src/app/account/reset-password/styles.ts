import { UnAuthedAccountPageLayout } from '@/components';
import styled from 'styled-components';

export const ResetPasswordContainer = styled(UnAuthedAccountPageLayout)`
  &.not-authorized {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
`;
