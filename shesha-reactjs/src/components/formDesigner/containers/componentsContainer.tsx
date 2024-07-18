import React, { CSSProperties, FC, ReactNode, useEffect, useState } from 'react';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { IComponentsContainerBaseProps } from '@/interfaces';
import { useComponentContainer } from '@/providers/form/nesting/containerContext';
import { ICommonContainerProps } from '@/designer-components/container/interfaces';
import { useStoredFile } from '@/index';
import { isValidGuid } from '../components/utils';

export interface IComponentsContainerProps extends IComponentsContainerBaseProps, ICommonContainerProps {
  className?: string;
  render?: (components: JSX.Element[]) => ReactNode;
  itemsLimit?: number;
  dynamicComponents?: IConfigurableFormComponent[];
  wrapperStyle?: CSSProperties;
  style?: CSSProperties;
  dataSource?: string;
  storedFileId?: string;
}

const ComponentsContainer: FC<IComponentsContainerProps> = (props) => {

  const { getStoredFile } = useStoredFile(false) ?? {};
  const [storedFile, setStoredFile] = useState<string>();
  const [updatedProps, setUpdatedProps] = useState<ICommonContainerProps>();

  const isStoredFileId = props?.dataSource === 'storedFileId' && Boolean(props?.storedFileId);

  const fetchStoredFile = () => {
    if (isStoredFileId && isValidGuid(props?.storedFileId)) {
      getStoredFile({ id: props?.storedFileId}).then((file: string) => {
        setStoredFile(() => file);
      });
    }
  };

  useEffect(() => {
      fetchStoredFile();
  }, [isStoredFileId, props?.storedFileId]);

  const ContainerComponent = useComponentContainer();
  
  useEffect(() => {
    const updatedStyles = { ...props.style, background: `url(data:image/png;base64,${storedFile})` };
    const uProps = { ...props, style: updatedStyles };
    setUpdatedProps(uProps);
  }, [props, storedFile]);

  return (
    <ContainerComponent {...props} {...updatedProps} />
  );
};

export default ComponentsContainer;
