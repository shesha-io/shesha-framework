import { createStyles } from '@/styles';
import { sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls, iconPrefixCls, token }) => {
   const shaStatistic = cx("sha-statistic", css`
    box-shadow: 0 7px 30px -10px rgba(150, 170, 180, 0.5);
    margin-right: 12px;
    border-left: 2.5px solid ${token.colorPrimary};
    margin-bottom: ${sheshaStyles.paddingLG}px;
    background: white;
    height: 100%;
    
    .${prefixCls}-statistic-title {
        padding-left: 8px;
        font-size: 16px;
        text-align: center;
    }
    
    .${prefixCls}-statistic-content {
        text-align: center;
        padding: 8px;
    }
    
    .${iconPrefixCls} {
        font-size: ${token?.fontSize};
    }
    
    .${prefixCls}-statistic-content-value-int {
        font-size: ${token?.fontSize};
    }    

    .container-div-zero-padding-margin {
        padding: 0;
        margin: 0;
    }

    .content-box {
        box-sizing: content-box;
    }
  `); 
  return {
    shaStatistic,
  };
});