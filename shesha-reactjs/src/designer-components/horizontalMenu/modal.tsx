import React, { ReactNode } from "react";
import { ISideBarMenuProps } from "@/components/configurableSidebarMenu";
import { ComponentSettingsModal } from "@/components/configurableSidebarMenu/settingsModal";
import { ISettingsEditorProps } from "@/components/configurableComponent";

const EmptySidebarProps: ISideBarMenuProps = {
  items: [],
};

export const Editor = ({ settings, onCancel, onSave }: ISettingsEditorProps<ISideBarMenuProps>): ReactNode => (
  <ComponentSettingsModal
    title="Menu Configuration"
    settings={settings ?? EmptySidebarProps}
    onSave={onSave}
    onCancel={onCancel}
  />
);

export default Editor;
