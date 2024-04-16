import React, { FC,  useEffect,  useMemo, useState } from "react";
import { DebugDataTree } from "./dataTree";
import { useDataContextManager } from "@/providers/dataContextManager";
import { useGlobalState, useMetadataDispatcher } from "@/providers";
import { useFormDesigner } from "@/providers/formDesigner";
import { IModelMetadata } from "@/interfaces/metadata";
import { getFieldNameFromExpression } from "@/providers/form/utils";

const DebugPanelDataContent: FC = () => {
    const globalState = useGlobalState();

    const contextManager = useDataContextManager();
    const formInstance = contextManager.getFormInstance();
    const designer = useFormDesigner(false);

    const modelType = formInstance?.formSettings?.modelType ?? designer?.formSettings?.modelType;
    const [formMetadata, setFormMetadata] = useState<IModelMetadata>(null);
    const metadataDispatcher = useMetadataDispatcher(false);
    useEffect(() => {
      if (metadataDispatcher && modelType && !formMetadata)
        metadataDispatcher
          .getMetadata({modelType: formInstance.formSettings.modelType, dataType: 'entity'})
          .then(r => {
            setFormMetadata(r);
          });
    }, []);

    const contexts = useMemo(() => contextManager.getDataContexts('all'), [contextManager.lastUpdate]);
  
    const onChangeContext = (contextId: string, propName: string, val: any) => {
      const ctx = contextManager.getDataContext(contextId);
      ctx.setFieldValue(propName, val);
    };
  
    const onChangeGloablState = (propName: string, val: any) => {
        globalState.setState({key: propName, data: val});
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
  
      formInstance?.setFormData({ values: changedData, mergeValues: true });
    };
  
    //console.log('debug rerender');
  
    return (
      <>
        {true && globalState &&
          <DebugDataTree 
            data={globalState}
            onChange={(propName, val) => onChangeGloablState(propName, val)} 
            name={'GlobalState (obsolete)'}
          />
        }
        {formInstance &&
          <DebugDataTree 
            data={formInstance?.formData}
            metadata={formMetadata}
            editAll
            onChange={(propName, val) => onChangeFormData(propName, val)}
            name={'Form data'}
          />
        }
        {contexts.map((item) => {
          const ctxData = contextManager.getDataContextData(item.id);
          return <DebugDataTree
            key={item.id}
            data={ctxData}
            onChange={(propName, val) => onChangeContext(item.id, propName, val)}
            name={item.name}
          />;
        })}
      </>
    );
  };
  
  export default DebugPanelDataContent;