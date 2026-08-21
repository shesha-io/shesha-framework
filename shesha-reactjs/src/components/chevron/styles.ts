import { addPx } from '@/utils/style';
import { createStyles } from '@/styles';
import { IChevronControlProps } from './models';
import { paddingStyles } from '@/designer-components/_common/styles/utils';
import { isDefined } from '@/utils';

export const useStyles = createStyles(({ css, cx }, model: IChevronControlProps) => {
  const chevronButton = cx(`sha-chevron-btn`, css`
      clip-path: polygon(95% 0, 100% 50%, 95% 100%, 0% 100%, 5% 50%, 0% 0%);
      cursor: pointer;
      outline: none;
      height: ${isDefined(model.height) ? addPx(model.height) : '35px'};
      width: ${isDefined(model.width) ? addPx(model.width) : '150px'};
      min-width: ${isDefined(model.width) ? addPx(model.width) : '150px'};
      border-radius: 0;
      ${paddingStyles(model.stylingBoxJson)};

      &:hover {
          opacity: 0.7;
      }
  `);

  const chevronButtonActive = cx(`sha-chevron-btn-active`, css`
      opacity: 1;
  `);

  const pipelineContainer = cx(`sha-pipeline-container`, css`
      position: relative;
      display: block;
      margin: 0 10px;
      height: ${isDefined(model.height) ? addPx(model.height) : '35px'};
  `);

  const pipelineStages = cx(`sha-pipeline-stages`, css`
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      overflow-x: auto;
      scroll-behavior: smooth;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* Internet Explorer 10+ */
      padding: 0 10px;

      &::-webkit-scrollbar {
        display: none; /* WebKit */
      }
  `);

  const pipelineStage = cx(`sha-pipeline-stage`, css`
      flex-shrink: 0;
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      white-space: nowrap;
      margin-right: 10px;
    `);

  const arrowButton = cx(`sha-arrow-button`, css`
      transition: all 0.3s ease;
      position: absolute;
      display: flex;
      z-index: 10;
      top: 0;
      height: 100%;
      width: 30px;
      background-color: #e0e0e0;
      color: #666;
      border: none;
      border-radius: 0;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      cursor: pointer;

      &:hover {
        background-color: #f0f0f0;
      }
  `);


  const leftArrow = cx(`sha-left-arrow`, css`
      left: -8px;
      clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 25% 100%, 0% 50%);
  `);

  const rightArrow = cx(`sha-right-arrow`, css`
      right: -8px;
      clip-path: polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%);
  `);


  return {
    chevronButton,
    chevronButtonActive,
    pipelineContainer,
    pipelineStages,
    pipelineStage,
    leftArrow,
    rightArrow,
    arrowButton,
  };
});
