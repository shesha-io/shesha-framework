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
  columnWidth?: string;
  globalState?: any;
}


const FlexItem = ({model, id}) => {

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
