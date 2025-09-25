import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }) => {
  const containerImage = "container-image";
  const imageFrameWithError = "image-frame-with-error";
  const containerImageCover = "container-image-Cover";
  const descriptionContainer = "description-container";
  const annotationConatainer = cx("annotation-conatainer", css`
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.8rem;
      
        .${containerImage} {
          width: calc(50% - 0.5rem);
          margin-bottom: 1rem;
        }
      
        .${imageFrameWithError} {
          display: block;
        }
      
        .${containerImageCover} {
          position: absolute;
          width: calc(50% - 0.5rem);
          margin-bottom: 1rem;
          background-color: transparent;
        }
      
        .${descriptionContainer} {
          width: calc(40% - 0.5rem);
          padding: auto;
          overflow-y: auto;
        }

        .annotation-error {
            position: relative;
            color: ${token.colorError};
        }
    `);
  const customInputContainer = cx("customInput_container", css`
        display: flex;
    `);

  const listItem = "List-item";
  const numbering = "numbering";
  const listContainer = cx("List-Container", css`
        display: flex;
        flex-direction: column;
        justify-content: center;
      
        .${listItem} {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.8rem !important;
      
          .${numbering} {
            border-radius: 50%;
            height: 2rem;
            width: 2rem;
            border: 2px solid;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }
    `);

  return {
    containerImage,
    imageFrameWithError,
    containerImageCover,
    descriptionContainer,
    annotationConatainer,
    customInputContainer,
    listContainer,
    listItem,
    numbering,
  };
});
