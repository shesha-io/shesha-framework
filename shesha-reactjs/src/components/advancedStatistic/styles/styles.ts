import { createStyles, sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }) => {
  const advancedStatisticContainer = cx("sha-advanced-statistic", css`
    display: flex;
    align-items: center;
    background: white;
    border-radius: 8px;
    box-shadow: 0 7px 30px -10px rgba(150, 170, 180, 0.5);
    padding: ${sheshaStyles.paddingMD}px;
    height: 100%;
    position: relative;
    box-sizing: border-box;
  `);

  const sideIcon = css`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  `;

  const leftSideIcon = cx(sideIcon, css`
    margin-right: ${sheshaStyles.paddingMD}px;
  `);

  const rightSideIcon = cx(sideIcon, css`
    margin-left: ${sheshaStyles.paddingMD}px;
  `);

  const contentContainer = css`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 0;
  `;

  const titleTop = css`
    width: 100%;
    margin-bottom: ${sheshaStyles.paddingSM}px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
  `;

  const titleBottom = css`
    width: 100%;
    margin-top: ${sheshaStyles.paddingSM}px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
  `;

  const valueContainer = css`
    display: flex;
    align-items: baseline;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
  `;

  const valueMain = css`
    font-size: 32px;
    font-weight: 600;
    color: ${token.colorPrimary};
    line-height: 1;
  `;

  const prefixContainer = css`
    display: inline-flex;
    align-items: baseline;
    margin-right: 8px;
    line-height: 1;
  `;

  const suffixContainer = css`
    display: inline-flex;
    align-items: baseline;
    margin-left: 8px;
    line-height: 1;
  `;

  const prefixSuffixIcon = css`
    margin: 0 4px;
  `;

  return {
    advancedStatisticContainer,
    leftSideIcon,
    rightSideIcon,
    contentContainer,
    titleTop,
    titleBottom,
    valueContainer,
    valueMain,
    prefixContainer,
    suffixContainer,
    prefixSuffixIcon,
  };
});
