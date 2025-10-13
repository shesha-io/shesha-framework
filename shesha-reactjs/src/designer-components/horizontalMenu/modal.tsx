import React from "react";
import { ComponentSettingsModal } from "@/index";
import { ISideBarMenuProps } from "@/components/configurableSidebarMenu";


const EmptySidebarProps: ISideBarMenuProps = {
  items: [],
};

type EditorProps = {
  settings: ISideBarMenuProps | typeof EmptySidebarProps;
  onCancel: () => void;
  onSave: () => void;
};

export const Editor = ({ settings, onCancel, onSave }: EditorProps): JSX.Element => (
  <ComponentSettingsModal
    title="Sidebar Menu Configuration"
    settings={settings ?? EmptySidebarProps}
    onSave={onSave}
    onCancel={onCancel}
  />
);

export default Editor;
