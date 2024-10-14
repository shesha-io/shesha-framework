import axios from 'axios';
import ItemsTree from '../itemsTree';
import React, { MutableRefObject, useState } from 'react';
import { appendFormData } from '@/utils/form';
import { ConfigItemDataNode, ITreeState } from '../models';
import {
    DeleteOutlined,
    FileZipTwoTone,
    InboxOutlined,
    LoadingOutlined
    } from '@ant-design/icons';
import { FC } from 'react';
import { Form, Spin, Upload } from 'antd';
import { getIndexesList } from '../treeUtils';
import { IDictionary } from '@/interfaces';
import { nanoid } from '@/utils/uuid';
import { RcFile } from 'antd/lib/upload/interface';
import { UploadFile } from 'antd/lib/upload/interface';
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import { useSheshaApplication } from '@/providers';
import { useStyles } from './styles/styles';

const { Dragger } = Upload;

export interface IImportInterface {
    importExecuter: () => Promise<any>;
}

export interface IConfigurationItemsImportProps {
    onImported?: () => void;
    importRef?: MutableRefObject<IImportInterface>;
}

interface IItemInfo {
    id: string;
    name: string;
    label?: string;
    description?: string;
    frontEndApplication?: string;
}
interface IItemTypeInfo {
    name: string;
    items: IItemInfo[];
}
interface IModuleInfo {
    name: string;
    itemTypes: IItemTypeInfo[];
}
interface IPackageInfo {
    modules: IModuleInfo[];
}

const packageInfo2TreeState = (pack: IPackageInfo): ITreeState => {
    const treeNodes: ConfigItemDataNode[] = [];
    let itemsCount = 0;
    pack.modules.forEach(module => {
        const itemTypeNodes = module.itemTypes.map<ConfigItemDataNode>(itemType => {
            itemsCount += itemType.items.length;

            const itemNodes: ConfigItemDataNode[] = [];
            const applications: IDictionary<ConfigItemDataNode> = {};
            
            itemType.items.forEach(item => {
                const node = {
                    key: item.id,
                    title: item.name,
                    isLeaf: true,
                    itemId: item.id
                };
                if (item.frontEndApplication) {
                    let appNode = applications[item.frontEndApplication];
                    if (!appNode){
                        appNode = {
                            key: `${module.name}/${itemType.name}/${item.frontEndApplication}`,
                            title: item.frontEndApplication,
                            isLeaf: false,
                            children: [],
                        };
                        applications[item.frontEndApplication] = appNode;
                        itemNodes.push(appNode);
                    }
                    appNode.children.push(node);
                } else {
                    itemNodes.push(node);
                }
            });
            return {
                key: `${module.name}/${itemType.name}`,
                title: itemType.name,
                children: itemNodes,
                isLeaf: false,
            };
        });

        const moduleNode: ConfigItemDataNode = {
            key: module.name ?? '-',
            title: module.name,
            children: itemTypeNodes,
            isLeaf: false,
        };


        treeNodes.push(moduleNode);
    });

    return {
        treeNodes: treeNodes,
        itemsCount: itemsCount,
        indexes: getIndexesList(treeNodes),
    };
};

export const ConfigurationItemsImport: FC<IConfigurationItemsImportProps> = (props) => {
    const { styles, prefixCls } = useStyles();
    const { backendUrl, httpHeaders } = useSheshaApplication();

    const [uploadFile, setUploadFile] = useState<UploadFile>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [checkedIds, setCheckedIds] = useState<string[]>([]);
    const [treeState, setTreeState] = useState<ITreeState>(null);
    const [isPackLoading, setIsPackLoading] = useState(false);

    const onUploadRequest = (payload: RcCustomRequestOptions) => {
        const formData = new FormData();
        const { file } = payload;

        formData.append('file', file);

        const rcFile = file as RcFile;
        setUploadFile({
            uid: nanoid(),
            url: null,
            status: 'done',
            name: rcFile.name,
            size: rcFile.size,
            type: rcFile.type,
            originFileObj: rcFile,
        });

        setIsPackLoading(true);
        axios
            .post(`${backendUrl}/api/services/app/ConfigurationItem/AnalyzePackage`,
                formData,
                {
                    headers: httpHeaders,
                }
            )
            .then((response: any) => {
                const packageInfo = response.data.result as IPackageInfo;

                const loadedTreeState = packageInfo2TreeState(packageInfo);
                setTreeState(loadedTreeState);

                payload.onSuccess({});
                setIsPackLoading(false);
            })
            .catch(e => {
                console.error(e);
                payload.onError(e);
                setIsPackLoading(false);
            });
    };
    const onChangeSelection = (checkedIds: string[]) => {
        setCheckedIds(checkedIds);
    };

    const onDeleteClick = () => {
        setUploadFile(null);
        setTreeState(null);
    };

    const fileRender = (_originNode, file, _currFileList) => {
        return (
            <div className={styles.shaPackageUploadFile}>
                <span className={styles.shaPackageUploadFileThumbnail}>
                    {isPackLoading
                        ? (<LoadingOutlined style={{ fontSize: '26px' }} className="sha-upload-uploading" />)
                        : (<FileZipTwoTone style={{ fontSize: '26px' }} />)
                    }
                </span>
                <span className={`${prefixCls}-upload-list-item-name`} title={file.name}>
                    {file.name}
                </span>
                <span className={`${prefixCls}-upload-list-item-card-actions picture`}>
                    {!isPackLoading && (
                        <a className="sha-upload-remove-control" onClick={onDeleteClick}>
                            <DeleteOutlined title="Remove" />
                        </a>
                    )}
                </span>
            </div>
        );
    };

    const importExecuter = () => {
        if (!uploadFile?.originFileObj)
            return Promise.reject('Please upload a file for import');
        if (checkedIds.length === 0)
            return Promise.reject('Please select items to import');

        setIsImporting(true);

        const formData = new FormData();
        formData.append('file', uploadFile.originFileObj);
        appendFormData(formData, 'itemsToImport', JSON.stringify(checkedIds));

        return axios
            .post(`${backendUrl}/api/services/app/ConfigurationItem/ImportPackage`,
                formData,
                {
                    headers: httpHeaders,
                }
            )
            .then(() => {
                setIsImporting(false);
            })
            .catch(e => {
                setIsImporting(false);
                throw e;
            });
    };

    if (props.importRef)
        props.importRef.current = {
            importExecuter: importExecuter,
        };

    return (
        <Spin spinning={isImporting} tip="Importing...">
            <Form>
                <Dragger
                    accept=".shaconfig"
                    customRequest={onUploadRequest}
                    listType="text"
                    maxCount={1}
                    itemRender={fileRender}
                    className={styles.shaPackageUploadDrag}
                    style={{ display: Boolean(uploadFile) ? "none" : undefined }}
                    fileList={uploadFile ? [uploadFile] : []}
                >
                    <p className={`${prefixCls}-upload-drag-icon`}>
                        <InboxOutlined />
                    </p>
                    <p className={`${prefixCls}-upload-text`}>Click or drag <strong>.shaconfig</strong> file to this area to upload</p>
                </Dragger>
                {treeState && (
                    <>
                        <ItemsTree treeState={treeState} onChangeSelection={onChangeSelection} />
                    </>
                )}
            </Form>
        </Spin>
    );
};

export default ConfigurationItemsImport;