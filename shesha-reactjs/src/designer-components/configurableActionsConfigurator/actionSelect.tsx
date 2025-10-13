import React, { FC, ReactNode, useMemo } from 'react';
import { TreeSelect } from 'antd';
import { IConfigurableActionGroupDictionary } from '@/providers/configurableActionsDispatcher/models';
import HelpTextPopover from '@/components/helpTextPopover';

const getConfigurableActionFullName = (owner: string, name: string): string => {
  return owner
    ? `${owner}:${name}`
    : name;
};

interface IActionSelectProps {
  actions: IConfigurableActionGroupDictionary;
  value?: string;
  onChange?: () => void;
  readOnly?: boolean;
}
interface IActionSelectItem {
  title: string | ReactNode;
  value: string;
  displayText: string;
  children: IActionSelectItem[];
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

export const ActionSelect: FC<IActionSelectProps> = ({ value, onChange, actions, readOnly = false }) => {
  const treeData = useMemo<IActionSelectItem[]>(() => {
    const result: IActionSelectItem[] = [];

    for (const owner in actions) {
      if (!actions.hasOwnProperty(owner))
        continue;
      const ownerActions = actions[owner];
      const ownerNodes: IActionSelectItem[] = [];

      ownerActions.actions.forEach((action) => {
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

      result.push({
        title: ownerActions.ownerName,
        value: owner,
        displayText: owner,
        children: ownerNodes,
        selectable: false,
      });
    }
    return result;
  }, [actions]);

  return (
    <TreeSelect
      disabled={readOnly}
      showSearch
      style={{
        width: '100%',
      }}
      value={value}
      styles={treeStyles}
      size="small"
      placeholder="Please select"
      allowClear
      // treeDefaultExpandAll
      onChange={onChange}
      treeNodeLabelProp="displayText"
      treeData={treeData}
    >
    </TreeSelect>
  );
};
