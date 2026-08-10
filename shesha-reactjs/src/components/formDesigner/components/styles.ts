import { createStyles } from '@/styles';
import { isNotNullOrWhiteSpace } from '@/utils/nullables';

type StylesArgs = {
  autoAlignLabel?: boolean;
  /**
   * The input's own configured height. When set, the label is pinned to exactly this height so a
   * validation message growing the control column cannot shift the label's vertical alignment.
   */
  inputHeight?: string | undefined;
};
type StylesResponse = {
  formItem: string;
  settingsFormItem: string;
};

export const useStyles = createStyles<StylesArgs, StylesResponse>(({ css, cx, token }, { autoAlignLabel = true, inputHeight }) => {
  const settingsFormItem = cx(css`
        margin: 0px !important;
  `);

  const formItem = cx(css`

        .ant-row {
            width: 100% !important;
        }

        .ant-form-item-row {
            width: 100% !important;

            > .ant-form-item-label {
                ${autoAlignLabel ? `
                  > label {
                    /* A validation message grows the control column. With height: 100% the label
                       grows with it and its text drifts out of line with the input. Pinning the
                       label to the input's own height keeps it aligned to the input alone, so the
                       message never moves it. Falls back to 100% when no height is configured. */
                    height: ${isNotNullOrWhiteSpace(inputHeight) ? inputHeight : '100%'};
                  }
                ` : ''};
            }
        }

        .ant-form-item-control {
            width: 100% !important;
            align-self: center;
        }
       
        .ant-form-item-control-input {
            width: 100% !important;
            min-height: 0px !important;
        }
       
        .ant-form-item-control-input-content {
            width: 100% !important;
        }

        &:hover {
            border-color: ${token.colorPrimary} !important;
        }
  `);
  return {
    formItem,
    settingsFormItem,
  };
});
