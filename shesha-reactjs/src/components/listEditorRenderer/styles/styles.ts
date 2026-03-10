import { createStyles, sheshaStyles } from '@/styles';


export const useStyles = createStyles(({ css, cx }) => {
  const prefix = "sha-le";
  const split = "split";
  const mainArea = `${prefix}-main`;
  const propsPanel = `${prefix}-props`;
  const propsPanelContent = `${prefix}-props-content`;


  const propsPanelHeader = `${prefix}-props-header`;
  const propsPanelTitle = `${prefix}-props-title`;

  const propsPanelBody = `${prefix}-props-body`;
  const propsPanelBodyContent = `${prefix}-props-content`;

  const container = cx(prefix, css`
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: row;
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;

      .${mainArea} {
        overflow-x: hidden;
        overflow-y: auto;
        padding-right: 5px;
        ${sheshaStyles.thinScrollbars}
      }

      .${propsPanel} {
        overflow: hidden;
        background: white;

        .${propsPanelContent} {
          display: flex;
          flex-direction: column;
          height: 100%;

          .${propsPanelHeader} {
            display: flex;
            height: 35px;
            min-height: 35px;
    
            .${propsPanelTitle} {
              display: flex;
              background: #282828;
              align-items: center;
              padding: 0 ${sheshaStyles.paddingLG}px;
              font-weight: 500;
              font-size: 16px;
              color: white;
              flex-grow: 1;
            }
          }
  
          .${propsPanelBody} {
            flex-grow: 1;
            overflow-x: hidden;
            overflow-y: auto;
            ${sheshaStyles.thinScrollbars}
  
            padding: ${sheshaStyles.paddingLG}px;
    
            .${propsPanelBodyContent} {
              width: 100%;
            }
          }
        }
      }
  `);

  return {
    propsPanelHeader,
    propsPanelTitle,
    propsPanelBody,
    propsPanelBodyContent,
    container,
    split,
    mainArea,
    propsPanel,
    propsPanelContent,
  };
});
