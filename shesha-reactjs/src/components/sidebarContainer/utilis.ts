import { ISidebarProps } from "./models";
import _ from "lodash";

function getPanelSizes(
    leftOpen: boolean,
    rightOpen: boolean,
    leftSidebarProps?: ISidebarProps,
    rightSidebarProps?: ISidebarProps,
    allowFullCollapse?: boolean
): number[] {
    if (allowFullCollapse) {
        return [100, 0, 0];
    }

    if (!_.isObject(leftSidebarProps) && rightSidebarProps) {
        if (!rightOpen) {
            return [99, 1];
        }
        return [75, 25];
    }

    if (!leftOpen && !rightOpen) {
        return [2, 96, 2];
    }

    if (leftOpen && !rightOpen) {
        return [20, 77, 3];
    }

    if (!leftOpen && rightOpen) {
        return [3, 77, 20];
    }

    return [20, 70, 20];
}

export { getPanelSizes };