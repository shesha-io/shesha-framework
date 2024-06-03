import { IConfigurableFormComponent } from '@/providers';
import { Divider, Flex } from 'antd';
import React, { FC, Key } from 'react'
import { useStyles } from './style';
import { getStyle } from '@/providers/form/utils';

interface KeyInformationBarValueProps {
  value: {label: string, value: string, style?: string};
}
export interface KeyInformationBarProps extends IConfigurableFormComponent {
  className?: string;
  direction?: string;
  width?: string;
  value?: Array<KeyInformationBarValueProps>;
  items?: Array<{label: string, value: string}>;
  space?: number;
  formData?: any;
}


const FlexItem = ({label, value, style}) => {
    return (
      <div className={style.flexItem}>
        <div className={style.label}>{label}</div>
        <div className={style.value}>{value}</div>
      </div>
    );
  };

  const KeyInformationBar: FC<KeyInformationBarProps> = (props) => {
  
  const {direction, space, items, style, formData } = props;  
  const {styles} = useStyles();
  const computedStyle = getStyle(style, formData);
  const vertical = direction === "vertical";

  return (
  <Flex vertical={vertical} className={styles.flexContainer} style={computedStyle}>
    {items?.map((item, i) => {
      return (
        <div key={i + "-flexItem"} className={vertical ? styles.flexItemWrapperVertical : styles.flexItemWrapper}>
          <Divider type={vertical ? "horizontal" : "vertical"} key={"divider" + i} className={styles.divider} style={{margin: space}}/>
          <FlexItem key={item.label} label={item.label} value={item.value} style={styles}/>
        </div>);
        })}
    </Flex>
  );
}

export default KeyInformationBar
