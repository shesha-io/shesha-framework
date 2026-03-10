import React, { FC } from "react";
import { IDebugDataTreeItemProps } from "./model";

function getFnParamNames(fn: Function): string[] {
  var fstr = fn.toString();
  return fstr.match(/\(.*?\)/)[0].replace(/[()]/gi, '').replace(/\s/gi, '').split(',');
}

export const DebugDataTreeFunc: FC<IDebugDataTreeItemProps> = (props) => {
  const onClick = (_e): void => {
    if (props.value)
      props.value();
  };

  return (
    <>
      <span style={{ color: 'green', fontWeight: 'bold' }} onClick={onClick}>{props.name}</span>
      <span style={{ color: 'black' }}>(</span>
      <span style={{ color: 'blue' }}>{getFnParamNames(props.value).join(', ')}</span>
      <span style={{ color: 'balck' }}>)</span>
    </>
  );
};
