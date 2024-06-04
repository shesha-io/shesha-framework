import { IConfigurableFormComponent } from '@/providers';
import { Divider, Flex } from 'antd';
import React, { FC } from 'react'
import { useStyles } from './style';
import { getLayoutStyle, getStyle } from '@/providers/form/utils';
import { ICommonContainerProps } from '@/interfaces';
import ComponentsContainer from '../formDesigner/containers/componentsContainer';
import { justify } from 'jodit/esm/plugins/justify/justify';


export interface KeyInformationBarProps extends IConfigurableFormComponent {
  direction?: string;
  width?: string;
  height?: string;
  dividerHeight?: string;
  columns?: number;
  space?: number;
  formData?: any;
  alignItems?: string;
  labelValueSeparator?: string;
  globalState?: any;
}


const FlexItem = ({model, style, labelAlign, formData, globalState, id}) => {

  console.log("ItemFlexDirection: ", model?.itemFlexDirection, model.display);

  const flexAndGridStyles: ICommonContainerProps = {
      display: "flex",
      flexDirection: model?.itemFlexDirection,
      justifyContent: model?.alignItems,
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
        <ComponentsContainer
          containerId={id + "label"}
          {...flexAndGridStyles}
          dynamicComponents={model?.isDynamic ? model?.components : []}
        />
    );
  };

  const KeyInformationBar: FC<KeyInformationBarProps> = (props) => {
  
  const {direction, space, columns, style, formData, globalState } = props;  
  const {styles} = useStyles();
  console.log("TYPE of style: ", typeof style);
  const computedStyle = getStyle(style, formData);
  const vertical = direction === "vertical";
  const barColumns = new Array(columns).fill(0);

  const alignItems = vertical ? {alignItems: props.alignItems} :{ justifyContent: props.alignItems};

  return (
  <Flex vertical={vertical} className={styles.flexContainer} style={{...computedStyle, height: vertical ? "max-content" : props?.height, width: vertical ? props.width : "100%", ...alignItems }}>
    {barColumns?.map((_, i) => {
      return (
        <div key={i + "-flexItem"} className={vertical ? styles.flexItemWrapperVertical : styles.flexItemWrapper}>
          <Divider type={vertical ? "horizontal" : "vertical"} key={"divider" + i} className={styles.divider} style={{margin: space, height: props?.dividerHeight}}/>
          <FlexItem model={props} style={styles} labelAlign="top" formData={formData} globalState={globalState} id={i + "containerItem"} />
        </div>);
        })}
    </Flex>
  );
}

export default KeyInformationBar
