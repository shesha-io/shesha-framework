import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { BorderLeftOutlined } from '@ant-design/icons';
import { Divider, Flex } from 'antd';
import { nanoid } from '@/utils/uuid';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { KeyInformationBarSettingsForm } from './settings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ParentProvider from '@/providers/parentProvider/index';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { useStyles } from './style';
import { IKeyInformationBarProps } from './interfaces';
import { ConfigurableFormItem } from '@/components';


const ColumnsComponent: IToolboxComponent<IKeyInformationBarProps> = {
  type: 'KeyInformationBar',
  name: 'Key Information Bar',
  icon: <BorderLeftOutlined />,
  Factory: ({ model }) => {
    const { columns } = model as IKeyInformationBarProps;
    const { styles } = useStyles();
    const { hidden, barWidth, barHeight, alignItems, vertical, space } = model;
    if (hidden) return null;

    const dividerMargin = vertical ? `${space}px 0px` : `0px ${space}px`;

    return (
      <ConfigurableFormItem model={model}>
        <ParentProvider model={model}>
          <Flex vertical={vertical} className={styles.flexContainer} style={{ width: barWidth, height: barHeight, justifyContent: alignItems }} >
            {columns?.map((item, i) => {
              return (
                <div key={i} className={vertical ? styles.flexItemWrapperVertical : styles.flexItemWrapper} style={{ width: item.width, alignSelf: vertical ? alignItems : "inherit" }}>
                  <Divider type={vertical ? "horizontal" : "vertical"} key={"divider" + i} style={{ height: barHeight ? barHeight : "100%", margin: dividerMargin }} />
                  <div className={styles.content} style={{ textAlign: item.textAlign }}>
                    <ComponentsContainer
                      containerId={item.id}
                      gap={item.gap}
                      dynamicComponents={model?.isDynamic ? item?.components : []}
                    />
                  </div>
                </div>);
            })}
          </Flex>
        </ParentProvider>
      </ConfigurableFormItem>
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
          textAlign: 'left',
          gap: 0,
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
