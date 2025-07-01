export const getHeaderStyles = () => (
    {
        font: {
            color: "darkslategray",
            size: 14,
            weight: "500",
            align: "left",
            type: "Segoe UI"
        },
        background: {
            type: "color",
            color: "#fff"
        },
        dimensions: {
            width: "auto",
            height: "auto",
            minHeight: "0",
            maxHeight: "auto",
            minWidth: "0",
            maxWidth: "auto"
        },
        border: {
            radiusType: "all",
            borderType: "custom",
            border: {
                all: {},
                top: {},
                right: {},
                bottom: {
                    width: "2px",
                    style: "solid",
                    color: "var(--primary-color)"
                },
                left: {}
            },
            radius: {
                all: '0'
            }
        },
        stylingBox: "{\"paddingLeft\":\"0\",\"paddingBottom\":\"4\",\"paddingTop\":\"4\",\"paddingRight\":\"0\"}"
    }
);

export const getBodyStyles = () => ({
    border: {
        radiusType: "all",
        borderType: "all",
        border: {
            all: { width: '0px', style: 'none', color: '' },
            top: {},
            right: {},
            bottom: {},
            left: {}
        },
        radius: {
            all: 0
        }
    }
});

export const filterDynamicComponents = (components, query) => {
    if (!components || !Array.isArray(components)) return [];


    const lowerCaseQuery = query.toLowerCase();

    // Helper function to evaluate hidden property
    const evaluateHidden = (hidden, directMatch, hasVisibleChildren) => {
        return hidden || (!directMatch && !hasVisibleChildren);
    };

    // Helper function to check if text 
    // matches query

    const matchesQuery = (text) => {
        return text?.toLowerCase().includes(lowerCaseQuery);
    };

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
            const filteredComponents = filterDynamicComponents(c.components, query);

            return {
                ...c,
                hidden: filteredComponents.length < 1,
                components: filteredComponents
            };
        }

        // Handle collapsiblePanel
        if (c.type === 'collapsiblePanel') {
            const contentComponents = filterDynamicComponents(c.content?.components || [], query);
            const hasVisibleChildren = contentComponents.length > 0;

            return {
                ...c,
                collapsible: 'header',
                content: {
                    ...c.content,
                    components: contentComponents
                },
                ghost: false,
                collapsedByDefault: false,
                headerStyles: getHeaderStyles(),
                allStyles: getBodyStyles(),
                border: getBodyStyles().border,
                stylingBox: "{\"paddingLeft\":\"4\",\"paddingBottom\":\"4\",\"paddingTop\":\"0\",\"paddingRight\":\"4\",\"marginBottom\":\"5\"}",
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
            const filteredComponents = filterDynamicComponents(c.components, query);
            const hasVisibleChildren = filteredComponents.length > 0;

            return {
                ...c,
                components: filteredComponents,
                hidden: evaluateHidden(c.hidden, directMatch, hasVisibleChildren)
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

        // Evaluate final hidden state
        const hasVisibleChildren = (
            (c.components && c.components.length > 0) ||
            (c.content?.components && c.content.components.length > 0) ||
            (c.inputs && c.inputs.length > 0)
        );

        return !c.hidden || hasVisibleChildren;
    });
};