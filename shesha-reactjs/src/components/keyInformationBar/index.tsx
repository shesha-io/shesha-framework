import { IConfigurableFormComponent } from '@/providers';
import { Divider, Flex } from 'antd';
import React, { FC } from 'react'
import { useStyles } from './style';
import { getLayoutStyle, getStyle } from '@/providers/form/utils';
import { ICommonContainerProps } from '@/interfaces';
import ComponentsContainer from '../formDesigner/containers/componentsContainer';


export interface KeyInformationBarProps extends IConfigurableFormComponent {
  direction?: string;
  width?: string;
  columns?: number;
  space?: number;
  formData?: any;
  itemLabelAlign?: 'left' | 'top';
  labelValueSeparator?: string;
  globalState?: any;
}


const FlexItem = ({model, style, labelAlign, formData, globalState, id}) => {

  const flexAndGridStyles: ICommonContainerProps = {
      display: model?.display,
      flexDirection: model?.flexDirection,
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

    return (
      <div className={style.flexItem} style={{flexDirection: labelAlign === 'left'? "row" : "column" }}>
        <ComponentsContainer
          containerId={id + "label"}
          {...flexAndGridStyles}
          className={model.className}
          wrapperStyle={getLayoutStyle({ ...model, style: model?.wrapperStyle }, { data: formData, globalState })}
          style={getStyle(model?.style, formData)}
          dynamicComponents={model?.isDynamic ? model?.components : []}
        />
      </div>
    );
  };

  const KeyInformationBar: FC<KeyInformationBarProps> = (props) => {
  
  const {direction, space, columns, style, formData, itemLabelAlign, labelValueSeparator, globalState } = props;  
  const {styles} = useStyles();
  const computedStyle = getStyle(style, formData);
  const vertical = direction === "vertical";
  const barColumns = new Array(columns).fill(0);

  return (
  <Flex vertical={vertical} className={styles.flexContainer} style={computedStyle}>
    {barColumns?.map((_, i) => {
      return (
        <div key={i + "-flexItem"} className={vertical ? styles.flexItemWrapperVertical : styles.flexItemWrapper}>
          <Divider type={vertical ? "horizontal" : "vertical"} key={"divider" + i} className={styles.divider} style={{margin: space}}/>
          <FlexItem model={props} style={styles} labelAlign="top" formData={formData} globalState={globalState} id={i + "containerItem"}/>
        </div>);
        })}
    </Flex>
  );
}

export default KeyInformationBar
