import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, cx }) => {

    const themeParameters = cx(
        'theme-parameters',
        css`
      height: 100%;
      overflow-y: auto;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    `
    );

    const themeHeader = cx(
        'theme-parameters',
        css`
        font-size: 18px;
        font-weight: 700;
    `
    );

    const margin10 = cx('margin-10', css`
        margin-top: 10px;
    `);

    const renderColorBoxFlex = cx('render-color-box-flex', css`
        display: flex;
        align-items: center;
        justify-content: flex-start;
    `);

    const cursorPointer = cx('cursor-pointer', css`
        cursor: pointer;
    `);

    return {
        themeParameters,
        themeHeader,
        margin10,
        renderColorBoxFlex,
        cursorPointer
    };
});
