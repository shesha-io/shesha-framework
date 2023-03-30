import { getString } from '../../../../providers/form/utils';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { ReactPictureAnnotation } from 'react-picture-annotation';
import { FormMode, useForm, useFormData } from '../../../../providers';
import { IAnnotation, IImageProps } from './model';
import './styles/index.less';
import { DescriptionsList } from './descriptionList';
import { CustomInput } from './customAnnotationInput';
import { parseIntOrDefault } from './utilis';

interface IProps {
  formMode?: FormMode;
  model: IImageProps;
  onChange?: Function;
  value?: any;
}

const ImageAnnotation: FC<IProps> = ({ model, onChange: onChangeForm, value }) => {
  const { isOnImage, height, width } = model;
  const { data: formData } = useFormData();
  const { formMode } = useForm();
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState({
    width: parseIntOrDefault(width),
    height: parseIntOrDefault(height),
  });
  const [annotationData, setAnnotationData] = useState<IAnnotation[]>(value || []);
  const [annotationDataHolder, setAnnotationDataHolder] = useState<IAnnotation[]>(value || []);
  const [numberOfMarks, setMarksLength] = useState<number>(annotationData?.length);

  const url: string = getString(model?.url, formData) || formData?.[model.name];
  const isReadOnly = model?.readOnly || formMode === 'readonly';

  useEffect(() => {
    window.addEventListener('resize', onResize);
    setAnnotationData(annotationDataHolder);
    return () => window.removeEventListener('resize', onResize);
  }, [isReadOnly]);

  useEffect(() => {
    setPageSize(() => ({
      width: parseIntOrDefault(width),
      height: parseIntOrDefault(height),
    }));
  }, [height, width]);

  useEffect(() => {
    if (!isReadOnly) setAnnotationDataHolder(annotationData);
  }, [annotationData]);

  useEffect(() => {
    let annotationLength = annotationData?.length;
    const withComments = annotationData
      ?.filter(mark => !!mark?.comment)
      ?.sort((a, b) => {
        const order = [...a.comment?.split('.'), ...b.comment?.split('.')];
        return parseInt(order[0]) - parseInt(order[2]);
      })
      ?.map(({ comment, ...rest }, index) => {
        const [, commt] = comment?.split('.');
        return {
          ...rest,
          comment: `${index + 1}.${commt}`,
        };
      });
    if (annotationData[annotationLength - 1]) {
      if (!annotationData[annotationLength - 1]?.comment) {
        withComments.push(annotationData[annotationLength - 1]);
      }
    }

    setAnnotationData(withComments);
  }, [numberOfMarks]);

  const props = useMemo(() => {
    let annoProps: ReactPictureAnnotation;
    if (!!annotationData.length && annotationData.length != numberOfMarks) {
      setMarksLength(annotationData.length);
    }
    onChangeForm(annotationData);
    const isNumbersOnly = !isOnImage && isReadOnly;

    let viewData = annotationDataHolder?.map((mrk, index) => {
      return {
        ...mrk,
        comment: `${index + 1}.`,
      };
    });

    if (!!annotationData?.length) {
      return { ...annoProps, annotationData: isNumbersOnly ? viewData : annotationData };
    }
    return null;
  }, [annotationData, isReadOnly]);

  let defaultNumber = useMemo(() => annotationData?.length?.toString(), [annotationData]);

  const onResize = () => {
    setPageSize({
      width: parseIntOrDefault(imageFrameRef?.current?.offsetWidth),
      height: parseIntOrDefault(imageFrameRef?.current?.offsetHeight),
    });
  };

  const onSelect = () => {
    const newAnnotationData = annotationData?.map(({ id, comment, ...rest }) => {
      return { id, comment, ...rest };
    });
    setAnnotationData(() => newAnnotationData);
  };

  const onChange = (data: IAnnotation[]) => {
    setAnnotationData(data);
  };

  return (
    <div className="annotation-conatainer">
      <div className="container-image" ref={imageFrameRef} style={{ ...pageSize }}>
        <ReactPictureAnnotation
          inputElement={(value, onChange, onDelete) => (
            <CustomInput value={value} defaultNumber={defaultNumber} onChange={onChange} onDelete={onDelete} />
          )}
          {...props}
          image={url}
          onSelect={onSelect}
          onChange={onChange}
          width={parseIntOrDefault(imageFrameRef?.current?.offsetWidth)}
          height={parseIntOrDefault(imageFrameRef?.current?.offsetHeight)}
          marginWithInput={2}
        />
      </div>
      {isReadOnly && <div className="container-image-Cover" style={{ ...pageSize }} />}

      {!isOnImage && (
        <div
          className="description-container"
          style={{
            height: pageSize.height,
          }}
        >
          <DescriptionsList data={annotationDataHolder} />
        </div>
      )}
    </div>
  );
};

export { ImageAnnotation };
