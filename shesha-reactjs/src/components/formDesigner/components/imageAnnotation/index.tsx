import { IFormItem, IToolboxComponent } from '../../../../interfaces';
import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { FileImageOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import { getString, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { ReactPictureAnnotation } from 'react-picture-annotation';
import { AnnotationSettingsForm } from './settings';
import { useFormData } from '../../../../providers';
import { IAnnotation, ICustomInputProps, IDataAnnotationListProps } from './model';
import { Input } from 'antd';
import DisplayFormItem from '../../../displayFormItem';

export interface IImageProps extends IConfigurableFormComponent, IFormItem {
  height: string;
  width: string;
  onImage: boolean;
  url: string;
}

const ImageAnnotationComponent: IToolboxComponent<IImageProps> = {
  type: 'imageAnnotation',
  name: 'ImageAnnotation',
  icon: <FileImageOutlined />,

  factory: (model: IImageProps) => {
    const { onImage } = model;
    const { data: formData } = useFormData();
    const imageFrameRef = useRef<HTMLDivElement>(null);
    const [pageSize, setPageSize] = useState({
      width: 500,
      height: 400,
    });
    const [annotationData, setAnnotationData] = useState<IAnnotation[]>([
      //   {
      //     id: 'WtHBaF',
      //     mark: {
      //       x: 246.46423020608444,
      //       y: 314.40303551952536,
      //       width: 40.84838963079352,
      //       height: 23.566378633150123,
      //       type: 'RECT',
      //     },
      //     comment: 'X',
      //   },
      //   {
      //     id: 'MixcTa',
      //     mark: {
      //       x: 408.3377015877387,
      //       y: 294.80553410561186,
      //       width: 69.37394247038912,
      //       height: 40.60913705583761,
      //       type: 'RECT',
      //     },
      //     comment: 'Q',
      //   },
      //   {
      //     id: 'BJKzw3',
      //     mark: {
      //       x: 265.05754688626405,
      //       y: 447.0538458654889,
      //       width: 56.12244897959181,
      //       height: 40.81632653061223,
      //       type: 'RECT',
      //     },
      //     comment: 'W',
      //   },
    ]);

    // TODO:: Update the settings such that an option in the settings is added so allow the form to pass url through value.
    // TODO:: Add ImgWrapper component
    const url: string = getString(model?.url, formData) || formData?.[model.name];

    useEffect(() => {
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, []);

    const onResize = () => {
      setPageSize({ width: imageFrameRef.current.offsetWidth, height: imageFrameRef.current.offsetHeight });
    };

    // const onSelect = selectedId => {
    //   console.log('onselct', selectedId, 'e', selectedId);
    // };
    // const onChange = data => {
    //   console.log('data ::', data);

    //   setAnnotationData(data);
    // };
    const onSelect = selectedId => {
      const newAnnotationData = annotationData.map(({ id, comment, ...rest }) => {
        if (!comment) {
          return { id, comment: '11', ...rest };
        }
        return { id, comment, ...rest };
      });
      setAnnotationData(() => newAnnotationData);
      console.log('onselct', 'e', newAnnotationData, selectedId);
    };
    const onChange = data => {
      console.log('data ::', data);

      setAnnotationData(data);
    };
    const props = useMemo(() => {
      let annoProps: ReactPictureAnnotation;

      if (!!annotationData.length) {
        return { ...annoProps, annotationData };
      }
      return null;
    }, [annotationData]);
    let defaultNumber = useMemo(() => annotationData?.length?.toString(), [annotationData]);

    const CustomInput: FC<ICustomInputProps> = ({ onChange, value }) => {
      return (
        <div className="customInput_container" style={{ display: 'flex' }}>
          <Input
            defaultValue={value}
            onFocus={() => {
              if (!value.includes('.')) {
                onChange(`${defaultNumber}.`);
              }
            }}
            autoFocus
            onChange={({ target: { value } }) => onChange(value)}
          />
        </div>
      );
    };

    const DescriptionsList: FC<IDataAnnotationListProps> = ({ data }) => {
      return (
        <>
          {data
            ?.filter(({ comment }) => !!comment)
            ?.map(mrk => {
              const [index, comment] = mrk.comment?.split('.') || [];
              return (
                <div
                  className="List-Container"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '10% 85%',

                    margin: '1rem',
                  }}
                >
                  <span
                    className="numbering"
                    style={{
                      borderRadius: '50%',
                      height: '30px',
                      width: '30px',
                      border: '2px solid rgb(30, 167, 253)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {`${index}.`}
                  </span>
                  <DisplayFormItem> {comment}</DisplayFormItem>
                </div>
              );
            })}
        </>
      );
    };

    return (
      <ConfigurableFormItem model={model}>
        <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: '45% 45%' }}>
          <div className="container" ref={imageFrameRef} style={{ width: '100%', height: pageSize.height }}>
            <ReactPictureAnnotation
              inputElement={(value, onChange) => <CustomInput value={value || defaultNumber} onChange={onChange} />}
              {...props}
              image={url}
              onSelect={onSelect}
              onChange={onChange}
              width={imageFrameRef?.current?.offsetWidth}
              height={imageFrameRef?.current?.offsetHeight}
              marginWithInput={5}
            />
          </div>
          {!onImage && (
            <div
              className="description"
              style={{
                width: '100%',
                height: pageSize.height,
                padding: 'auto',
                overflowY: 'scroll',
              }}
            >
              <DescriptionsList data={annotationData} />
            </div>
          )}
        </div>
      </ConfigurableFormItem>
    );
  },
  initModel: model => {
    const customModel: IImageProps = {
      ...model,
    };
    return customModel;
  },
  settingsFormMarkup: AnnotationSettingsForm,
  validateSettings: model => validateConfigurableComponentSettings(AnnotationSettingsForm, model),
};

export default ImageAnnotationComponent;
