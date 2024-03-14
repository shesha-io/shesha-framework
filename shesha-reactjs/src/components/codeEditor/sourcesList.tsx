import React, { FC, useState } from "react";
import { Monaco } from '@monaco-editor/react';
import { Uri, editor } from 'monaco-editor';
import { Dropdown, MenuProps, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";

type ItemType = MenuProps['items'][number];
type SourceFile = ItemType & {
    uri: Uri;
};

export interface ISourcesListProps {
    editor: editor.IStandaloneCodeEditor;
    monaco: Monaco;
}

const getSourceFiles = (monaco: Monaco): SourceFile[] => {
    //update source files list
    const models = monaco.editor.getModels();

    const files = models.map<SourceFile>(model => {
        const file: SourceFile = {
            label: model.uri.toString(),
            key: model.id,
            uri: model.uri,
        };
        return file;
    });
    return files;
};

export const SourcesList: FC<ISourcesListProps> = ({ editor, monaco }) => {
    const [sourceFiles] = useState<SourceFile[]>(() => getSourceFiles(monaco));
    
    const onClick: MenuProps['onClick'] = ({ key }) => {
        if (!editor || !monaco)
            return;

        const file = sourceFiles.find(f => f.key === key);
        if (!file)
            return;

        const model = monaco.editor.getModel(file.uri);
        editor.setModel(model);
    };

    return (
        <Dropdown menu={{ items: sourceFiles, onClick }}>
            <a onClick={(e) => e.preventDefault()}>
                <Space>
                    Hover me
                    <DownOutlined />
                </Space>
            </a>
        </Dropdown>
    );
};