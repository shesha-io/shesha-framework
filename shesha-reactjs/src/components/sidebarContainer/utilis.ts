import { ISidebarProps } from './models';
import _ from 'lodash';

interface PanelSizes {
  sizes: number[];
  maxSizes: number[];
  minSizes?: number[];
}

function getPanelSizes(
  leftOpen: boolean,
  rightOpen: boolean,
  leftSidebarProps?: ISidebarProps,
  rightSidebarProps?: ISidebarProps,
  allowFullCollapse?: boolean,
): PanelSizes {
  if (allowFullCollapse) {
    return {
      sizes: [100],
      maxSizes: null,
      minSizes: null,
    };
  }

  if (!_.isObject(leftSidebarProps) && rightSidebarProps) {
    if (!rightOpen) {
      return {
        sizes: [99, 1],
        maxSizes: [Infinity, 30],
        minSizes: [null, 30],
      };
    }
    return {
      sizes: [75, 25],
      maxSizes: [Infinity, Infinity],
      minSizes: [500, 200],
    };
  }

  if (!leftOpen && !rightOpen) {
    return {
      sizes: [2, 96, 2],
      maxSizes: [30, Infinity, 30],
      minSizes: [30, null, 30],
    };
  }

  if (leftOpen && !rightOpen) {
    return {
      sizes: [20, 78, 2],
      maxSizes: [Infinity, Infinity, 30],
      minSizes: [200, null, 30],
    };
  }
  if (!leftOpen && rightOpen) {
    return {
      sizes: [2, 78, 20],
      maxSizes: [30, Infinity, Infinity],
      minSizes: [30, null, 200],
    };
  }

  return {
    sizes: [20, 60, 20],
    maxSizes: [Infinity, Infinity, Infinity],
    minSizes: [200, null, 200],
  };
}

export { getPanelSizes };
