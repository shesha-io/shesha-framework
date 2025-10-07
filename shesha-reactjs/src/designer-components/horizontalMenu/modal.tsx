import React from "react";
import { ComponentSettingsModal } from "@/index";
import { ISideBarMenuProps } from "@/components/configurableSidebarMenu";


const EmptySidebarProps: ISideBarMenuProps = {
  items: [],
};

export const Editor = ({ settings, onCancel, onSave }): JSX.Element => (
  <ComponentSettingsModal
    title="Sidebar Menu Configuration"
    settings={settings ?? EmptySidebarProps}
    onSave={onSave}
    onCancel={onCancel}
  />
);

export default Editor;
