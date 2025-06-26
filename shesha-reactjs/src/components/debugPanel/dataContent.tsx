import React, { FC,  useEffect,  useMemo, useState } from "react";
import { DebugDataTree } from "./dataTree";
import { useDataContextManager } from "@/providers/dataContextManager";
import { useGlobalState, useMetadataDispatcher } from "@/providers";
import { useFormDesignerStateSelector } from "@/providers/formDesigner";
import { IModelMetadata } from "@/interfaces/metadata";
import { getFieldNameFromExpression } from "@/providers/form/utils";

const DebugPanelDataContent: FC = () => {
    const globalState = useGlobalState();

    const contextManager = useDataContextManager();
    const pageInstance = contextManager.getPageFormInstance();
    const formSettings = useFormDesignerStateSelector(x => x.formSettings);

    const modelType = pageInstance?.formSettings?.modelType ?? formSettings?.modelType;
    const [formMetadata, setFormMetadata] = useState<IModelMetadata>(null);
    const metadataDispatcher = useMetadataDispatcher();
    useEffect(() => {
      if (metadataDispatcher && modelType && !formMetadata)
        metadataDispatcher
          .getMetadata({modelType: pageInstance.formSettings.modelType, dataType: 'entity'})
          .then(r => {
            setFormMetadata(r);
          });
    }, []);

    const contexts = useMemo(() => contextManager.getDataContexts('full'), [contextManager.lastUpdate]);
  
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
  
      pageInstance?.setFormData({ values: changedData, mergeValues: true });
    };
  
    return (
      <>
        {true && globalState &&
          <DebugDataTree 
            data={globalState}
            onChange={(propName, val) => onChangeGloablState(propName, val)} 
            name={'GlobalState (obsolete)'}
          />
        }
        {pageInstance &&
          <DebugDataTree 
            data={pageInstance?.formData}
            metadata={formMetadata}
            editAll
            onChange={(propName, val) => onChangeFormData(propName, val)}
            name={'Form data'}
          />
        }
        {contexts.map((item) => {
          const ctxData = item.getFull();
          return <DebugDataTree
            key={item.id}
            data={ctxData}
            lastUpdated={contextManager.lastUpdate}
            onChange={(propName, val) => onChangeContext(item.id, propName, val)}
            name={item.name}
          />;
        })}
      </>
    );
  };
  
  export default DebugPanelDataContent;