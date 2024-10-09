import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';

export const getSettings = () =>
    new DesignerToolbarSettings()
        .addCollapsiblePanel({
            id: nanoid(),
            propertyName: 'pnlDisplay',
            parentId: 'root',
            label: 'Display',
            labelAlign: 'left',
            expandIconPosition: 'start',
            ghost: true,
            collapsible: 'header',
            content: {
                id: '7d8493e3-141f-4507-a983-7f3ff7f2cf86',
                components: [
                    ...new DesignerToolbarSettings()
                        .addContextPropertyAutocomplete({
                            id: nanoid(),
                            propertyName: 'propertyName',
                            label: 'Property name',
                            parentId: '7d8493e3-141f-4507-a983-7f3ff7f2cf86',
                            validate: {
                                required: true,
                            },
                        })
                        .addTextField({
                            id: nanoid(),
                            propertyName: 'label',
                            parentId: '7d8493e3-141f-4507-a983-7f3ff7f2cf86',
                            label: 'Label',
                        })
                        .addCheckbox({
                            id: nanoid(),
                            propertyName: 'hideLabel',
                            parentId: '7d8493e3-141f-4507-a983-7f3ff7f2cf86',
                            label: 'Hide Label',
                            labelAlign: 'right',
                            validate: {},
                        })
                        .addCheckbox({
                            id: nanoid(),
                            propertyName: 'hidden',
                            parentId: '7d8493e3-141f-4507-a983-7f3ff7f2cf86',
                            label: 'Hidden',
                            labelAlign: 'right',
                            validate: {},
                        })
                        .toJson(),
                ],
            },
        })
        .toJson();
