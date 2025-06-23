/* eslint-disable no-console */
import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, MenuProps, Space } from 'antd';
import React, { FC, useMemo } from 'react';
import { buildCreateNewMenu } from '@/configuration-studio/menu-utils';
import { useConfigurationStudio } from '@/configuration-studio/cs/contexts';

export interface INewButtonProps {

}

type MenuItems = MenuProps["items"];

export const NewButton: FC<INewButtonProps> = () => {
    const cs = useConfigurationStudio();

    // TODO: add current tree selection to the dependencies list
    const menuItems = useMemo<MenuItems>(() => {
        return buildCreateNewMenu({ configurationStudio: cs, node: undefined });
    }, []);

    return (
        <Dropdown menu={{ items: menuItems }}>
            <Button>
                <Space>
                    New
                    <DownOutlined />
                </Space>
            </Button>
        </Dropdown>
    );
};