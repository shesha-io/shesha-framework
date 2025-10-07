import { App } from "antd";
import { SheshaActionOwners } from "../../configurableActionsDispatcher/models";
import { useConfigurableAction } from "@/providers/configurableActionsDispatcher";
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from "@/utils/uuid";

const messageTypes = ['info', 'success', 'error', 'warning', 'loading'] as const;
type MessageType = typeof messageTypes[number];

export interface IShowMessageArguments {
  message: string;
  // note: use internal MessageType instead of antd NoticeType to force manual update of the Shesha part after modification of antd type
  type: MessageType;
}

export const showMessageArgumentsForm = new DesignerToolbarSettings()
  .addSettingsInput({
    id: nanoid(),
    inputType: "textArea",
    propertyName: 'message',
    label: 'Message',
    autoSize: true,
    validate: { required: true },
  })
  .addSettingsInput({
    id: nanoid(),
    inputType: "dropdown",
    propertyName: 'type',
    label: 'Type',
    dropdownOptions: messageTypes.map((v) => ({
      label: v[0].toUpperCase() + v.slice(1),
      value: v,
      id: v,
    })),
  })
  .toJson();

export const useShowMessageAction = (): void => {
  const { message: messageApi } = App.useApp();

  useConfigurableAction<IShowMessageArguments, boolean>({
    isPermament: true,
    owner: 'Common',
    ownerUid: SheshaActionOwners.Common,
    name: 'Show Message',
    hasArguments: true,
    argumentsFormMarkup: showMessageArgumentsForm,
    executer: (actionArgs, _context) => {
      const {
        message,
        type,
      } = actionArgs;

      messageApi.open({
        type: type,
        content: message,
      });

      return Promise.resolve(true);
    },
  }, [messageApi]);
};
