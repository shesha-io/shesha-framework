import CustomInput from './components/customAnnotationInput';
import DescriptionsList from './components/descriptionList';
import React, {
  FC,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import WarningMessage from './components/warningMessage';
import { getString, getStyle } from '@/providers/form/utils';
import { IAnnotation, IImageAnnotationData, IImageProps } from './model';
import { ReactPictureAnnotation } from 'react-picture-annotation';
import { useFormData, useGlobalState } from '@/providers';
import { usePrevious } from '@/hooks';
import { useStyles } from './styles/styles';
import {
  canSubmit,
  getImageBits,
  getViewData,
  parseIntOrDefault,
  sortAnnotationData,
} from './utilis';

interface IProps {
  model: IImageProps;
  onChange?: Function;
  value?: any;
}

const ImageAnnotationControl: FC<IProps> = ({ model, onChange: onChangeForm, value }) => {
  const {
    isOnImage,
    height,
    width,
    allowAddingNotes = true,
    minPoints = 0,
    maxPoints = 0,
    readOnly,
    style,
  } = model;

  const { styles } = useStyles();
  const { data: formData } = useFormData();

  const { globalState } = useGlobalState();

  const imageFrameRef = useRef<HTMLDivElement>(null);

  const [pageSize, setPageSize] = useState({
    width: parseIntOrDefault(width),
    height: parseIntOrDefault(height),
  });

  const [imageAnnotationData, setImageAnnotationData] = useState<IImageAnnotationData>({
    actualData: value?.data || [],
    viewData: value?.data || [],
  });

  const prevLength = usePrevious(imageAnnotationData?.viewData?.length);

  const [urlBits, setBits] = useState<string>(value?.bit64Url);

  const isReadOnly = readOnly;

  const onResize = (): void => {
    setPageSize({
      width: parseIntOrDefault(imageFrameRef?.current?.offsetWidth),
      height: parseIntOrDefault(imageFrameRef?.current?.offsetHeight),
    });
  };

  useEffect(() => {
    window.addEventListener('resize', onResize);
    const isNumbersOnly = !isOnImage && isReadOnly;
    if (isNumbersOnly) {
      setImageAnnotationData({
        ...imageAnnotationData,
        viewData: getViewData(imageAnnotationData.actualData, allowAddingNotes),
      });
    } else {
      setImageAnnotationData({
        ...imageAnnotationData,
        viewData: imageAnnotationData.actualData,
      });
    }
    return () => window.removeEventListener('resize', onResize);
  }, [isReadOnly]);

  useEffect(() => {
    setPageSize(() => ({
      width: parseIntOrDefault(width),
      height: parseIntOrDefault(height),
    }));
  }, [height, width]);

  const url: string = getString(model?.url, formData, globalState) || formData?.[model.propertyName];

  const setIsRequired = (required: boolean): void => {
    model.validate.required = required;

    model.validate.message = `Enter a minimum of ${minPoints || 1} points`;

    // This force instant update of the form validation
    const imageElement = imageFrameRef?.current
      ?.getElementsByClassName('rp-stage')[0]
      ?.getElementsByClassName('rp-shapes')[0] as HTMLDivElement;

    imageElement?.click();
  };

  const onSelect = (): void => {
    /* nop*/
  };

  if (url && !urlBits) {
    getImageBits(url)
      .then((binaryString) => {
        setBits(`data:image/jpeg;base64,${btoa(binaryString as string)}`);
        // process the binary string here
      })
      .catch((error) => {
        setBits(null);
        console.error(error);
      });
  }

  const onChange = (data: IAnnotation[]): void => {
    if (!isReadOnly) {
      if (!!maxPoints && maxPoints < data.length) return;
      const recordedData = data?.filter(({ comment }) => !!comment);

      setImageAnnotationData({
        viewData: allowAddingNotes ? data : getViewData(sortAnnotationData(data), allowAddingNotes),
        actualData: recordedData,
      });

      if (canSubmit(data, minPoints)) {
        setIsRequired(false);

        onChangeForm(sortAnnotationData(data));
      } else {
        const recordeddata = data?.filter(({ comment }) => !!comment)?.length;

        if (!!minPoints && minPoints > recordeddata) {
          setIsRequired(true);
        }

        onChangeForm([]);
      }
    }
  };

  const hasUpdated = prevLength !== imageAnnotationData?.viewData?.length;

  const maxReached =
    !!maxPoints && imageAnnotationData?.viewData?.filter(({ comment }) => !!comment).length === maxPoints;
  const newUrl = useMemo(() => {
    return urlBits;
  }, [urlBits]);

  return (
    <>
      <WarningMessage
        isReadonly={isReadOnly}
        maxPoints={maxPoints}
        maxReached={maxReached}
        width={pageSize?.width}
        notFoundUrl={!newUrl}
        url={newUrl}
      />
      <div className={styles.annotationConatainer}>
        <div
          className={styles.containerImage}
          ref={imageFrameRef}
          style={{ ...pageSize, ...getStyle(style, formData, globalState) }}
        >
          <ReactPictureAnnotation
            inputElement={(value, onChange, onDelete) => (
              <CustomInput
                value={value}
                defaultNumber={imageAnnotationData?.viewData?.length}
                onChange={onChange}
                onDelete={onDelete}
              />
            )}
            annotationData={
              hasUpdated ? sortAnnotationData(imageAnnotationData.viewData) : imageAnnotationData.viewData
            }
            image={newUrl}
            onSelect={onSelect}
            onChange={onChange}
            scrollSpeed={0}
            width={parseIntOrDefault(imageFrameRef?.current?.offsetWidth)}
            height={parseIntOrDefault(imageFrameRef?.current?.offsetHeight)}
            marginWithInput={2}
          />
        </div>
        {isReadOnly && <div className={styles.containerImageCover} style={{ ...pageSize }} />}

        {!isOnImage && allowAddingNotes && (
          <div
            className={styles.descriptionContainer}
            style={{
              height: pageSize.height,
            }}
          >
            <DescriptionsList data={sortAnnotationData(imageAnnotationData?.actualData)} />
          </div>
        )}
      </div>
    </>
  );
};

export default ImageAnnotationControl;
