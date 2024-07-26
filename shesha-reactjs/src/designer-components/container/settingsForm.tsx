import React, { FC } from 'react';
import SettingsCollapsiblePanel from '@/designer-components/_settings/settingsCollapsiblePanel';
import SettingsForm, { useSettingsForm } from '@/designer-components/_settings/settingsForm';
import SettingsFormItem from '@/designer-components/_settings/settingsFormItem';
import { IContainerComponentProps, ISettingsFormFactoryArgs } from '@/interfaces';
import { useForm } from '@/providers';
import ReadOnlyModeSelector from '@/components/editModeSelector/index';
import { useFormDesignerState } from '@/providers/formDesigner';
import { ContextPropertyAutocomplete } from '@/designer-components/contextPropertyAutocomplete';
import {
    Input,
    Checkbox,
    Select,
    InputNumber
} from 'antd';
import { IDropdownProps } from '@/components/dropdown/model';
import ReferenceListAutocomplete from '@/components/referenceListAutocomplete';
import { CodeEditor, LabelValueEditor, QueryBuilder } from '@/components';
import TextArea from 'antd/es/input/TextArea';
import PermissionAutocomplete from '@/components/permissionAutocomplete';
import BackgroundConfigurator from '../styleBackground/components/background/background';
import {
    ALIGN_ITEMS,
    ALIGN_SELF,
    FLEX_DIRECTION,
    FLEX_WRAP,
    JUSTIFY_CONTENT,
    JUSTIFY_ITEMS,
    JUSTIFY_SELF,
    TEXT_JUSTIFY,
} from './data';
import SizeComponent from '../styleDimensions/components/size/sizeComponent';
import BorderComponent from '../styleBorder/components/border/borderComponent';
import StyleBox from '../styleBox/components/box';
import Background from '../styleBackground';


const { Option } = Select;

