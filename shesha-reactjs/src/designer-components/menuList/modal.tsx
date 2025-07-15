import React, { FC } from "react";
import { ComponentSettingsModal } from "@shesha-io/reactjs";
import { ISettingsEditorProps } from "@shesha-io/reactjs/dist/components/configurableComponent";
import { ISideBarMenuProps } from "@/components/layout";

interface IProps extends ISettingsEditorProps<ISideBarMenuProps> {}

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
