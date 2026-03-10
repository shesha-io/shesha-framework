import React, { FC, PropsWithChildren, ReactElement, useContext, useEffect, useRef } from 'react';
import { DynamicModal } from '@/components/dynamicModal';
import { DynamicModalInstanceContext, DynamicModalRendererContext } from './contexts';
import { useDynamicModals } from '.';

export interface IDynamicModalRendererProps {
  id: string;
};

function useDynamicRendererRegistar(id: string, dep: any[]): void {
  const renderer = useContext(DynamicModalRendererContext);

  useEffect(() => {
    if (renderer) {
      renderer.registerChildren(id);
      return () => {
        renderer.unregisterChildren(id);
      };
    }
    return () => {
      // nop
    };
  }, dep);
}

const DynamicModalRenderer: FC<PropsWithChildren<IDynamicModalRendererProps>> = (props) => {
  useDynamicRendererRegistar(props.id, [props.id]);

  const { instances, removeModal } = useDynamicModals();
  const children = useRef([]);

  const registerChildren = (id: string): void => {
    if (children.current.indexOf(id) === -1)
      children.current = [...children.current, id];
  };
  const unregisterChildren = (id: string): void => {
    if (children.current.indexOf(id) !== -1)
      children.current = children.current.filter((i) => i !== id);
  };

  const renderInstances = (): ReactElement[] => {
    const rendered = [];
    for (const id in instances) {
      if (instances.hasOwnProperty(id)) {
        const instance = instances[id];
        rendered.push(
          <DynamicModalInstanceContext.Provider
            key={instance.id}
            value={{
              instance,
              close: () => {
                removeModal(instance.id);
              },
            }}
          >
            <DynamicModal {...instance.props} key={instance.id} id={instance.id} isVisible={instance.isVisible} />
          </DynamicModalInstanceContext.Provider>,
        );
      }
    }
    return rendered;
  };

  const context = { registerChildren, unregisterChildren };

  return (
    <DynamicModalRendererContext.Provider value={context}>
      {children.current.length === 0 && renderInstances()}
      {props.children}
    </DynamicModalRendererContext.Provider>
  );
};

export { DynamicModalRenderer, useDynamicRendererRegistar };
