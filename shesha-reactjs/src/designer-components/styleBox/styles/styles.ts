import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }) => {
  const isDarkMode = token.colorBgBase === '#000';
  const backgroundColorMargin = isDarkMode ? token.colorBgBase : '#f5f5f5';
  const backgroundColorPadding = isDarkMode ? token.colorBgContainer : '#fff';

  const shaStyleBox = cx("sha-style-box", css`
      display: block;
      height: 155px;
      overflow: hidden;
      min-width: 200px;
      max-width: 300px;
      width: 100%; 
      margin-top: 10px;

      div {
        position: relative;
        align-items: center;
        justify-content: center;
      }

      input {
        border: 1px solid #d9d9d9;
        padding: unset;
        text-align: center;
        width: 30px;
      }
      
      .sha-style-box-margin {
        background-color: ${backgroundColorMargin};
      }
      
      .sha-style-box-padding {
        background-color: ${backgroundColorPadding};
      }
      
      .sha-style-box-text {
        position: absolute;
        left: 4px;
        font-size: 11px;
        max-height: 28px;
        color: ${token.colorTextSecondary};
        font-weight: 500;
      }
      
      .sha-style-box-mtb {
        height: 20%;
        display: flex;
        flex-direction: column;
      }

      .sha-style-box-mlr {
        height: 100%;
        width: 17%;
        display: flex;
        flex-direction: column;
      }

      .sha-style-box-center {
        height: 60%;
        width: 100%;
        display: flex;
        flex-direction: row;
      }

      .sha-style-box-padding-container {
        height: 100%;
        width: 66%;
        display: block;
      }

      .sha-style-box-ptb {
        height: 33%;
        display: flex;
        flex-direction: column;
      }

      .sha-style-box-padding-center {
        height: 34%;
        width: 100%;
        display: flex;
        flex-direction: row;
      }

      .sha-style-box-plr {
        height: 100%;
        width: 25%;
        display: flex;
        flex-direction: column;
      }

      .sha-style-box-inner {
        height: 100%;
        width: 50%;
      }

    `);
  return {
    shaStyleBox,
  };
});
