import { evaluateString } from "@/index";

export const filterDynamicComponents = (components, query, data) => {
    if (!components || !Array.isArray(components)) return [];

    const lowerCaseQuery = query.toLowerCase();

    const evaluateHidden = (hidden, directMatch, hasVisibleChildren) => {
        if (typeof hidden === 'string') {
            return evaluateString(hidden, data);
        }
        return hidden || (!directMatch && !hasVisibleChildren);
    };

    const matchesQuery = (text) => text?.toLowerCase().includes(lowerCaseQuery);

    const filterResult = components.map(component => {
        const c = { ...component };

        const directMatch = (
            matchesQuery(c.label) ||
            matchesQuery(c.propertyName) ||
            (c.propertyName && matchesQuery(c.propertyName.split('.').join(' ')))
        );

        // Handle propertyRouter
        if (c.type === 'propertyRouter') {
            const filteredComponents = filterDynamicComponents(c.components, query, data);
            const hasVisibleChildren = filteredComponents.length > 0;
            return {
                ...c,
                components: filteredComponents,
                hidden: evaluateHidden(c.hidden, directMatch, hasVisibleChildren)
            };
        }

        // Handle collapsiblePanel
        if (c.type === 'collapsiblePanel') {
            const filteredContentComponents = filterDynamicComponents(c.content?.components || [], query, data);
            const hasVisibleChildren = filteredContentComponents.length > 0;

            return {
                ...c,
                content: {
                    ...c.content,
                    components: filteredContentComponents
                },
                hidden: evaluateHidden(c.hidden, directMatch, hasVisibleChildren)
            };
        }

        // Handle settingsInputRow
        if (c.type === 'settingsInputRow') {
            const filteredInputs = c.inputs?.filter(input =>
                matchesQuery(input.label) ||
                matchesQuery(input.propertyName) ||
                (input.propertyName && matchesQuery(input.propertyName.split('.').join(' ')))
            ) || [];

            return {
                ...c,
                inputs: filteredInputs,
                hidden: evaluateHidden(c.hidden, directMatch, filteredInputs.length > 0)
            };
        }

        // Handle components with nested components
        if (c.components) {
            const filteredComponents = filterDynamicComponents(c.components, query, data);
            const hasVisibleChildren = filteredComponents.length > 0;

            return {
                ...c,
                components: filteredComponents,
                hidden: evaluateHidden(c.hidden, directMatch, hasVisibleChildren)
            };
        }

        // Handle inputs array if present
        if (c.inputs) {
            const filteredInputs = c.inputs?.filter(input =>
                matchesQuery(input.label) ||
                matchesQuery(input.propertyName) ||
                (input.propertyName && matchesQuery(input.propertyName.split('.').join(' ')))
            ) || [];

            return {
                ...c,
                inputs: filteredInputs,
                hidden: evaluateHidden(c.hidden, directMatch, filteredInputs.length > 0)
            };
        }

        return {
            ...c,
            hidden: evaluateHidden(c.hidden, directMatch, false)
        };
    });

    return filterResult.filter(c => {
        if (!c) return false;

        const hasVisibleChildren = (
            (c.components && c.components.length > 0) ||
            (c.content?.components && c.content.components.length > 0) ||
            (c.inputs && c.inputs.length > 0)
        );

        const isHidden = typeof c.hidden === 'string'
            ? evaluateString(c.hidden, data)
            : c.hidden;

        return !isHidden || hasVisibleChildren;
    });
};