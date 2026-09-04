import { createStyles } from '@/styles';
import { IPhoneNumberComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';

export const useStyles = createStyles(({ css, cx, token }, model: IPhoneNumberComponentProps) => {
  const inputBoxStyles = `
    ${dimensionsStyles(model.dimensions)}
    ${paddingStyles(model.stylingBoxJson)}
  `;

  const phoneNumber = cx('sha-phone-number', css`
      ${borderStyles(model.border)}
      ${backgroundStyles(model.background)}
      ${shadowStyles(model.shadow)}
      ${fontStyles(model.font)}
      ${inputBoxStyles}

      /* The Appearance tab's dimensions land on this element, and its Styling Box padding and border
         land here too. Unlike the other input components - which hang their class straight off an antd
         Input, and so inherit antd's own border-box reset - this is a plain div, and no global reset
         applies one. Left at the default content-box, a width of 100% (the default) resolves to the
         parent's full width and then adds the horizontal padding and border on top, so the field spills
         past the form whenever nothing around it has slack to absorb the overflow - a Create form's
         root, say. It also made the field render taller than a text field beside it, since a configured
         height gained the border the same way. */
      box-sizing: border-box;

      /* The Appearance-tab border/background/dimensions live on this wrapper only. antd-phone-input renders
         a Select (country flag + dial code) and an Input joined via antd's Space.Compact - each of those has
         its own border/box-shadow stripped below so there is exactly one visible border on the wrapper, and
         the whole chain is stretched to 100% height so it fills whatever height is configured here rather
         than staying at its intrinsic size pinned to the top of a taller box. */
      display: flex;
      align-items: stretch;

      .ant-phone-input-wrapper,
      .ant-space-compact {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: stretch;
      }

      /* Newer antd Select variants (e.g. "outlined") render the border/background directly on .ant-select
         itself - there is no separate .ant-select-selector wrapper in this version - so that's what needs
         stripping here. .ant-select-selector is also covered defensively in case an older/newer antd build
         reintroduces that nesting. .ant-input-affix-wrapper covers the clearable variant of the Input
         (rendered when allowClear is set), which .ant-input alone does not reach. */
      .ant-select,
      .ant-select-selector {
        height: 100% !important;
        display: flex !important;
        align-items: center !important;
        background: transparent !important;
      }

      .ant-input,
      .ant-input-affix-wrapper {
        width: 100%;
        height: 100% !important;
        background: transparent !important;
        ${fontStyles(model.font)}
      }

      .ant-select,
      .ant-select-selector,
      .ant-input,
      .ant-input-affix-wrapper {
        border: none !important;
        box-shadow: none !important;
      }

      &:hover {
        border-color: ${token.colorPrimary} !important;
      }

      &&&&:hover,
      &&&&:focus,
      &&&&:focus-within,
      &&&&[class*="-status-error"],
      &&&&[class*="-status-warning"] {
        ${backgroundStyles(model.background)}
      }

      /* Inner controls' borders are stripped above so only the wrapper's border shows, but that also
         swallows antd's error/warning border since the status class lands on the inner Select/Input,
         not on this wrapper. Propagate it back here so invalid/warned values still show a visible border. */
      &:has(.ant-select-status-error, .ant-input-status-error, .ant-input-affix-wrapper-status-error) {
        border-color: ${token.colorError} !important;
      }

      &:has(.ant-select-status-warning, .ant-input-status-warning, .ant-input-affix-wrapper-status-warning) {
        border-color: ${token.colorWarning} !important;
      }
  `);

  return {
    phoneNumber,
  };
});
