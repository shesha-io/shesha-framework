import React from "react";
import { ISideBarMenuProps } from "@/components/configurableSidebarMenu";
import { ComponentSettingsModal } from "@/components/configurableSidebarMenu/settingsModal";


const EmptySidebarProps: ISideBarMenuProps = {
  items: [],
};

type EditorProps = {
  settings: ISideBarMenuProps | typeof EmptySidebarProps;
  onCancel: () => void;
  onSave: () => void;
};

export const Editor = ({ settings, onCancel, onSave }: EditorProps): React.JSX.Element => (
  <ComponentSettingsModal
    title="Menu Configuration"
    settings={settings ?? EmptySidebarProps}
    onSave={onSave}
    onCancel={onCancel}
  />
);

export default Editor;
