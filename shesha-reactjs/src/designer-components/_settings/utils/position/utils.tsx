import { IStyleType } from "@/index";
import { addPx } from "../../utils";
import { IRadioOption } from "@/designer-components/settingsInput/interfaces";

const positions: IRadioOption[] = [
    { value: 'top', title: '', icon: 'UpSquareOutlined' },
    { value: 'right', title: '', icon: 'RightSquareOutlined' },
    { value: 'left', title: '', icon: 'LeftSquareOutlined' },
    { value: 'bottom', title: '', icon: 'DownSquareOutlined' }

];

export const getPositionStyle = (input?: IStyleType['position']): React.CSSProperties => {
    if (!input) return {};

    const style: React.CSSProperties = {};
    const { value, top, left, right, bottom } = input;

    style.position = value || 'relative';
    style.top = addPx(top);
    style.left = addPx(left);
    style.right = addPx(right);
    style.bottom = addPx(bottom);

    return style;
};

export const getPositionInputs = () => positions.map(value => {
    const label = value.value;
    const code = 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.position.offset)' + `!== "${label}"` + ' || getSettingValue(data[`${ contexts.canvasContext?.designerDevice || "desktop"}`]?.position.value) === "static";';

    return {
        id: `borderStyleRow-${label}`,
        parentId: 'borderStylePnl',
        inline: true,
        readOnly: false,
        hidden: { _code: code, _mode: 'code', _value: false } as any,
        inputs: [
            {
                id: "offset-selector",
                label: "Offsets",
                propertyName: "position.offset",
                type: "radio",
                defaultValue: "all",
                tooltip: "Select a direction to apply the offset",
                buttonGroupOptions: positions,
            },
            {
                id: `positionStyleRow-${label}`,
                parentId: "positionStylePnl",
                label: label,
                hideLabel: true,
                width: 65,
                defaultValue: 0,
                inputType: 'number',
                propertyName: `position.${label}`
            }]
    };
});