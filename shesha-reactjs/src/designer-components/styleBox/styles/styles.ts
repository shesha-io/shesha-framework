import { createStyles } from '@/styles';
import { IInputDirection, IValue } from '../interfaces';

export const getStyleClassName = (type: keyof IValue, direction: keyof IInputDirection) =>
  `${type.substring(0, 4)}-${direction}`;

export const useStyles = createStyles(({ css, cx, prefixCls }) => {
  const background = "#f5f5f5";

  const center = "center";

  const margin = "margin";
  const margTop = getStyleClassName('margin', 'top');
  const margLeft = getStyleClassName('margin', 'left');
  const margBottom = getStyleClassName('margin', 'bottom');
  const margRight = getStyleClassName('margin', 'right');

  const padding = "padding";
  const paddTop = getStyleClassName('padding', 'top');
  const paddLeft = getStyleClassName('padding', 'left');
  const paddBottom = getStyleClassName('padding', 'bottom');
  const paddRight = getStyleClassName('padding', 'right');
  const title = "title";

  const shaStyleBox = cx("sha-style-box", css`
        height: 200px;
        overflow: hidden;
        width: 320px;
      
        .${prefixCls}-input {
          border: none;
          background-color: transparent;
          padding: unset;
          position: absolute;
          text-align: center;
          width: 26px;
        }
      
        .${center} {
          border-radius: 5px;
          background-color: ${background};
          height: 50px;
          left: 45px;
          overflow: hidden;
          position: relative;
          top: 35px;
          width: 134px;
        }
      
        .${margTop} {
          top: 2px;
          left: 147px;
        }
      
        .${margLeft} {
          left: 2px;
          top: 89px;
        }
      
        .${margBottom} {
          bottom: 2px;
          left: 147px;
        }
      
        .${margRight} {
          left: 292px;
          top: 89px;
        }
      
        .${margin} {
          border-radius: 5px;
          background-color: ${background};
          height: 100%;
          width: 100%;
        }
      
        .${paddTop} {
          top: 2px;
          left: 99px;
        }
      
        .${paddLeft} {
          left: 2px;
          top: 49px;
        }
      
        .${paddBottom} {
          bottom: 2px;
          left: 99px;
        }
      
        .${paddRight} {
          left: 196px;
          top: 49px;
        }
      
        .${padding} {
          border-radius: 5px;
          background-color: #fff;
          height: 120px;
          left: 48px;
          overflow: hidden;
          position: relative;
          top: 40px;
          width: 224px;
        }
      
        .${title} {
          font-size: 14px;
          font-weight: bold;
          position: absolute;
          left: 8px;
          top: 5px;
        }
      
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      
        /* Firefox */
        input[type='number'] {
          -moz-appearance: textfield;
        }
      
        input:focus-visible {
          outline: unset;
        }
    `);
  return {
    shaStyleBox,
    center,
    margTop,
    margLeft,
    margBottom,
    margRight,
    margin,
    paddTop,
    paddLeft,
    paddBottom,
    paddRight,
    padding,
    title,
  };
});