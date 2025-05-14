export const getWidth = (type: string, width: any) => {
    switch (type) {
        case 'numberField': return width || 100;
        case 'button': return width || 24;
        case 'dropdown': return width || 120;
        case 'radio': return width;
        case 'colorPicker': return width || 24;
        case 'customDropdown': return width || 120;
        default: return width || 50;
    }
};