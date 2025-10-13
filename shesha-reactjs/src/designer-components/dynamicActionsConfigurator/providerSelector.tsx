import { TreeSelect } from 'antd';
import { useDynamicActionsDispatcher } from '@/providers/index';
import React, { FC, ReactNode, useMemo } from 'react';

export interface IProviderSelectorProps {
  value?: string;
  onChange?: (newValue: string) => void;
  readOnly?: boolean;
}

interface ITreeItem {
  title: string | ReactNode;
  value: string;
  displayText: string;
  children: ITreeItem[];
  selectable: boolean;
}

const treeStyles = {
  popup: {
    root: {
      maxHeight: 400,
      overflow: 'auto',
    },
  },
};

export const ProviderSelector: FC<IProviderSelectorProps> = ({ readOnly, value, onChange }) => {
  const { getProviders } = useDynamicActionsDispatcher();
  const providers = getProviders();

  const treeData = useMemo<ITreeItem[]>(() => {
    const result: ITreeItem[] = [];

    for (const owner in providers) {
      if (!providers.hasOwnProperty(owner))
        continue;
      const provider = providers[owner];
      const ownerNodes: ITreeItem[] = [];

      /* TODO: evaluate dynamically
      ownerActions.actions.forEach(action => {
        const displayName = action.label ?? action.name;

        ownerNodes.push({
          title: (
            <div>
              <HelpTextPopover content={action.description}>
                {displayName}
              </HelpTextPopover>
            </div>
          ),
          displayText: `${ownerActions.ownerName}: ${displayName}`,
          value: getConfigurableActionFullName(owner, action.name),
          children: null,
          selectable: true,
        });
      });
    */
      result.push({
        title: provider.contextValue.name,
        value: owner,
        displayText: provider.contextValue.name,
        children: ownerNodes,
        // selectable: false,
        selectable: true,
      });
    }
    return result;
  }, [providers]);

  return (
    <TreeSelect
      disabled={readOnly}
      showSearch
      style={{
        width: '100%',
      }}
      value={value}
      styles={treeStyles}
      placeholder="Please select"
      allowClear
      onChange={onChange}
      treeNodeLabelProp="displayText"
      treeData={treeData}
    >
    </TreeSelect>
  );
};
