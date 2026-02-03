/* eslint-disable no-console */
import { ConfigurableItemFullName, extractAjaxResponse, GetAllResponse, IAjaxResponse } from '@/interfaces';
import { FormFullName, IConfigurableMainMenu, useFormManager, useHttpClient, useSettings, useSheshaApplication } from '@/providers';
import { ItemReferenceFinder } from '@/utils/dependencies/item-reference-utils';
import { FormOutlined, SettingOutlined } from '@ant-design/icons';
import { Space, Spin, Typography } from 'antd';
import qs from 'qs';
import React, { FC, useEffect, useState } from 'react';

const { Text } = Typography;

type FormDto = {
  id: string;
  name: string;
  module: string;
  markup: string;
};

type DependencyInfo = {
  path: string;
  itemId: FormFullName;
  isSatisfied: boolean;
};

type ItemStateBase = {
  id: ConfigurableItemFullName;
  dependencies: DependencyInfo[];
};
type FormState = ItemStateBase & {
  type: 'form';
  rawId: string;
};

type SettingState = ItemStateBase & {
  type: 'setting';
};

type ItemState = FormState | SettingState;

type ItemsState = {
  items: ItemState[];
};

const getNormalizedName = (id: ConfigurableItemFullName): string => `${id.module}.${id.name}`.toLowerCase();

export const FormAnalyzer: FC = () => {
  const httpClient = useHttpClient();
  const { backendUrl } = useSheshaApplication();
  const formManager = useFormManager();
  const settings = useSettings();
  const [state, setState] = useState<ItemsState>();

  const fetchFormsAsync = async (): Promise<void> => {
    const query = {
      maxResultCount: -1,
    };
    const url = `/api/services/Shesha/FormConfiguration/GetAll?${qs.stringify(query)}`;
    const response = await httpClient.get<IAjaxResponse<GetAllResponse<FormDto>>>(url);
    const data = extractAjaxResponse(response.data);

    const allItems: ItemState[] = [];
    for (const item of data.items) {
      const form = await formManager.getFormById({ formId: item.id, skipCache: true });
      console.log(`LOG: loaded form "${form.module}/${form.name}"`);
      const uniqueRefs = ItemReferenceFinder.findAll(form.flatStructure.allComponents, { unique: true });

      const allRefs = ItemReferenceFinder.findAndMap<unknown, DependencyInfo>(form.flatStructure.allComponents, (ref, path) => {
        return {
          itemId: ref,
          path,
          isSatisfied: false,
        };
      });

      console.log(`LOG: refs: ${JSON.stringify(uniqueRefs)}`);

      const formState: FormState = {
        type: 'form',
        id: {
          name: form.name,
          module: form.module,
        },
        rawId: form.id,
        dependencies: allRefs,
        /*
        dependencies: uniqueRefs.map((ref) => ({
          itemId: ref,
          isSatisfied: false,
        })),
        */
      };
      allItems.push(formState);
    }

    const settingId: ConfigurableItemFullName = { name: 'Shesha.MainMenuSettings', module: 'Shesha' };
    const mainMenu = await settings.getSetting<IConfigurableMainMenu>(settingId);
    console.log('LOG: fetched main menu: ', mainMenu);
    // const uniqueRefs = ItemReferenceFinder.findAll(mainMenu, { unique: true });
    const allRefs = ItemReferenceFinder.findAndMap<unknown, DependencyInfo>(mainMenu, (ref, path) => {
      return {
        itemId: ref,
        path,
        isSatisfied: false,
      };
    });
    const settingItem: SettingState = {
      type: 'setting',
      id: settingId,
      dependencies: allRefs,
      /*
      dependencies: uniqueRefs.map((ref) => ({
        itemId: ref,
        isSatisfied: false,
      })),
      */
    };
    allItems.push(settingItem);

    allItems.forEach((item) => {
      item.dependencies.forEach((dep) => {
        dep.isSatisfied = !!allItems.find((f) => f.type === 'form' && getNormalizedName(f.id) === getNormalizedName(dep.itemId));
      });
    });

    setState({ items: allItems });
  };

  useEffect(() => {
    fetchFormsAsync();
  }, []);

  return (
    <div>
      <Spin spinning={!state}>
        {state && state.items && (
          <div>
            <table>
              <thead>
                <tr>
                  <th>Form</th>
                  <th>Dependencies</th>
                </tr>
              </thead>
              <tbody>
                {state.items.map((item) => (
                  <tr key={item.id.module + item.id.name}>
                    <td>
                      <Space>
                        {item.type === 'form' && <FormOutlined />}
                        {item.type === 'setting' && <SettingOutlined />}
                        {`${item.id.module}/${item.id.name}`}
                        {item.type === 'form' && <a href={`${backendUrl}/api/services/Shesha/FormConfiguration/GetJson?id=${item.rawId}`} target="_blank" rel="noreferrer">Get JSON</a>}
                      </Space>
                    </td>
                    <td>
                      <ul>
                        {item.dependencies.map((dep) => (
                          <li key={dep.itemId.module + dep.itemId.name} style={{ color: dep.isSatisfied ? 'green' : 'red' }}>
                            <Space>
                              <Text type={dep.isSatisfied ? 'success' : 'danger'}>{dep.itemId.module}/{dep.itemId.name}</Text>
                              <Text type="secondary">{dep.path}</Text>
                            </Space>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Spin>
    </div>
  );
};
