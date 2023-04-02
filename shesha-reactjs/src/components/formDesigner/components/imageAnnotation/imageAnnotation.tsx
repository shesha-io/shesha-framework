import { getString } from '../../../../providers/form/utils';
import React, { FC, useEffect, useRef, useState } from 'react';
import { ReactPictureAnnotation } from 'react-picture-annotation';
import { FormMode, useForm, useFormData } from '../../../../providers';
import { IAnnotation, IImageAnnotationData, IImageProps } from './model';
import './styles/index.less';
import { DescriptionsList } from './descriptionList';
import { CustomInput } from './customAnnotationInput';
import { canSubmit, getViewData, parseIntOrDefault, sortAnnotationData } from './utilis';
import { AlertMessage } from './alertMessage';

interface IProps {
  formMode?: FormMode;
  model: IImageProps;
  onChange?: Function;
  value?: any;
}

const ImageAnnotation: FC<IProps> = ({ model, onChange: onChangeForm, value }) => {
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

  const onSelect = (selectedId: string) => {
    console.log('selectedId', selectedId);
  };

  const onChange = (data: IAnnotation[]) => {
    if (!isReadOnly) {
      setImageAnnotationData({
        viewData: allowAddingNotes ? data : getViewData(sortAnnotationData(data), allowAddingNotes),
        actualData: data,
      });
      if (canSubmit(data, minPoints, maxPoints)) {
        onChangeForm(sortAnnotationData(data));
      }
    }
  };

  const maxpointReached = !!maxPoints && imageAnnotationData?.actualData?.length - 1 >= maxPoints;

  return (
    <div className="annotation-conatainer">
      <div className="container-image" ref={imageFrameRef} style={{ ...pageSize }}>
        {!isReadOnly && (
          <AlertMessage minPoints={minPoints} maxPoints={maxPoints} data={imageAnnotationData?.actualData} />
        )}
        <ReactPictureAnnotation
          inputElement={(value, onChange, onDelete) => (
            <CustomInput
              value={value}
              defaultNumber={imageAnnotationData?.viewData?.length}
              onChange={onChange}
              onDelete={onDelete}
            />
          )}
          annotationData={sortAnnotationData(imageAnnotationData.viewData)}
          image={url}
          onSelect={onSelect}
          onChange={onChange}
          width={parseIntOrDefault(imageFrameRef?.current?.offsetWidth)}
          height={parseIntOrDefault(imageFrameRef?.current?.offsetHeight)}
          marginWithInput={2}
        />
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

export { ImageAnnotation };
