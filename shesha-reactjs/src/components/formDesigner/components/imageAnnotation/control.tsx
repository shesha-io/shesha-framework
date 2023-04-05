import { getString } from '../../../../providers/form/utils';
import React, { FC, useEffect, useRef, useState } from 'react';
import { ReactPictureAnnotation } from 'react-picture-annotation';
import { FormMode, useForm, useFormData } from '../../../../providers';
import { IAnnotation, IImageAnnotationData, IImageProps } from './model';
import './styles/index.less';
import DescriptionsList from './components/descriptionList';
import ErrorMessage from './components/errorMessage';
import CustomInput from './components/customAnnotationInput';
import { canSubmit, getViewData, parseIntOrDefault, sortAnnotationData } from './utilis';

import { usePrevious } from '../../../../hooks';

interface IProps {
  formMode?: FormMode;
  model: IImageProps;
  onChange?: Function;
  setIsRequired?: React.Dispatch<React.SetStateAction<boolean>>;
  isRequired?: boolean;
  value?: any;
}

const ImageAnnotationControl: FC<IProps> = ({ model, onChange: onChangeForm, value, setIsRequired, isRequired }) => {
  const { isOnImage, height, width, allowAddingNotes = true, minPoints = 0, maxPoints = 0 } = model;

  const { data: formData } = useFormData();

  const { formMode } = useForm();

  const imageFrameRef = useRef<HTMLDivElement>(null);

  const [pageSize, setPageSize] = useState({
    width: parseIntOrDefault(width),
    height: parseIntOrDefault(height),
  });

  const [imageAnnotationData, setImageAnnotationData] = useState<IImageAnnotationData>({
    actualData: value || [],
    viewData: value || [],
  });

  const prevLeghth = usePrevious(imageAnnotationData?.viewData?.length);

  const url: string = getString(model?.url, formData) || formData?.[model.name];

  const isReadOnly = model?.readOnly || formMode === 'readonly';

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

  const onResize = () => {
    setPageSize({
      width: parseIntOrDefault(imageFrameRef?.current?.offsetWidth),
      height: parseIntOrDefault(imageFrameRef?.current?.offsetHeight),
    });
  };

  const onSelect = () => { };

  const onChange = (data: IAnnotation[]) => {
    if (!isReadOnly) {
      const recordedData = data?.filter(({ comment }) => !!comment);

      setImageAnnotationData({
        viewData: allowAddingNotes ? data : getViewData(sortAnnotationData(data), allowAddingNotes),
        actualData: recordedData,
      });

      if (canSubmit(data, minPoints)) {

        setIsRequired(() => false);

        onChangeForm(sortAnnotationData(data));

      } else {
        const recordeddata = data?.filter(({ comment }) => !!comment)?.length;

        if (!!minPoints && minPoints > recordeddata) {

          setIsRequired(() => true);
        }

        onChangeForm([]);
      }
    }
  };

  const maxpointReached = !!maxPoints && imageAnnotationData?.actualData?.length - 1 >= maxPoints;

  const hasUpdated = prevLeghth != imageAnnotationData?.viewData?.length

  const topDisplacement = parseInt(height) * 0.98;

  return (
    <div className="annotation-conatainer">
      <div className="container-image" ref={imageFrameRef} style={{ ...pageSize }}>
        <div className="image-frame-with-error">
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
            image={url}
            onSelect={onSelect}
            onChange={onChange}
            width={parseIntOrDefault(imageFrameRef?.current?.offsetWidth)}
            height={parseIntOrDefault(imageFrameRef?.current?.offsetHeight)}
            marginWithInput={2}
          />
        </div>
        {!isReadOnly && (
          <div className="annotation-error" style={{ top: topDisplacement }}>
            <ErrorMessage
              isRequired={isRequired}
              minPoints={minPoints}
              maxPoints={maxPoints}
              dataLength={imageAnnotationData?.actualData?.length}
            />
          </div>
        )}
      </div>

      {(isReadOnly || maxpointReached) && <div className="container-image-Cover" style={{ ...pageSize }} />}

      {!isOnImage && allowAddingNotes && (
        <div
          className="description-container"
          style={{
            height: pageSize.height,
          }}
        >
          <DescriptionsList data={sortAnnotationData(imageAnnotationData?.actualData)} />
        </div>
      )}
    </div>
  );
};

export default ImageAnnotationControl;
