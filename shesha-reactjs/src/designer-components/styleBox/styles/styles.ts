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
        height: 155px;
        overflow: hidden;
        width: 240px;
        margin-top: 10px;
      
        .${prefixCls}-input {
          border: none;
          background-color: transparent;
          padding: unset;
          position: absolute;
          text-align: center;
          width: 25px;
        }
      
        .${center} {
          border-radius: 5px;
          background-color: ${background};
          height: 40px;
          left: 35px;
          overflow: hidden;
          position: relative;
          top: 30px;
          width: 90px;
        }
      
        .${margTop} {
          position: absolute;
          top: 12px;
          left: 107px;
        }
      
        .${margLeft} {
          position: absolute;
          left: 2px;
          top: 79px;
        }
      
        .${margBottom} {
          position: absolute;
          bottom: 2px;
          left: 107px;
        }
      
        .${margRight} {
          position: absolute;
          left: 205px;
          top: 79px;
        }
      
        .${margin} {
          border-radius: 5px;
          background-color: ${background};
          height: 100%;
          width: 100%;
        }
      
        .${paddTop} {
          position: absolute;
          top: 2px;
          left: 70px;
        }
      
        .${paddLeft} {
          position: absolute;
          left: 2px;
          top: 39px;
        }
      
        .${paddBottom} {
          position: absolute;
          bottom: 2px;
          left: 70px;
        }
      
        .${paddRight} {
          position: absolute;
          left: 130px;
          top: 39px;
        }
      
        .${padding} {
          border-radius: 5px;
          background-color: #fff;
          height: 100px;
          left: 38px;
          overflow: hidden;
          position: relative;
          top: 30px;
          width: 160px;
        }
      
        .${title} {
          font-size: 12px;
          font-weight: bold;
          position: absolute;
          left: 8px;
          top: 5px;
          max-height: 28px;
          color: darkslategrey;
          font-weight: 500;
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