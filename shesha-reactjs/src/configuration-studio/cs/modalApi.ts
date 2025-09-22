import { FormFullName, useDynamicModals } from "@/providers";
import { IModalProps, IModalWithContentProps, ModalFooterButtons } from "@/providers/dynamicModal/models";
import { nanoid } from "@/utils/uuid";
import { App } from "antd";
import { ReactNode, useRef } from "react";
import { HookAPI as ModalHookAPI } from 'antd/lib/modal/useModal';

export interface ShowModalArgs {
  title?: string | undefined;
};

export interface ShowModalFormArgs extends ShowModalArgs {
  formId: FormFullName;
  formArguments?: object;
  footerButtons?: ModalFooterButtons;
};

export interface ShowModalContentArgs extends ShowModalArgs {
  footer?: ReactNode;
  content: ReactNode;
};

type ShowModalContentExecutorArgs<T> = {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
  removeModal: () => void;
};
export type ShowModalContentExecutor<T> = (args: ShowModalContentExecutorArgs<T>) => ShowModalContentArgs;

interface ConfirmArgs {
  title: string;
  content?: string;
};

export interface IModalApi {
  showModalFormAsync: <TResponse = void>(args: ShowModalFormArgs) => Promise<TResponse | undefined>;
  showModalContentAsync: <TResponse = void>(executor: ShowModalContentExecutor<TResponse>) => Promise<TResponse | undefined>;
  confirmYesNo: (args: ConfirmArgs) => Promise<boolean>;
};

type CreateModalType = ReturnType<typeof useDynamicModals>['createModal'];
type RemoveModalType = ReturnType<typeof useDynamicModals>['removeModal'];
type ModalApiArguments = {
  createModal: CreateModalType;
  removeModal: RemoveModalType;
  antdApi: ModalHookAPI;
};

export class ModalApi implements IModalApi {
  private _createModal: CreateModalType;

  private _removeModal: RemoveModalType;

  private _antdApi: ModalHookAPI;

  constructor(args: ModalApiArguments) {
    this._createModal = args.createModal;
    this._removeModal = args.removeModal;
    this._antdApi = args.antdApi;
  }

  confirmYesNo = (args: ConfirmArgs): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
      this._antdApi.confirm({
        title: args.title,
        content: args.content,
        okText: 'Yes',
        cancelText: 'No',
        okButtonProps: {
          type: 'primary',
          danger: true,
        },
        onCancel: () => {
          reject();
        },
        onOk: () => {
          resolve(true);
        },
      });
    });
  };

  showModalFormAsync = <TResponse = void>(args: ShowModalFormArgs): Promise<TResponse | undefined> => {
    const modalId = nanoid();

    return new Promise((resolve, reject) => {
      const modalProps: IModalProps<TResponse> = {
        mode: "edit",
        id: modalId,
        title: args.title,
        formId: args.formId,
        formArguments: args.formArguments,
        footerButtons: args.footerButtons,
        isVisible: true,
        onCancel: () => {
          reject("Cancelled");
        },
        onSubmitted: (values) => {
          this._removeModal(modalId);
          resolve(values);
        },
        onClose: (positive = false, result) => {
          if (positive)
            resolve(result);
          else
            reject(result);
        },
      };

      this._createModal(modalProps);
    });
  };

  showModalContentAsync = <TResponse = void>(executor: ShowModalContentExecutor<TResponse>): Promise<TResponse | undefined> => {
    const modalId = nanoid();

    return new Promise((resolve, reject) => {
      const removeModal = (): void => {
        this._removeModal(modalId);
      };
      const modalArgs = executor({ resolve, reject, removeModal });
      const modalProps: IModalWithContentProps<TResponse> = {
        id: modalId,
        title: modalArgs.title,
        content: modalArgs.content,
        footer: modalArgs.footer,
        isVisible: true,
        onCancel: () => {
          reject("Cancelled");
        },
        onClose: (positive = false, result) => {
          if (positive)
            resolve(result);
          else
            reject(result);
        },
      };
      this._createModal(modalProps);
    });
  };
}

export const useModalApi = (): IModalApi => {
  const { createModal, removeModal } = useDynamicModals();
  const { modal } = App.useApp();

  const apiRef = useRef<IModalApi>();
  if (!apiRef.current) {
    const instance = new ModalApi({
      createModal,
      removeModal,
      antdApi: modal,
    });
    apiRef.current = instance;
  }

  return apiRef.current;
};
