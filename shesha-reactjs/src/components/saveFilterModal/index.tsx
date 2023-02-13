import React, { FC, useState, ChangeEvent } from 'react';
//
import { IDispatchable } from '../../interfaces';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { message, Modal, Input, Checkbox, Tooltip, Form } from 'antd';
import { formItemLayout, tailFormItemLayout } from './layouts';
import { getSafelyTrimmedString } from '../../utils';
import { ActionFunction1 } from 'redux-actions';
import { Action } from 'redux';

export interface ISaveFilterModalProps extends IDispatchable {
  showSaveFilterModal?: boolean;
  setSaveFiltersModalVisibility?: ActionFunction1<boolean, Action<any>>;
  saveFilters?: ActionFunction1<string, Action<any>>;
}

export const SaveFilterModal: FC<ISaveFilterModalProps> = ({
  dispatch,
  showSaveFilterModal,
  setSaveFiltersModalVisibility,
  saveFilters,
}) => {
  const [filterName, setFilterName] = useState('');

  const handleOk = () => {
    if (dispatch && saveFilters) {
      dispatch(saveFilters(filterName));
      message.loading('Saving your filters...', 2.5).then(
        () => message.success('Filters saved successfully!', 2.5),
        () => console.log('An error occured!')
      );
    }
  };

  const handleCancel = () => {
    if (dispatch && setSaveFiltersModalVisibility) {
      dispatch(setSaveFiltersModalVisibility(false));
    }
  };

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => setFilterName(event.target.value);

  return (
    <Modal
      title="Save Filters"
      open={showSaveFilterModal}
      onOk={handleOk}
      onCancel={handleCancel}
      okButtonProps={{
        disabled: getSafelyTrimmedString(filterName).length === 0,
      }}
    >
      <div className="save-filter-modal">
        <Form {...formItemLayout}>
          <Form.Item label="Enter filter name">
            <Input onChange={handleOnChange} value={filterName} />
          </Form.Item>

          <Form.Item {...tailFormItemLayout}>
            <Checkbox>Is private filter</Checkbox>

            <Tooltip title="Check if you don't want this filters to be available to everyone">
              <QuestionCircleOutlined />
            </Tooltip>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default SaveFilterModal;
