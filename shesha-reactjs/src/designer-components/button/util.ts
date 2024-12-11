import { IStyleType } from "@/index";

export const buttonTypes = [
    {
        id: 'c4a96833-8ed7-4085-8848-169d5607136d',
        label: 'primary',
        value: 'primary',
    },
    {
        id: 'c6f974da-ad28-44e5-8e4d-50280cf24ae7',
        label: 'ghost',
        value: 'ghost',
    },
    {
        id: '71c0dc14-0473-4748-ae75-a4ed3bd6cffd',
        label: 'dashed',
        value: 'dashed',
    },
    {
        id: '789d5733-2d4f-4969-890f-613e5b4a7d59',
        label: 'link',
        value: 'link',
    },
    {
        id: '36abe636-40b2-476c-95b0-78a50478146b',
        label: 'text',
        value: 'text',
    },
    {
        id: 'de08ea36-a831-4373-ab10-ce25fadf80cd',
        label: 'default',
        value: 'default',
    },
];

export const defaultStyles = (): IStyleType => {
    return {
        background: { type: 'color', color: '#fff' },
        font: { weight: '400', size: 14, color: '#000', type: 'Segoe UI' },
        dimensions: { width: 'auto', height: '32px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' }
    };
};
