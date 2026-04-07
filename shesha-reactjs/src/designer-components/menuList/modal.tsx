import { ISettingsEditorProps } from "@/components/configurableComponent";
import { ISideBarMenuProps } from "@/components/configurableSidebarMenu";
import { ComponentSettingsModal } from "@/components/configurableSidebarMenu/settingsModal";
import React, { FC } from "react";

type IProps = ISettingsEditorProps<ISideBarMenuProps>;

const EmptySidebarProps: ISideBarMenuProps = {
  items: [],
};

export const Editor: FC<IProps> = ({ settings, onCancel, onSave }) => (
  <ComponentSettingsModal
    title="Sidebar Menu Configuration"
    settings={settings ?? EmptySidebarProps}
    onSave={onSave}
    onCancel={onCancel}
  />
);

export default Editor;
