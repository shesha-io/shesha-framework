import { isEqual } from 'lodash';
import React from 'react';
import { FC } from 'react';
import { Typography } from 'antd';
import { ConfigurableForm } from '@/components';
import { IShaFormInstance } from '@/providers/form/store/interfaces';

export interface UserDecision {
    uid: string;
    label: string;
    visibility?: string;
    description?: string;
}

export interface IUserDecisionEditorProps {
    value: UserDecision;
    onChange: (newValue: UserDecision) => void;
}
const { Paragraph } = Typography;
export const UserDecisionEditor: FC<IUserDecisionEditorProps> = (props) => {
    const { value, onChange } = props;

    const onValuesChange = (_changedValues: any, values: UserDecision) => {
        const equal = isEqual(value, values);
        if (!equal)
            onChange(values);
    };

    const onMarkupLoaded = (shaForm: IShaFormInstance) => {
        console.log('LOG: markeup loaded event 🔥', shaForm);
        return Promise.resolve();
    };

    return (
        <>
            <ConfigurableForm
                logEnabled
                formId={{ name: 'user-task-decision', module: 'Shesha.Workflow' }}
                mode='edit'
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                initialValues={value}
                onValuesChange={onValuesChange}
                onMarkupLoaded={onMarkupLoaded}
            />
            <Paragraph
                copyable={{
                    text: () => {
                        return JSON.stringify(value, null, 2);
                    },
                }}
            >
                Copy value
            </Paragraph>
        </>
    );
};

export default UserDecisionEditor;