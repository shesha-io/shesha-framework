import { IStyleType } from "@/index";

export const defaultStyles = (): IStyleType => {
    return {
        background: { type: 'color', color: '#fff' },
        font: {
            weight: '400',
            size: 14,
            color: '#000',
            type: 'Segoe UI'
        },
        border: {
            border: {
                all: {
                    width: '1px',
                    style: 'solid',
                    color: '#d9d9d9'
                }
            },
            radius: { all: 8 },
            borderType: 'all',
            radiusType: 'all'
        },
        dimensions: {
            width: '100%',
            height: 'auto',
            minHeight: '32px',
            maxHeight: 'auto',
            minWidth: '0px',
            maxWidth: 'auto'
        }
    };
};

export const presetColors = [
    {
        value: 'success',
        label: 'Success'
    },
    {
        value: 'processing',
        label: 'Processing'
    },
    {
        value: 'warning',
        label: 'Warning'
    },
    {
        value: 'error',
        label: 'Error'
    },
    {
        value: 'magenta',
        label: 'Magenta'
    },
    {
        value: 'red',
        label: 'Red'
    },
    {
        value: 'volcano',
        label: 'Volcano'
    },
    {
        value: 'orange',
        label: 'Orange'
    },
    {
        value: 'gold',
        label: 'Gold'
    },
    {
        value: 'lime',
        label: 'Lime'
    },
    {
        value: 'green',
        label: 'Green'
    },
    {
        value: 'cyan',
        label: 'Cyan'
    },
    {
        value: 'blue',
        label: 'Blue'
    },
    {
        value: 'geekblue',
        label: 'Geekblue'
    },
    {
        value: 'purple',
        label: 'Purple'
    }
];
