import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { BorderLeftOutlined } from '@ant-design/icons';
import { Divider, Flex, Space } from 'antd';
import { IConfigurableFormComponent, useFormData, useGlobalState } from '@/providers';
import { nanoid } from '@/utils/uuid';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { KeyInformationBarSettingsForm } from './settings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ParentProvider from '@/providers/parentProvider/index';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { useStyles } from './style';
import { IColumnProps } from './interfaces';
import { AlignItems } from '../container/interfaces';

export interface KeyInfomationBarItemProps {
  id: string;
  width: number;
  alignItems: AlignItems;
  components: IConfigurableFormComponent[];
}

export interface IKeyInformationBarProps extends IConfigurableFormComponent, IColumnProps {
  width?: string;
  height?: string;
  dividerHeight?: string;
  space?: number;
  formData?: any;
  alignItems?: AlignItems;
  columnWidth?: string;
  barWidth?: string;
  barHeight?: string;
  vertical?: boolean;
  columns?: KeyInfomationBarItemProps[];
  readOnly?: boolean;
  style?: string;
  stylingBox?: any;
}

const ColumnsComponent: IToolboxComponent<IKeyInformationBarProps> = {
  type: 'KeyInformationBar',
  name: 'Key Information Bar',
  icon: <BorderLeftOutlined />,
  Factory: ({ model }) => {
    const { columns } = model as IKeyInformationBarProps;
    const { styles } = useStyles();
    const { hidden, barWidth, barHeight, alignItems, vertical, space } = model
    if (hidden) return null;

    return (
      <ParentProvider model={model}>
        <Flex vertical={vertical} className={styles.flexContainer} style={{ width: barWidth, height: barHeight }}>
          {columns?.map((item, i) => {
            return (
              <div key={i} className={vertical ? styles.flexItemWrapperVertical : styles.flexItemWrapper} style={{ width: item.width }}>
                <Divider type={vertical ? "horizontal" : "vertical"} key={"divider" + i} style={{ height: barHeight ? barHeight : "100%", margin: space }} />
                <div className={styles.content} style={{ flex: 1, textAlign: "center" }}>
                  <ComponentsContainer
                    containerId={item.id}
                    dynamicComponents={model?.isDynamic ? item?.components : []}
                  />
                </div>

              </div>);
          })}
        </Flex>
      </ParentProvider>
    );
  },
  migrator: (m) =>
    m
      .add<IKeyInformationBarProps>(
        0,
        (prev) => migratePropertyName(migrateCustomFunctions(prev)) as IKeyInformationBarProps
      )
      .add<IKeyInformationBarProps>(1, (prev) => migrateVisibility(prev)),
  initModel: (model) => {
    const tabsModel: IKeyInformationBarProps = {
      ...model,
      propertyName: 'column 1',
      columns: [
        {
          id: nanoid(),
          width: 200,
          alignItems: 'flex-start',
          components: [],
        }
      ],
    };

    return tabsModel;
  },
  settingsFormFactory: (props) => <KeyInformationBarSettingsForm {...props} />,
  customContainerNames: ['columns'],
};

export default ColumnsComponent;
