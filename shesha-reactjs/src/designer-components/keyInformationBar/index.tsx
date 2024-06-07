import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { BorderLeftOutlined } from '@ant-design/icons';
import { Divider, Flex } from 'antd';
import { IConfigurableFormComponent, useFormData, useGlobalState } from '@/providers';
import { nanoid } from '@/utils/uuid';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { KeyInformationBarSettingsForm } from './settings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ParentProvider from '@/providers/parentProvider/index';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { useStyles } from './style';
import { IColumnProps } from './interfaces';

export interface KeyInformationBarItemProps {
  id: string;
  key?: string;
}

export interface KeyInformationBarProps extends IConfigurableFormComponent, IColumnProps {
  width?: string;
  height?: string;
  dividerHeight?: string;
  space?: number;
  formData?: any;
  alignItems?: string;
  columnWidth?: string;
  barWidth?: string;
  barHeight?: string;
  vertical?: boolean;
  columns?: { id: string }[];
  readOnly?: boolean;
}

const ColumnsComponent: IToolboxComponent<KeyInformationBarProps> = {
  type: 'KeyInformationBar',
  name: 'Key Information Bar',
  icon: <BorderLeftOutlined />,
  Factory: ({ model }) => {
    const { data } = useFormData();
    const { globalState } = useGlobalState();
    const { columns } = model as any;
    const { styles } = useStyles();
    const { hidden, barWidth, barHeight, space, vertical } = model
    if (hidden) return null;

    return (
      <ParentProvider model={model}>
        <Flex vertical={vertical} className={styles.flexContainer} style={{ width: barWidth, height: barHeight }}>
          {columns?.map((item, i) => {
            return (
              <div key={i} className={vertical ? styles.flexItemWrapperVertical : styles.flexItemWrapper}>
                <Divider type={vertical ? "horizontal" : "vertical"} key={"divider" + i} style={{ width: 10, height: "100%", margin: space }} />
                <ComponentsContainer
                  containerId={item.id}
                  dynamicComponents={model?.isDynamic ? item?.components : []}
                />
              </div>);
          })}
        </Flex>
      </ParentProvider>
    );
  },
  migrator: (m) =>
    m
      .add<KeyInformationBarProps>(
        0,
        (prev) => migratePropertyName(migrateCustomFunctions(prev)) as KeyInformationBarProps
      )
      .add<KeyInformationBarProps>(1, (prev) => migrateVisibility(prev)),
  initModel: (model) => {
    const tabsModel: KeyInformationBarProps = {
      ...model,
      propertyName: 'colum 1',
      columns: [
        { id: nanoid() }
      ],
    };

    return tabsModel;
  },
  settingsFormFactory: (props) => <KeyInformationBarSettingsForm {...props} />,
  customContainerNames: ['columns'],
};

export default ColumnsComponent;
