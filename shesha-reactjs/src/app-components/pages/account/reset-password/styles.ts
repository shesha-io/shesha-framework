import UnAuthedAccountPageLayout from '@/components/unAuthedAccountPageLayout';
import styled from 'styled-components';

/**
 * There was an error
 * TS4023: Exported variable 'xxx' has or is using name 'zzz' from external module "yyy" but cannot be named.
 *
 * found a solution
 * https://stackoverflow.com/questions/43900035/ts4023-exported-variable-x-has-or-is-using-name-y-from-external-module-but
 *
 */

export const ResetPasswordContainer: any = styled(UnAuthedAccountPageLayout)`
  &.not-authorized {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
`;
