import React, { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { Drawer } from "antd";
import { useConfigurableAction } from "providers";
import { DebugDataTree } from "./dataTree";
import { useKeyPress } from "react-use";
import { useDataContextManager } from "providers/dataContextManager";
import { getFieldNameFromExpression } from "formDesignerUtils";

export interface DebugPanelProps {

}

export const DebugPanel: FC<PropsWithChildren<DebugPanelProps>> = ({children}) => {

  const [open, setOpen] = useState(false);
  const contextManager = useDataContextManager();
  const formInstance = contextManager.getFormInstance();

  const [ctrlPressed] = useKeyPress('Control');
  const [f12Pressed] = useKeyPress('F12');

  useEffect(() => {
    if (!f12Pressed || !ctrlPressed)
      return;
    if (open)
      setOpen(false);
    else
      setOpen(true);
  }, [ctrlPressed, f12Pressed]);

  useConfigurableAction(
    {
      name: 'Toggle debug panel',
      owner: 'Debug panel',
      ownerUid: 'debugPanel',
      hasArguments: false,
      executer: () => {
        if (open)
          setOpen(false);
        else
          setOpen(true);
        return Promise.resolve();
      },
    }, []
  );

  const onClose = () => {
    setOpen(false);
  };

  const contexts =  useMemo(() => contextManager.getDataContexts('all'), [contextManager.lastUpdate]);

  const onChangeContext = (contextId: string, propName: string, val: any) => {
    const ctx = contextManager.getDataContext(contextId);
    ctx.setFieldValue(propName, val);
  };

  const onChangeFormData = (propName: string, val: any) => {
    
    const pName = getFieldNameFromExpression(propName);

    const changedData = {};

    if (typeof pName === 'string')
        changedData[pName] = val;
    else if (Array.isArray(pName) && pName.length > 0) {
        let prop = changedData;
        pName.forEach((item, index) => {
            if (index < pName.length - 1) {
                prop[item] = {};
                prop = prop[item];
            }
        });
        prop[pName[pName.length - 1]] = val;
    }

    formInstance?.setFormDataAndInstance({values: changedData, mergeValues: true});
  };

  return (
    <>
      {children}
      <Drawer title='Basic Drawer' closable placement="bottom" open={open} onClose={onClose}> 
        {formInstance &&
          <DebugDataTree 
            data={formInstance?.formData}
            onChange={(propName, val) => onChangeFormData(propName, val)} 
            name={'Form data'}          
          />
        }
        {contexts.map(item => {
          const ctxData = contextManager.getDataContextData(item.id);
          return <DebugDataTree 
            data={ctxData}
            onChange={(propName, val) => onChangeContext(item.id, propName, val)} 
            name={item.name}          
           />;
        })}
      </Drawer>
    </>
  );
};
  
export default DebugPanel;
  