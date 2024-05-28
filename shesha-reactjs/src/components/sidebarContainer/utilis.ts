interface SidebarProps {
    isOpen: boolean;
    // Add other properties as needed
}

function getPanelSizes(
    leftOpen: boolean,
    rightOpen: boolean,
    leftSidebarProps?: SidebarProps,
    rightSidebarProps?: SidebarProps
): { sizes: number[], minSize: any } {
    if (!leftSidebarProps && rightSidebarProps) {
        return {
            sizes: [75, 25],
            minSize: 250,
        };
    }

    if (!leftOpen && !rightOpen) {
        return {
            sizes: [2, 96, 2],
            minSize: 50,
        };
    } else if (!leftOpen && rightOpen) {
        return {
            sizes: [3, 77, 20],
            minSize: [50, 400, 250],
        };
    } else if (!rightOpen && leftOpen) {
        return {
            sizes: [20, 77, 3],
            minSize: [250, 400, 50],
        };
    } else {
        return {
            sizes: [20, 60, 20],
            minSize: [250, 400, 250],
        };
    }
}

export { getPanelSizes };