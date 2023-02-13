import React, { FC } from 'react';
import HierarchicalCheckList, { IHierarchicalCheckListProps } from '../../../hierarchicalCheckList';

export interface IHierarchicalChecklistWrapperProps extends IHierarchicalCheckListProps {
  onChange?: (value: any) => void;
}

export const HierarchicalCheckListWrapper: FC<IHierarchicalChecklistWrapperProps> = ({ onChange, ...rest }) => {  
  return (
    // note1: if you want to make HierarchicalCheckList a part of the form
    // you should pass the value (see IHierarchicalChecklistWrapperProps) to the HierarchicalCheckList and skip fetch of the selection
    // becasue a selection already fetched as part of form
  
    // note2: I see you have two modes of the HierarchicalCheckList which depends on the dropdown
    // just add some checks in this wrapper to prevent usage of null value and onChange
    <HierarchicalCheckList
      {...rest}
      onSelectionsChange={selections => {
        // pass value to the form
        if (onChange) onChange(selections);
      }}
    />
  );
}

export default HierarchicalCheckListWrapper;
