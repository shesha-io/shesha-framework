/* eslint-disable no-console */
import { ILinkProps } from '@/designer-components/link/interfaces';
import { ConfigurableItemFullName, extractAjaxResponse, GetAllResponse, IAjaxResponse } from '@/interfaces';
import { isConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { FormFullName, IComponentsDictionary, IConfigurableFormComponent, IConfigurableMainMenu, isNavigationActionConfiguration, isScriptActionConfiguration, useFormManager, useHttpClient, useSettings, useSheshaApplication } from '@/providers';
import { ItemReferenceFinder } from '@/utils/dependencies/item-reference-utils';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
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

const isComponent = (component: unknown): component is IConfigurableFormComponent => isDefined(component) && "id" in component && "type" in component;

interface ParsedUrl {
  module: string;
  form: string;
  queryParams?: Record<string, string>;
}

// Alternative: Pure regex approach without URL constructor
function parseUrlPureRegex(url: string): ParsedUrl | null {
  // Match both path and query string in one go
  const fullPattern = /(?:dynamic|no-auth)\/([^\/\?]+)\/([^\/\?]+)(?:\?(.*))?$/;
  const match = url.match(fullPattern);

  if (!match) {
    return null;
  }

  const result: ParsedUrl = {
    module: match[1],
    form: match[2],
  };

  // Parse query string if present
  if (match[3]) {
    result.queryParams = {};
    const queryString = match[3];
    queryString.split('&').forEach((param) => {
      const [key, value] = param.split('=');
      result.queryParams![decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
  }

  return result;
}

function extractPathsSimple(jsCode: string): string[] {
  const pattern = /\b(dynamic|no-auth)\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+(?:\?[a-zA-Z0-9_=&%-]*)?\b/g;
  const paths: string[] = [];
  let match;

  while ((match = pattern.exec(jsCode)) !== null) {
    paths.push(match[0]);
  }

  return paths;
}


const findSpecificRefs = (components: IComponentsDictionary, callback: (ref: ConfigurableItemFullName, path?: string) => void): void => {
  const tryAddFormByLink = (url: string | undefined | null): void => {
    // callback
    if (!isNullOrWhiteSpace(url)) {
      const parsedUrl = parseUrlPureRegex(url);
      if (parsedUrl) {
        console.log('LOG: analyze href - url found', url);
        callback({ name: parsedUrl.form, module: parsedUrl.module }, "raw url");
      } else
        console.log('LOG: analyze href - not found', url);
    }
  };

  for (const key in components) {
    if (components.hasOwnProperty(key)) {
      const component = components[key];
      if (isComponent(component)) {
        if (component.type === 'link') {
          tryAddFormByLink((component as ILinkProps).href);
        }
        // tryAddFormsFromJs;
      }
    }
  }
};

export const FormAnalyzer: FC = () => {
  const httpClient = useHttpClient();
  const { backendUrl } = useSheshaApplication();
  const formManager = useFormManager();
  const settings = useSettings();
  const [state, setState] = useState<ItemsState>();

  const fetchFormsAsync = async (): Promise<void> => {
    const query = {
      maxResultCount: -1,
      filter: { "==": [{ var: "module.name" }, "Shesha"] },
    };
    const url = `/api/services/Shesha/FormConfiguration/GetAll?${qs.stringify(query)}`;
    const response = await httpClient.get<IAjaxResponse<GetAllResponse<FormDto>>>(url);
    const data = extractAjaxResponse(response.data);

    const allItems: ItemState[] = [];
    for (const item of data.items) {
      try {
        const form = await formManager.getFormById({ formId: item.id, skipCache: true });
        console.log(`LOG: loaded form "${form.module}/${form.name}"`);
        const uniqueRefs = ItemReferenceFinder.findAll(form.flatStructure.allComponents, { unique: true });

        const allRefs = ItemReferenceFinder.findAndMap<unknown, DependencyInfo>(form.flatStructure.allComponents, (ref, path) => {
          return {
            itemId: ref,
            path,
            isSatisfied: false,
          };
        }, {
          onAnalyze: (current, addRef, _path) => {
            if (!isConfigurableActionConfiguration(current))
              return;

            const tryAddFormByLink = (url: string | undefined | null, customPath?: string): void => {
              // callback
              if (!isNullOrWhiteSpace(url)) {
                const parsedUrl = parseUrlPureRegex(url);
                if (parsedUrl) {
                  console.log('LOG: analyze href - url found', url);
                  addRef({
                    module: parsedUrl.module,
                    name: parsedUrl.form,
                  }, customPath);
                } else
                  console.log('LOG: analyze href - not found', url);
              }
            };

            const tryAddFormsFromJs = (jsCode: string | undefined | null): void => {
              if (!isNullOrWhiteSpace(jsCode)) {
                const urls = extractPathsSimple(jsCode);
                urls.forEach((url) => tryAddFormByLink(url, "JavaScript code"));
              }
            };

            if (isScriptActionConfiguration(current)) {
              tryAddFormsFromJs(current.actionArguments?.expression);
            }
            if (isNavigationActionConfiguration(current) && current.actionArguments) {
              if (current.actionArguments.navigationType === "url") {
                tryAddFormByLink(current.actionArguments.url, "navigate action");
              }
            }
          },
        });

        findSpecificRefs(form.flatStructure.allComponents, (ref, path) => {
          allRefs.push({
            itemId: ref,
            path,
            isSatisfied: false,
          });
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
        };
        allItems.push(formState);
      } catch (error) {
        console.error(`Failed to process form '${item.module}/${item.name}'`, error);
      }
    }

    const settingId: ConfigurableItemFullName = { name: 'Shesha.MainMenuSettings', module: 'Shesha' };
    const mainMenu = await settings.getSetting<IConfigurableMainMenu>(settingId);
    console.log('LOG: fetched main menu: ', mainMenu);

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
                {state.items.map((item, index) => (
                  <tr key={index}>
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
                        {item.dependencies.map((dep, index) => (
                          <li key={index} style={{ color: dep.isSatisfied ? 'green' : 'red' }}>
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
