import React, { FC, useEffect, useRef, useState } from 'react';
import { ReactPictureAnnotation } from 'react-picture-annotation';
import { usePrevious } from '../../../../hooks';
import { useForm, useFormData } from '../../../../providers';
import { getString } from '../../../../providers/form/utils';
import CustomInput from './components/customAnnotationInput';
import DescriptionsList from './components/descriptionList';
import ErrorMessage from './components/errorMessage';
import { IAnnotation, IImageAnnotationData, IImageProps } from './model';
import './styles/index.less';
import { canSubmit, getViewData, parseIntOrDefault, sortAnnotationData } from './utilis';

interface IProps {
  model: IImageProps;
  onChange?: Function;
  value?: any;
}

const ImageAnnotationControl: FC<IProps> = ({ model, onChange: onChangeForm, value }) => {
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
  
  const url: string = getString(model?.url, formData) || formData?.[model.name];

  const onResize = () => {
    setPageSize({
      width: parseIntOrDefault(imageFrameRef?.current?.offsetWidth),
      height: parseIntOrDefault(imageFrameRef?.current?.offsetHeight),
    });
  };

  const setIsRequired = (required: boolean) => {
    model.validate.required = required;
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

  const maxpointReached = !!maxPoints && imageAnnotationData?.actualData?.length >= maxPoints;

  const hasUpdated = prevLeghth != imageAnnotationData?.viewData?.length;

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
              isRequired={!!model.validate?.required}
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
