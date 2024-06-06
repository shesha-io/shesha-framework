import { IConfigurableFormComponent } from '@/providers';
import { Divider, Flex } from 'antd';
import React, { FC } from 'react'
import { useStyles } from './style';
import {  getStyle } from '@/providers/form/utils';
import { ICommonContainerProps } from '@/interfaces';
import ComponentsContainer from '../formDesigner/containers/componentsContainer';
import ParentProvider from '@/providers/parentProvider';
import { nanoid } from '@/utils/uuid';

export interface KeyInformationBarProps extends IConfigurableFormComponent {
  direction?: string;
  width?: string;
  height?: string;
  dividerHeight?: string;
  columns?: number;
  space?: number;
  formData?: any;
  alignItems?: string;
  columnWidth?: string;
}


const FlexItem = ({model, id}) => {

    return (
      <ParentProvider model={model}>
        <ComponentsContainer
          containerId={id}
          dynamicComponents={model?.isDynamic ? model?.components : []}
        />
      </ParentProvider>
        
    );
  };

  const KeyInformationBar: FC<KeyInformationBarProps> = (props) => {
  
  const {direction, space, columns, style, formData, columnWidth } = props;  
  const {styles} = useStyles();
  const computedStyle = getStyle(style, formData);
  const vertical = direction === "vertical";
  const barColumns = new Array(columns).fill(0);

  const alignItems = vertical ? {alignItems: props.alignItems} :{ justifyContent: props.alignItems};

  return (
  <Flex vertical={vertical} className={styles.flexContainer} style={{...computedStyle, height: vertical ? "max-content" : props?.height, ...alignItems,}}>
    {barColumns?.map((_, i) => {
      return (
        <div key={i + "-flexItem"} className={vertical ? styles.flexItemWrapperVertical : styles.flexItemWrapper} style={{ width: columnWidth}}>
          <Divider type={vertical ? "horizontal" : "vertical"} key={"divider" + i} className={styles.divider} style={{margin: space, height: props?.dividerHeight}}/>
          <FlexItem model={props} id={i + "containerItem"} />
        </div>);
        })}
    </Flex>
  );
}

export default KeyInformationBar
