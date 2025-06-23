import { FormFullName, useDynamicModals } from "@/providers";
import { IModalProps } from "@/providers/dynamicModal/models";
import { nanoid } from "@/utils/uuid";
import { App } from "antd";
import { useRef } from "react";
import { HookAPI as ModalHookAPI } from 'antd/lib/modal/useModal';

export interface ShowModalArgs {
    title?: string;
    formId: FormFullName;
    formArguments?: any;
};

interface ConfirmArgs {
    title: string;
    content?: string;
};

export interface IModalApi {
    showModalAsync: <TResponse = void>(args: ShowModalArgs) => Promise<TResponse | undefined>;
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

    confirmYesNo = (args: ConfirmArgs) => {
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

    showModalAsync = <TResponse = void>(args: ShowModalArgs): Promise<TResponse | undefined> => {
        const modalId = nanoid();

        return new Promise((resolve, reject) => {
            const modalProps: IModalProps = {
                mode: "edit",
                id: modalId,
                formId: args.formId,
                title: args.title,
                formArguments: args.formArguments,
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

        //instance.init();
    }

    return apiRef.current;
};