const renderSelect = (arr) => (
    <Select
        placeholder="Select flex direction"
        style={{ width: 200 }}
    >
        {arr.map(option => (
            <Option key={option.id} value={option.value}>
                {option.label}
            </Option>
        ))}
    </Select>
);
const DropdownSettings: FC<ISettingsFormFactoryArgs<IContainerComponentProps>> = ({ readOnly }) => {
    const { model, onValuesChange } = useSettingsForm<IContainerComponentProps>();
    const designerModelType = useFormDesignerState(false)?.formSettings?.modelType;
    const { formSettings } = useForm();

    return (
        <SettingsCollapsiblePanel header="Display">
            <ContextPropertyAutocomplete
                id="415cc8ec-2fd1-4c5a-88e2-965153e16069"
                readOnly={readOnly}
                defaultModelType={designerModelType ?? formSettings.modelType}
                formData={model}
                onValuesChange={onValuesChange} />

            <SettingsCollapsiblePanel header="Display" ghost collapsible="header" expandIconPosition="start">
                <SettingsFormItem name="componentName" label="Component name" required>
                    <Input />
                </SettingsFormItem>
                <SettingsFormItem name="hidden" label="Hidden">
                    <Checkbox />
                </SettingsFormItem>
                <SettingsFormItem name="editMode" label="Edit mode">
                    <ReadOnlyModeSelector readOnly={readOnly} />
                </SettingsFormItem>
                <SettingsFormItem name="noDefaultStyling" label="No Default Styling" tooltip="If checked, the default styles and classes of the container will not be applied.">
                    <Checkbox />
                </SettingsFormItem>
                <SettingsFormItem name="display" label="Display" required tooltip="The display CSS property sets whether an element is treated as a block or inline element and the layout used for its children, such as flow layout, grid or flex.">
                    <Select>
                        <Option value="block">Block</Option>
                        <Option value="flex">Flex</Option>
                        <Option value="grid">Grid</Option>
                        <Option value="grid-inline">Grid inline</Option>
                    </Select>
                </SettingsFormItem>
                <SettingsFormItem name="flexDirection" label="Flex Direction" hidden={model?.display !== 'flex'} tooltip="The flex-direction CSS property sets how flex items are placed in the flex container defining the main axis and the direction (normal or reversed).">
                    {renderSelect(FLEX_DIRECTION)}
                </SettingsFormItem>
                <SettingsFormItem name="flexWrap" label="Flex Wrap" hidden={model?.display !== 'flex'} tooltip="The flex-wrap CSS property sets whether flex items are forced onto one line or can wrap onto multiple lines. If wrapping is allowed, it sets the direction that lines are stacked.">
                    {renderSelect(FLEX_WRAP)}
                </SettingsFormItem>
                <SettingsFormItem name="gap" label="Gap" tooltip="Examples of a valid gap include: `10` | `10px` | `20px 20px`" hidden={model?.display === 'block'}>
                    <Input />
                </SettingsFormItem>
                <SettingsFormItem name="gridColumnsCount" label="Grid Columns Count" tooltip="Number of columns each grid should have" hidden={model.display !== 'inline-grid'}>
                    <InputNumber />
                </SettingsFormItem>
                <SettingsFormItem name="direction" label="Direction" required>
                    <Select>
                        <Option value="vertical">Vertical</Option>
                        <Option value="horizontal">Horizontal</Option>
                    </Select>
                </SettingsFormItem>
                <SettingsFormItem name="alignItems" label="Align Items" hidden={model?.flexDirection === 'column'} tooltip="The CSS align-items property sets the align-self value on all direct children as a group. In Flexbox, it controls the alignment of items on the Cross Axis. In Grid Layout, it controls the alignment of items on the Block Axis within their grid area.">
                    {renderSelect(ALIGN_ITEMS)}
                </SettingsFormItem>
                <SettingsFormItem name="alignSelf" label="Align Self" hidden={model?.direction === 'vertical'} tooltip="The align-self CSS property overrides a grid or flex item's align-items value. In Grid, it aligns the item inside the grid area. In Flexbox, it aligns the item on the cross axis.">
                    {renderSelect(ALIGN_SELF)}
                </SettingsFormItem>
                <SettingsFormItem name="justifyContent" label="Justify Content" hidden={model?.direction === 'vertical'} tooltip="The CSS justify-content property defines how the browser distributes space between and around content items along the main-axis of a flex container, and the inline axis of a grid container.">
                    {renderSelect(JUSTIFY_CONTENT)}
                </SettingsFormItem>
                <SettingsFormItem name="justifySelf" label="Justify Self" hidden={model?.direction === 'vertical'} tooltip="The CSS justify-self property sets the way a box is justified inside its alignment container along the appropriate axis.">
                    {renderSelect(JUSTIFY_SELF)}
                </SettingsFormItem>
                <SettingsFormItem name="textJustify" label="Text Justify" hidden={model?.direction === 'vertical'} tooltip="The text-justify CSS property sets what type of justification should be applied to text when text-align: justify; is set on an element.">
                    {renderSelect(TEXT_JUSTIFY)}
                </SettingsFormItem>
                <SettingsFormItem name="justifyItems" label="Justify Items" tooltip="The CSS justify-items property defines the default justify-self for all items of the box, giving them all a default way of justifying each box along the appropriate axis.">
                    {renderSelect(JUSTIFY_ITEMS)}
                </SettingsFormItem>
            </SettingsCollapsiblePanel>

            <SettingsCollapsiblePanel header="Style" ghost collapsible="header" expandIconPosition="start">
                <SettingsFormItem name="className" label="Custom CSS Class" tooltip="Custom CSS Class to add to this component">
                    <Input />
                </SettingsFormItem>
                <SettingsFormItem name="style" label="Style" tooltip="The style that will be applied to the container">
                    <CodeEditor />
                </SettingsFormItem>
                <SettingsFormItem name="wrapperStyle" label="Wrapper Style" tooltip="The style that will be applied to the container wrapper" hidden={model?.noDefaultStyling}>
                    <CodeEditor />
                </SettingsFormItem>
                <SettingsCollapsiblePanel header="Dimensions" ghost collapsible="header" expandIconPosition="start">
                    <SettingsFormItem name="dimensions">
                        <SizeComponent />
                    </SettingsFormItem>
                </SettingsCollapsiblePanel>
                <SettingsCollapsiblePanel header="Border" ghost collapsible="header" expandIconPosition="start" >
                    <SettingsFormItem name="border" tooltip="Customize the borders of your object by specifying the width, style, and color for each side. You can also add border radius to create rounded corners.">
                        <BorderComponent />
                    </SettingsFormItem>
                </SettingsCollapsiblePanel>
                <SettingsCollapsiblePanel header="Background" ghost collapsible="header" expandIconPosition="start" >
                    <BackgroundConfigurator onValuesChange={onValuesChange} value={model.background} />
                    <SettingsFormItem name="stylingBox">
                        <StyleBox />
                    </SettingsFormItem>
                </SettingsCollapsiblePanel>

                <SettingsCollapsiblePanel header="Security" ghost collapsible="header" expandIconPosition="start">
                    <SettingsFormItem name="permissions" label="Permissions">
                        <PermissionAutocomplete />
                    </SettingsFormItem>
                </SettingsCollapsiblePanel>

            </SettingsCollapsiblePanel>
        </SettingsCollapsiblePanel>

    );
};

export const ContaineSettingsForm: FC<ISettingsFormFactoryArgs<IContainerComponentProps>> = (props) => {
    return <SettingsForm<IContainerComponentProps> {...props}>
        <DropdownSettings {...props} />
    </SettingsForm>;
};

export default ContaineSettingsForm;