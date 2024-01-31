// @import 'variables';

import { css } from 'styled-components';

export const fontSize = (size, base = 16) => `
  font-size: ${size}px; // older browsers fallback
  font-size: calc(${size / base} * 1rem);
`;

export const centerBlock = `
  display: block;
  margin-left: auto;
  margin-right: auto;
`;

export const wh = (w, h = w) => `
  width: ${w};
  height: ${h};
`;

export const flexColumn = css`
  display: flex;
  flex-direction: column;
`;

export const flexRow = css`
  display: flex;
  flex-direction: row;
`;

export const transition = css``;

// All the transitions in this app should be like this
// @mixin transition {
//   transition: $sha-transition-all;
// }

export const antdTransition = css`
  ${transition}
`;

// @mixin antdTransition {
//   transition: $sha-ant-transition;
// }

export const textHoverEffect = css``;
// // Hoveer
// @mixin textHoverEffect {
//   @include transition;

//   &:hover {
//     color: $primary-color !important;
//   }

//   cursor: pointer;
// }

export const maxHeight = css`
  height: 100%;
`;

export const bottomTop = css`
  border-top: 1px solid lightgray;
`;

export const flexCenterAligned = css`
  display: flex;
  align-items: center;
`;

export const flexCenterAlignedSpaceBetween = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const resetMargin = css`
  margin: unset;
`;
