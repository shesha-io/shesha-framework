import { marginStyles } from '@/designer-components/_common/styles/utils';
import { IConfigurableFormComponent } from '@/providers';
import { createStyles } from '@/styles';
import { addPx } from '@/utils/style';
import { isExactDimensionValue } from '../utils/stylingUtils';
import { isDefined } from '@/utils';

export const useStyles = createStyles(({ css, cx, token }, model: IConfigurableFormComponent & { autoAlignLabel?: boolean | undefined }) => {
  const settingsFormItem = cx(css`
        margin: 0px !important;
  `);

  const height = addPx(model.dimensions?.height);

  const formItem = cx('sha-form-item', css`
        ${marginStyles({ ...model.stylingBoxJson, paddingBottom: isDefined(model.stylingBoxJson?.paddingBottom) ? model.stylingBoxJson.paddingBottom : 0, _type: 'styleBox' })}

        .ant-row {
            width: 100%;
        }

        .ant-form-item-row {
            width: 100%;

            > .ant-form-item-label {
                align-content: center;
                min-height: fit-content;
                ${model.autoAlignLabel !== false
                  ? `
                  /* A validation message grows the control column. With height: 100% the label
                      grows with it and its text drifts out of line with the input. Pinning the
                      label to the input's own height keeps it aligned to the input alone, so the
                      message never moves it. Falls back to 100% when no height is configured. */
                  height: ${isExactDimensionValue(height) ? height : 'stretch' /* ToDo: AS - review this */};
                  ` : ''};
            }
        }

        .ant-form-item-control {
            width: 100%;
            align-self: center;
        }
       
        .ant-form-item-control-input {
            width: 100%;
            min-height: 0px !important;
        }
       
        .ant-form-item-control-input-content {
            width: 100%;
        }

        &:hover {
            border-color: ${token.colorPrimary};
        }
  `);
  return {
    formItem,
    settingsFormItem,
  };
});
