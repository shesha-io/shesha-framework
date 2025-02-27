
export const filterDynamicComponents = (components, query, data) => {
    if (!components || !Array.isArray(components)) return [];

    const lowerCaseQuery = query.toLowerCase();

    // Helper function to evaluate hidden property
    const evaluateHidden = (hidden, directMatch, hasVisibleChildren) => {
        return hidden || (!directMatch && !hasVisibleChildren);
    };

    // Helper function to check if text matches query
    const matchesQuery = (text) => text?.toLowerCase().includes(lowerCaseQuery);

    const filterResult = components.map(component => {
        // Deep clone the component to avoid mutations
        const c = { ...component };

        // Check if component matches query directly
        const directMatch = (
            matchesQuery(c.label) ||
            matchesQuery(c.propertyName) ||
            (c.propertyName && matchesQuery(c.propertyName.split('.').join(' ')))
        );

        // Handle propertyRouter
        if (c.componentName === 'propertyRouter') {
            const filteredComponents = filterDynamicComponents(c.components, query, data);

            return {
                ...c,
                hidden: filteredComponents.length < 1,
                components: filteredComponents
            };
        }

        // Handle collapsiblePanel
        if (c.type === 'collapsiblePanel') {
            const contentComponents = filterDynamicComponents(c.content?.components || [], query, data);
            const hasVisibleChildren = contentComponents.length > 0;

            return {
                ...c,
                content: {
                    ...c.content,
                    components: contentComponents
                },
                className: 'y-overflow',
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

        // Handle basic component
        return {
            ...c,
            hidden: evaluateHidden(c.hidden, directMatch, false)
        };
    });

    // Filter out null components and handle visibility
    return filterResult.filter(c => {
        if (!c) return false;

        return true;
    });
};