import { IConfigurableFormComponent } from '@/providers';
import { Divider, Flex } from 'antd';
import React, { FC } from 'react'
import { useStyles } from './style';
import { getStyle } from '@/providers/form/utils';
import { ICommonContainerProps } from '@/interfaces';
import ComponentsContainer from '../formDesigner/containers/componentsContainer';


export interface KeyInformationBarProps extends IConfigurableFormComponent {
  direction?: string;
  width?: string;
  columns?: number;
  space?: number;
  formData?: any;
  itemFlexDirection?: 'left' | 'center' | 'right' | 'stretch' | 'baseline' | 'initial' | 'inherit';
  globalState?: any;
}


const FlexItem = ({model, style, formData, globalState, id}) => {

  const flexAndGridStyles: ICommonContainerProps = {
      display: model?.display,
      flexDirection: model?.itemFlexDirection,
      direction: model?.direction,
      justifyContent: model?.justifyContent,
      alignItems: model?.alignItems,
      alignSelf: model?.alignSelf,
      justifyItems: model?.justifyItems,
      textJustify: model?.textJustify,
      justifySelf: model?.justifySelf,
      noDefaultStyling: model?.noDefaultStyling,
      gridColumnsCount: model?.gridColumnsCount,
      flexWrap: model?.flexWrap,
      gap: model?.gap,
    };

    console.log("FlexItem model: ", flexAndGridStyles);
    return (
      <div className={style.flexItem}>
        <ComponentsContainer
          containerId={id + "label"}
          {...flexAndGridStyles}
          dynamicComponents={model?.isDynamic ? model?.components : []}
        />
      </div>
    );
  };

  const KeyInformationBar: FC<KeyInformationBarProps> = (props) => {
  
  const {direction, space, columns, style, formData, globalState, itemFlexDirection } = props;  
  const {styles} = useStyles();
  console.log("TYPE of style: ", typeof style);
  const computedStyle = getStyle(style, formData);
  const vertical = direction === "vertical";
  const barColumns = new Array(columns).fill(0);

  console.log("Flex Align Items: ", itemFlexDirection);
  
  return (
  <Flex vertical={vertical}  style={{...computedStyle, alignItems: itemFlexDirection}}>
    {barColumns?.map((_, i) => {
      return (
        <div key={i + "-flexItem"} className={vertical ? styles.flexItemWrapperVertical : styles.flexItemWrapper}>
          <Divider type={vertical ? "horizontal" : "vertical"} key={"divider" + i} className={styles.divider} style={{margin: space}}/>
          <FlexItem model={props} style={styles} formData={formData} globalState={globalState} id={i + "containerItem"}/>
        </div>);
        })}
    </Flex>
  );
}

export default KeyInformationBar
