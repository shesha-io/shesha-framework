import { IStyleType } from "@/index";

export const defaultStyles = (): IStyleType => {
    return {
        background: { type: 'color', color: 'transparent' },
        font: { weight: '400', size: 14, type: 'Segoe UI' },
        border: {
            border: {
                all: { width: '1px', style: 'none', color: '#d9d9d9' },
                top: { width: '1px', style: 'solid', color: '#d9d9d9' },
                bottom: { width: '1px', style: 'solid', color: '#d9d9d9' },
                left: { width: '1px', style: 'solid', color: '#d9d9d9' },
                right: { width: '1px', style: 'solid', color: '#d9d9d9' },
            },
            radius: { all: 8, topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
            borderType: 'all',
            radiusType: 'all'
        },
        dimensions: { width: 'auto', height: '32px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
        stylingBox: '{"paddingLeft":"0","paddingBottom":"0","paddingTop":"0","paddingRight":"0"}',
    };
};

/**
 * Validate the single dimensions (width, height, ...) so that they always have units
 * @param dimension - The dimension to validate
 * @returns The validated dimension with units
 */
export const validateDimension = (dimension?: string | number) => {
    if (dimension == null || dimension === '') return undefined;

    const keywords = ['auto', 'fit-content', 'fill-available', 'fill-parent', 'fill-screen', 'fill-viewport', 'fill-window', 'fill-body', 'fill-html', 'fill-root', 'fill-parent', 'fill-screen', 'fill-viewport', 'fill-window', 'fill-body', 'fill-html', 'fill-root'];
    switch (typeof dimension) {
      case 'number':
        return `${dimension}px`;
      case 'string':
        if (/^\d+$/.test(dimension)) return `${dimension}px`; // digit-only string
        if (/^\d+(px|%|em|rem|vh|vw)$/.test(dimension)) return dimension; // already valid
        if (keywords.includes(dimension)) return dimension; // keep keywords like 'auto', 'fit-content', etc.
      default:
        return undefined;
    }
};