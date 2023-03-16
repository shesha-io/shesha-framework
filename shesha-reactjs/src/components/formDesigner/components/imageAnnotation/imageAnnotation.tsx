import { getString } from '../../../../providers/form/utils';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { ReactPictureAnnotation } from 'react-picture-annotation';
import { FormMode, useFormData } from '../../../../providers';
import { IAnnotation, IImageProps } from './model';
import './styles/index.less';
import { DescriptionsList } from './descriptionList';
import { CustomInput } from './customAnnotationInput';

interface IProps {
  formMode?: FormMode;
  model: IImageProps;
  onChange?: Function;
  value?: any;
}

const ImageAnnotation: FC<IProps> = ({ model, onChange: onChangeForm, value }) => {
  const { onImage, height, width } = model;
  const { data: formData } = useFormData();
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState({
    width: parseInt(width),
    height: parseInt(height),
  });
  const [annotationData, setAnnotationData] = useState<IAnnotation[]>(value ?? []);
  const [numberOfMarks, setMarksLength] = useState<number>(annotationData.length);

  const url: string = getString(model?.url, formData) || formData?.[model.name];

  useEffect(() => {
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setPageSize(() => ({
      width: parseInt(width),
      height: parseInt(height),
    }));
  }, [height, width]);

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

    if (!!annotationData.length) {
      return { ...annoProps, annotationData };
    }
    return null;
  }, [annotationData]);

  let defaultNumber = useMemo(() => annotationData?.length?.toString(), [annotationData]);

  const onResize = () => {
    setPageSize({ width: imageFrameRef.current.offsetWidth, height: imageFrameRef.current.offsetHeight });
  };

  const onSelect = () => {
    const newAnnotationData = annotationData.map(({ id, comment, ...rest }) => {
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
          width={imageFrameRef?.current?.offsetWidth}
          height={imageFrameRef?.current?.offsetHeight}
          marginWithInput={2}
        />
      </div>
      {!onImage && (
        <div
          className="description-container"
          style={{
            ...pageSize
          }}
        >
          <div className="outer-List-container">
            <DescriptionsList data={annotationData} />
          </div>
        </div>
      )}
    </div>
  );
};

export { ImageAnnotation };
