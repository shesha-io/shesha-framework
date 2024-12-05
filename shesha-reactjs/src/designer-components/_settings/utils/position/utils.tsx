import { IRadioOption } from "@/designer-components/settingsInput/settingsInput";
import { IStyleType } from "@/index";

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

    style.position = value;
    style.top = top;
    style.left = left;
    style.right = right;
    style.bottom = bottom;


    return style;
};
export const getPositionInputs = () => positions.map(value => {
    const label = value.value;
    const code = 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.position.offset)' + `!== "${label}"` + ' || getSettingValue(data[`${ contexts.canvasContext?.designerDevice || "desktop"}`]?.position.value) === "static";';

    return {
        id: `borderStyleRow-${label}`,
        parentId: 'borderStylePnl',
        inline: true,
        readOnly: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.border?.hideBorder);', _mode: 'code', _value: false } as any,
        hidden: { _code: code, _mode: 'code', _value: false } as any,
        inputs: [
            {
                id: "offset-selector",
                label: "Offsets",
                propertyName: "position.offset",
                type: "radio",
                defaultValue: "all",
                tooltip: "Select a corner to which the radius will be applied",
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
                tooltip: "Select a corner to which the radius will be applied",
                propertyName: `position.${label}`
            }]
    };
});