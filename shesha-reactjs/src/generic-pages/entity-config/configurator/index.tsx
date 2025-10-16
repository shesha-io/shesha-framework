import EntityConfigTree, { IEntityConfigTreeInstance } from '@/components/entityConfigTree';
import IndexToolbar from '@/components/indexToolbar';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Checkbox, Col, Form, App, Modal, Row } from 'antd';
import { Autocomplete, Page, ValidationErrors } from '@/components';
import { DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { EntityConfigDto } from '@/apis/entityConfig';
import { IToolbarItem, PageWithLayout } from '@/interfaces';
import { MetadataSourceType } from '@/interfaces/metadata';
import { modelConfigurationsMerge } from '@/apis/modelConfigurations';
import { useLocalStorage } from '@/hooks';
import { useModelConfigurator, useSheshaApplication } from '@/providers';

import { SizableColumns } from '@/components/sizableColumns';
import classNames from 'classnames';
import { useStyles } from './styles';
import ModelConfiguratorRenderer from '@/components/modelConfigurator/renderer';
import { isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';

export interface IEntityConfiguratorPageProps {
  id?: string;
}

interface ILoadingState {
  loading?: boolean;
  loadingText?: string;
}

export const EntityConfiguratorPage: PageWithLayout<IEntityConfiguratorPageProps> = ({ id }) => {
  const { styles } = useStyles();

  const { backendUrl, httpHeaders } = useSheshaApplication();
  const configurator = useModelConfigurator();
  const entityConfigTreeRef = useRef<IEntityConfigTreeInstance>();
  const [loadingState, setLoadingState] = useState<ILoadingState>({});
  const [entityConfigId, setEntityConfigId] = useState<string>(id);
  const [entityConfig, setEntityConfig] = useState<EntityConfigDto>(null);
  const [modal, contextHolder] = Modal.useModal();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteAfterMerge, setIsDeleteAfterMerge] = useLocalStorage('shaEntityConfigPage.isDeleteAfterMerge', false);
  const [autocompleteResult, setAutocompleteResult] = useState(null);
  const [mergeError, setMergeError] = useState(null);
  const { message } = App.useApp();

  const onChange = (item: EntityConfigDto): void => {
    if (item) {
      setEntityConfigId(item.id);
      setEntityConfig(item);
      configurator.changeModelId(item.id);
    }
  };

  // update after create
  useEffect(() => {
    if (configurator.modelConfiguration?.id && configurator.modelConfiguration?.id !== entityConfigId) {
      onChange(configurator.modelConfiguration);
      if (entityConfigId === '') // {
        entityConfigTreeRef.current.refresh(configurator.modelConfiguration?.id);
      /* } else {
        entityConfigTreeRef.current.update(configurator.modelConfiguration);*
      }*/
    }
  }, [configurator.modelConfiguration?.id]);

  const handleOk = (): void => {
    const del =
      isDeleteAfterMerge &&
      (!(entityConfig?.source === MetadataSourceType.ApplicationCode) || entityConfig?.notImplemented);
    setLoadingState({ loading: true, loadingText: 'Saving...' });
    modelConfigurationsMerge(
      { sourceId: entityConfig.id, destinationId: autocompleteResult.id, deleteAfterMerge: del },
      { base: backendUrl, headers: httpHeaders },
    )
      .then((response) => {
        if (isAjaxSuccessResponse(response)) {
          if (del) entityConfigTreeRef.current.refresh(autocompleteResult.id);
          onChange(response.result);
          message.success('Configurations merged successfully');
          setIsModalOpen(false);
        } else setMergeError(response.error);
      })
      .catch((e) => {
        setMergeError({ message: 'Failed to load model', details: e });
      })
      .finally(() => {
        setLoadingState({ loading: false, loadingText: null });
      });
  };

  const allowDelete = useMemo(() => {
    return entityConfig && (entityConfig.source === MetadataSourceType.UserDefined || entityConfig.notImplemented);
  }, [entityConfig]);
  /* const allowMerge = useMemo(() => {
    return entityConfig && entityConfig.source === MetadataSourceType.ApplicationCode && entityConfig.notImplemented;
  }, [entityConfig]);*/

  const toolbarItems: IToolbarItem[] = [
    {
      title: 'Create new entity',
      icon: <PlusOutlined />,
      onClick: () => {
        setEntityConfigId('');
        configurator.createNew({ source: MetadataSourceType.UserDefined });
      },
    },
    {
      title: 'Save',
      icon: <SaveOutlined />,
      disabled: entityConfigId === null, // Check only entityConfigId
      onClick: () => {
        setLoadingState({ loading: true, loadingText: 'Saving...' });
        configurator
          .saveForm()
          .then((item) => {
            if (entityConfigId === '') {
              entityConfigTreeRef.current.refresh(item?.id);
              setEntityConfigId(item?.id);
            } else {
              entityConfigTreeRef.current.update(item);
            }
            message.success('Configuration saved successfully');
          })
          .catch((error) => {
            if (!error?.errorFields) message.error('Failed to save configuration');
          })
          .finally(() => {
            setLoadingState({ loading: false, loadingText: null });
          });
      },
    },
    /* {
      title: 'Merge entity to...',
      icon: <MergeCellsOutlined />,
      disabled: entityConfigId === null || !allowMerge,
      onClick: () => {
        setIsDeleteAfterMerge(
          !(entityConfig?.source === MetadataSourceType.ApplicationCode) || entityConfig?.notImplemented
        );
        setAutocompleteResult(null);
        setMergeError(null);
        setIsModalOpen(true);
      },
    },*/
    {
      title: 'Delete',
      icon: <DeleteOutlined />,
      disabled: entityConfigId === null || !allowDelete,
      onClick: () => {
        modal.confirm({
          content: 'Are you sure want to delete?',
          onOk: () => {
            setLoadingState({ loading: true, loadingText: 'Saving...' });
            configurator
              .delete()
              .then(() => {
                entityConfigTreeRef.current.refresh(null);
                setEntityConfigId(null);
                message.success('Configuration deleted successfully');
              })
              .catch((error) => {
                if (!error?.errorFields) message.error('Failed to delete configuration');
              })
              .finally(() => {
                setLoadingState({ loading: false, loadingText: null });
              });
          },
        });
      },
    },
  ];

  return (
    <div>
      <Page
        title={`Entity Configuration ${entityConfig?.label ? `- ${entityConfig?.label}` : ''}`}
        description=""
        loading={loadingState.loading}
        loadingText={loadingState.loadingText}
      >
        <SizableColumns
          sizes={[25, 75]}
          minSize={150}
          expandToMin={false}
          gutterSize={8}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          cursor="col-resize"
          className={classNames(styles.container)}
        >
          <div className={styles.mainArea}>
            <EntityConfigTree
              onChange={onChange}
              defaultSelected={entityConfigId}
              entityConfigTreeRef={entityConfigTreeRef}
            />
          </div>
          <div className={styles.propsPanel}>
            <div className={classNames(styles.propsPanelContent)}>
              <IndexToolbar className={classNames(styles.propsPanelHeader)} items={toolbarItems} />
              {entityConfigId != null && <ModelConfiguratorRenderer />}
            </div>
          </div>
        </SizableColumns>
        <div>{contextHolder}</div>

        <Modal
          title="Merge entity confifurations"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={() => {
            setIsModalOpen(false);
          }}
        >
          <ValidationErrors error={mergeError} />
          <Alert
            type="warning"
            showIcon
            description={
              "This will merge this entity configuration '" +
              entityConfig?.namespace +
              '.' +
              entityConfig?.className +
              "' into and overwrite the configuration of the entity you selected"
            }
          />
          <Row>
            <Col span="6">
              <Form.Item>Merge from:</Form.Item>
            </Col>
            <Col span="18">
              {entityConfig && (
                <Form.Item>
                  {entityConfig?.namespace}. {entityConfig?.className}
                </Form.Item>
              )}
            </Col>
          </Row>
          <Row>
            <Col span="6">
              <Form.Item>Merge to:</Form.Item>
            </Col>
            <Col span="18">
              <Form.Item>
                <Autocomplete
                  dataSourceType="url"
                  dataSourceUrl="/api/services/app/EntityConfig/EntityConfigAutocomplete?implemented=true"
                  value={autocompleteResult}
                  onChange={setAutocompleteResult}
                />
              </Form.Item>
            </Col>
          </Row>
          {(!(entityConfig?.source === MetadataSourceType.ApplicationCode) || entityConfig?.notImplemented) && (
            <Row>
              <Col span="6">
                <Form.Item>Delete after merge:</Form.Item>
              </Col>
              <Col span="18">
                <Form.Item>
                  <Checkbox
                    checked={isDeleteAfterMerge}
                    onChange={(e) => {
                      setIsDeleteAfterMerge(e.target.checked);
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Modal>
      </Page>
    </div>
  );
};
