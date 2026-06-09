import React, { ReactElement, useState } from 'react';
import { useStyles } from './styles/styles';
import { Button, Modal } from 'antd';
import { LockFilled, LockOutlined } from '@ant-design/icons';
import SettingsControl from './settingsControl';
import { PermissionAutocomplete } from '../../components/permissionAutocomplete/index';
import { ConfigurableFormItem } from '../../components/formDesigner/components/formItem';
import { IPropertySetting } from '../../providers/form/models';

export interface IPermissionsControlProps {
  enabled?: boolean;
  propertyName: string;
  readOnly?: boolean;
  readonly children?: ReactElement;
}

interface IPermissionModalProps {
  propertyName: string;
  toggleModal: () => void;
  readOnly: boolean;
  value: IPropertySetting<string[]> | string[];
  onChange: (value: IPropertySetting<string[]> | string[]) => void;
}

const PermissionModal = (props: IPermissionModalProps): ReactElement => {
  const { readOnly, toggleModal, propertyName, value, onChange } = props;
  const { styles } = useStyles();
  const [localValue, setLocalValue] = useState<IPropertySetting<string[]> | string[]>(value);

  const onSave = (): void => {
    onChange?.(localValue);
    toggleModal();
  };

  return (
    <Modal
      title={readOnly ? 'View permissions' : 'Add permissions'}
      open={true}
      width={600}

      onOk={onSave}
      okButtonProps={{ hidden: readOnly }}

      onCancel={toggleModal}
      cancelText={readOnly ? 'Close' : 'Cancel'}
    >
      <div className="vertical-settings">
        <ConfigurableFormItem
          model={{ label: <div className={styles.label}>Select permissions or provide JS code to calculate permissions</div>, type: '', id: '', size: 'small' }}
          className="sha-js-label"
        >
          <SettingsControl<string[]>
            propertyName={propertyName}
            mode="value"
            onChange={setLocalValue}
            value={localValue}
            readOnly={readOnly}
          >
            {(valueLocal, onChangeLocal) => <PermissionAutocomplete value={valueLocal} onChange={onChangeLocal} readOnly={readOnly} />}
          </SettingsControl>
        </ConfigurableFormItem>
      </div>
    </Modal>
  );
};

const PermissionsControlInner = (props: IPermissionsControlProps): ReactElement => {
  const { propertyName } = props;
  const { styles } = useStyles();
  const [showModal, setShowModal] = useState(false);
  const toggleModal = (): void => setShowModal((currentVisible) => !currentVisible);
  return (
    <ConfigurableFormItem model={{ hideLabel: true, propertyName, type: '', id: '' }}>
      {(value, onChange) => {
        const valueExists = Array.isArray(value) ? value.length > 0 : Boolean(value);
        return (
          <div className={styles.contentJs}>
            <Button
              hidden={props.readOnly}
              className={`${styles.jsSwitch} inlineJS`}
              style={{ marginRight: '22px' }}
              type="text"
              danger={valueExists}
              size="small"
              icon={valueExists ? <LockFilled /> : <LockOutlined />}
              onClick={toggleModal}
            />
            {props.children}
            {showModal && <PermissionModal propertyName={propertyName} readOnly={props.readOnly} toggleModal={toggleModal} value={value} onChange={onChange} />}
          </div>
        );
      }}
    </ConfigurableFormItem>
  );
};

export const PermissionsControl = (props: IPermissionsControlProps): ReactElement => {
  return props.enabled ? <PermissionsControlInner {...props} /> : props.children;
};

export default PermissionsControl;
