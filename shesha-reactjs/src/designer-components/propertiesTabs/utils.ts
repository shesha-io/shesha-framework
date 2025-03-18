const evaluateString = (expression: string, data: any): any => {
    try {
        // Create a new function with 'data' as a parameter and the expression as the function body
        const func = new Function('data', expression);
        // Execute the function with the provided data
        return func(data);
    } catch (error) {
        console.error('Error evaluating expression:', expression, error);
        return null;
    }
};

const getHeaderStyles = (primaryColor) => (
    {
        "font": {
            "color": "#000",
            "size": 14,
            "weight": "500",
            "align": "left",
            "type": "Arial"
        },
        "background": {
            "type": "color",
            "color": "#fff"
        },
        "dimensions": {
            "width": "auto",
            "height": "auto",
            "minHeight": "0",
            "maxHeight": "auto",
            "minWidth": "0",
            "maxWidth": "auto"
        },
        "border": {
            "radiusType": "all",
            "borderType": "custom",
            "border": {
                "bottom": {
                    "width": "2px",
                    "style": "solid",
                    "color": primaryColor
                },
            },
            "radius": {
                "all": 0
            }
        },
        "stylingBox": "{\"paddingLeft\":\"0\",\"paddingBottom\":\"4\",\"paddingTop\":\"4\",\"paddingRight\":\"4\"}"
    }
);

export const filterDynamicComponents = (components, query, data, primaryColor) => {
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
            const filteredComponents = filterDynamicComponents(c.components, query, data, primaryColor);

            return {
                ...c,
                hidden: filteredComponents.length < 1,
                components: filteredComponents
            };
        }

        // Handle collapsiblePanel
        if (c.type === 'collapsiblePanel') {
            const contentComponents = filterDynamicComponents(c.content?.components || [], query, data, primaryColor);
            const hasVisibleChildren = contentComponents.length > 0;

            return {
                ...c,
                collapsible: c.collapsible ?? 'header',
                content: {
                    ...c.content,
                    components: contentComponents
                },
                ghost: false,
                headerStyles: getHeaderStyles(primaryColor),
                border: {
                    "hideBorder": false,
                    "radiusType": "all",
                    "borderType": "all",
                    "border": {
                        "all": {
                            "width": "1px",
                            "style": "none",
                            "color": "#d9d9d9"
                        },
                    },
                    "radius": {
                        "all": 0
                    }
                },
                "stylingBox": "{\"paddingLeft\":\"4\",\"paddingBottom\":\"4\",\"paddingTop\":\"4\",\"paddingRight\":\"4\",\"marginBottom\":\"5\"}",
                "hidden": evaluateHidden(c.hidden, directMatch, hasVisibleChildren)
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
            const filteredComponents = filterDynamicComponents(c.components, query, data, primaryColor);
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

        // Evaluate final hidden state
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