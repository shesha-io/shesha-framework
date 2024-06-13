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
import { getStyle } from '@/providers/form/utils';
import { useFormData } from '@/index';


const ColumnsComponent: IToolboxComponent<IKeyInformationBarProps> = {
  type: 'KeyInformationBar',
  name: 'Key Information Bar',
  icon: <BorderLeftOutlined />,
  Factory: ({ model }) => {
    const { columns } = model as IKeyInformationBarProps;
    const { styles } = useStyles();
    const { data } = useFormData();
    const { hidden, alignItems, vertical, style, dividerMargin, dividerHeight, gap } = model;
    if (hidden) return null;

    const computedStyle = getStyle(style, data);
    const justifyContent = !vertical ? { justifyContent: alignItems } : { alignItems: alignItems };

    const containerStyle = (item) => ({
      textOverflow: "ellipsis",
      width: item.width,
      textAlign: item.textAlign,
      display: "flex",
      flexDirection: item.flexDirection ? item.flexDirection : "column",
      alignItems: item.textAlign
    });

    const dividerStyle = {
      height: vertical ? 0 : dividerHeight ? dividerHeight : "100%",
      width: !vertical ? 0 : dividerHeight ? dividerHeight : "100%",
      margin: vertical ? `${dividerMargin}px 0px` : `0px ${dividerMargin}px`
    };

    return (
      <ParentProvider model={model}>
        <Flex vertical={vertical} className={styles.flexContainer} style={{ ...computedStyle, ...justifyContent }} >
          {columns?.map((item, i) => {
            return (
              <div key={i} className={vertical ? styles.flexItemWrapperVertical : styles.flexItemWrapper}>
                <Divider type={vertical ? "horizontal" : "vertical"} key={"divider" + i} className={styles.divider} style={dividerStyle} />
                <div className={styles.content} style={{ textAlign: item.textAlign }}>
                  <ComponentsContainer
                    containerId={item.id}
                    gap={gap}
                    style={containerStyle(item)}
                    dynamicComponents={model?.isDynamic ? item?.components : []}
                  />
                </div>
              </div>);
          })}
        </Flex>
      </ParentProvider >
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
          flexDirection: "column",
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
