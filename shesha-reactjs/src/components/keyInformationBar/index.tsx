import { IConfigurableFormComponent } from '@/providers';
import { Divider, Flex } from 'antd';
import React, { Key } from 'react'
import { CSSProperties } from 'styled-components';

interface KeyInformationBarValueProps {
  value: {label: string, value: string}[];
}
export interface KeyInformationBarProps extends IConfigurableFormComponent {
  className?: string;
  vertical?: boolean;
  value?: Array<KeyInformationBarValueProps>;
}

function KeyInformationBar(props) {

  const baseStyle: React.CSSProperties = {
    width: '25%',
    height: 54,
  };

  const FlexItem = ({label, value}) => {
    return (<div style={{display: "flex", flexDirection: "row", width: "100%"}}>
      <Divider type="vertical" style={{height: 52}}/>
      <div style={{...baseStyle, display: "flex", flexDirection: "column", alignContent: "center"}}>
        <div style={{textAlign: "center"}}>{label}</div>
        <div>{value}</div>
      </div>  
    </div>);
  };

  console.log("PROPS:::", props)

  return (
    <Flex vertical={props.vertical}>
      {props.values.map((item) => {
        return <FlexItem key={item.label} label={item.label} value={item.value} />;
      })}
    </Flex>
  );
}

export default KeyInformationBar
