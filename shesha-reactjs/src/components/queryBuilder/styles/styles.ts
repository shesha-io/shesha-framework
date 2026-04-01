import { createStyles, sheshaStyles } from '@/styles';

import qb_compact_styles from './css/compact_styles.css';

export const useStyles = createStyles(({ css, cx, prefixCls, token }) => {
  const shaQueryBuilderBtns = "sha-query-builder-btns";
  const shaQueryBuilder = cx("sha-query-builder", css`
        ${qb_compact_styles}

        background-image: white !important;
    
        .query-builder-container {
            padding: unset !important;
    
            .query-builder {
                margin: 0 !important;
            }
    
            .ant-btn-group {
                button {
                    margin-left: ${sheshaStyles.paddingSM}px;
                }
            }
        }

        .query-builder-container.qb-has-rules,
        .query-builder-container.qb-empty {
            padding: 0 !important;
            background: transparent;
            border: 0;
            border-radius: 0;
            box-sizing: border-box;
        }

        .sha-query-builder-canvas {
            width: 100%;
            min-width: 0;
        }

        .sha-query-builder-surface {
            width: 100%;
            min-width: 0;
            min-height: 218px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 20px 10px;
            box-sizing: border-box;
            background: #f5f5f5;
            border: 1px solid #ececec;
            border-radius: 8px;
        }

        .sha-query-builder-surface.is-empty {
            min-height: 118px;
            gap: 16px;
        }

        .sha-query-builder-heading {
            margin: 0;
            font-family: Inter, Roboto, Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 22px;
            font-weight: 400;
            color: #000;
        }

        .sha-query-builder-filter {
            width: 100%;
            display: flex;
            flex-direction: column;
            flex: 1 1 auto;
            gap: 20px;
            min-width: 0;
        }

        .sha-query-builder-filter.is-empty {
            justify-content: flex-end;
            gap: 12px;
        }

        .sha-query-builder-filter-body,
        .sha-query-builder-group-children {
            display: flex;
            flex-direction: column;
            flex: 1 1 auto;
            gap: 10px;
            width: 100%;
            min-width: 0;
        }

        .sha-query-builder-empty-spacer {
            flex: 1 1 auto;
            min-height: 8px;
        }

        .sha-query-builder-filter-actions,
        .sha-query-builder-group-actions {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 10px;
            width: 100%;
            margin-top: auto;
        }

        .sha-query-builder-filter-actions.is-empty {
            justify-content: flex-start;
        }

        .sha-query-builder-filter-actions .${prefixCls}-btn,
        .sha-query-builder-group-actions .${prefixCls}-btn {
            height: 32px;
            border-radius: 8px;
            padding: 0 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-shadow: none;
        }

        .sha-query-builder-group-card {
            width: 100%;
            min-width: 0;
            min-height: 133px;
            display: flex;
            flex-direction: column;
            gap: 5px;
            padding: 10px;
            box-sizing: border-box;
            border-radius: 11px;
            border: 1px solid #7fa8dc;
            background: rgba(43, 120, 228, 0.08);
        }

        .sha-query-builder-group-card.is-drop-append {
            box-shadow: inset 0 0 0 2px ${token.colorPrimary};
        }

        .sha-query-builder-group-header {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            min-height: 32px;
        }

        .sha-query-builder-group-actions {
            gap: 8px;
        }

        .sha-query-builder-group-action-button.${prefixCls}-btn {
            width: 32px;
            min-width: 32px;
            height: 32px;
            padding: 0;
            border-radius: 6px;
        }

        .sha-query-builder-group-action-button.${prefixCls}-btn .${prefixCls}-btn-icon {
            margin-inline-end: 0;
        }

        .sha-query-builder-group-action-button.${prefixCls}-btn .anticon {
            font-size: 16px;
        }

        .sha-query-builder-item-row {
            position: relative;
            display: grid;
            grid-template-columns: 69px minmax(0, 1fr) 64px;
            align-items: stretch;
            gap: 10px;
            width: 100%;
            min-width: 0;
        }

        .sha-query-builder-item-row.is-drop-before::before,
        .sha-query-builder-item-row.is-drop-after::after {
            content: "";
            position: absolute;
            left: 69px;
            right: 0;
            height: 2px;
            background: ${token.colorPrimary};
            border-radius: 999px;
        }

        .sha-query-builder-item-row.is-drop-before::before {
            top: -5px;
        }

        .sha-query-builder-item-row.is-drop-after::after {
            bottom: -5px;
        }

        .sha-query-builder-item-prefix {
            min-width: 0;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            height: 100%;
        }

        .sha-query-builder-item-row.is-group .sha-query-builder-item-prefix {
            align-items: flex-start;
            padding-top: 6px;
            box-sizing: border-box;
        }

        .sha-query-builder-item-row.is-group {
            grid-template-columns: 69px minmax(0, 1fr);
        }

        .sha-query-builder-prefix-label {
            color: ${token.colorPrimary};
            font-size: 14px;
            line-height: 20px;
            font-weight: 500;
            white-space: nowrap;
        }

        .sha-query-builder-prefix-select {
            width: 100%;
            min-width: 0;
        }

        .sha-query-builder-prefix-select .${prefixCls}-select {
            width: 100%;
        }

        .sha-query-builder-prefix-select .${prefixCls}-select-selector {
            padding: 0 !important;
            border: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
        }

        .sha-query-builder-prefix-select .${prefixCls}-select-selection-item,
        .sha-query-builder-prefix-select .${prefixCls}-select-selection-placeholder {
            font-size: 14px;
            line-height: 20px !important;
            font-weight: 500;
            color: ${token.colorPrimary} !important;
        }

        .sha-query-builder-item-main {
            min-width: 0;
        }

        .sha-query-builder-rule-row {
            width: 100%;
            min-width: 0;
            min-height: 32px;
            display: grid;
            grid-template-columns: 183px 155px minmax(0, 1fr);
            align-items: center;
            gap: 10px;
        }

        .sha-query-builder-rule-row.has-field-func {
            grid-template-columns: minmax(0, 418px) 155px minmax(0, 418px);
        }

        .sha-query-builder-rule-row.is-deep-nested {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
        }

        .sha-query-builder-rule-row.is-deep-nested .sha-query-builder-packed-control,
        .sha-query-builder-rule-row.is-deep-nested .sha-query-builder-value-shell.is-function {
            flex: 1 1 160px;
            width: auto;
            max-width: 418px;
        }

        .sha-query-builder-rule-row.is-deep-nested .sha-query-builder-operator-slot {
            flex: 0 0 auto;
        }

        .sha-query-builder-rule-row.is-deep-nested .sha-query-builder-value-shell {
            flex: 1 1 160px;
            width: auto;
            max-width: 418px;
        }

        .sha-query-builder-item-rail {
            display: grid;
            grid-template-columns: repeat(2, 32px);
            width: 64px;
            min-width: 64px;
            height: 32px;
            background: transparent;
            border-radius: 5px;
            overflow: hidden;
        }

        .sha-query-builder-item-rail.is-group {
            height: 100%;
            min-height: 133px;
        }

        .sha-query-builder-rail-button {
            width: 32px;
            height: 32px;
            padding: 0;
            border: 0;
            background: transparent;
            color: #667085;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }

        .sha-query-builder-item-rail.is-group .sha-query-builder-rail-button {
            height: auto;
        }

        .sha-query-builder-rail-button:first-child {
            color: ${token.colorError};
        }

        .sha-query-builder-rail-button:disabled {
            opacity: 0.45;
            cursor: not-allowed;
        }

        .sha-query-builder-rail-button .anticon {
            font-size: 18px;
        }

        .sha-query-builder-packed-control,
        .sha-query-builder-operator-slot,
        .sha-query-builder-value-shell {
            box-sizing: border-box;
            min-width: 0;
        }

        .sha-query-builder-packed-control {
            width: 183px;
            min-height: 32px;
            display: grid;
            grid-template-columns: 60px 123px;
            align-items: stretch;
            border: 1px solid #d0d5dd;
            border-radius: 8px;
            background: #fff;
            box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);
            overflow: hidden;
        }

        .sha-query-builder-packed-control:not(.is-func) {
            height: 32px;
        }

        .sha-query-builder-source-slot {
            width: 60px;
            min-width: 60px;
            height: 32px;
            border-right: 1px solid #d0d5dd;
            background: #f9fafb;
            display: flex;
            align-items: stretch;
        }

        .sha-query-builder-field-slot {
            width: 123px;
            min-width: 123px;
            min-height: 32px;
            display: flex;
            align-items: stretch;
            overflow: hidden;
        }

        .sha-query-builder-source-dropdown-trigger,
        .sha-query-builder-source-trigger {
            width: 100%;
            height: 100%;
        }

        .sha-query-builder-source-trigger {
            padding: 10px 5px;
            border: 0;
            border-radius: 0;
            background: transparent;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0;
            box-shadow: none;
        }

        .sha-query-builder-source-trigger-icon,
        .sha-query-builder-source-trigger-arrow {
            width: 24px;
            height: 24px;
            flex-shrink: 0;
            aspect-ratio: 1 / 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .sha-query-builder-source-trigger-icon .anticon,
        .sha-query-builder-source-trigger-arrow.anticon {
            font-size: 20px;
        }

        .sha-query-builder-source-trigger-label {
            display: none;
        }

        .sha-query-builder-field-slot .sha-query-builder-packed-select,
        .sha-query-builder-value-editor-slot .sha-query-builder-packed-select,
        .sha-query-builder-field-slot .${prefixCls}-select,
        .sha-query-builder-value-editor-slot .${prefixCls}-select,
        .sha-query-builder-value-editor-slot .${prefixCls}-picker,
        .sha-query-builder-value-editor-slot .${prefixCls}-input-number,
        .sha-query-builder-value-editor-slot .${prefixCls}-segmented,
        .sha-query-builder-func-expression .sha-expression-editor {
            width: 100% !important;
            max-width: 100%;
            min-width: 0;
        }

        .sha-query-builder-field-slot .${prefixCls}-select-selector,
        .sha-query-builder-value-editor-slot .${prefixCls}-select-selector,
        .sha-query-builder-operator-select .${prefixCls}-select-selector {
            height: 32px !important;
            min-height: 32px !important;
            padding: 0 5px !important;
            border: 0 !important;
            border-radius: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
        }

        .sha-query-builder-field-slot .${prefixCls}-select-selection-wrap,
        .sha-query-builder-value-editor-slot .${prefixCls}-select-selection-wrap,
        .sha-query-builder-operator-select .${prefixCls}-select-selection-wrap {
            min-width: 0 !important;
        }

        .sha-query-builder-field-slot .${prefixCls}-select-selection-item,
        .sha-query-builder-field-slot .${prefixCls}-select-selection-placeholder,
        .sha-query-builder-value-editor-slot .${prefixCls}-select-selection-item,
        .sha-query-builder-value-editor-slot .${prefixCls}-select-selection-placeholder,
        .sha-query-builder-operator-select .${prefixCls}-select-selection-item,
        .sha-query-builder-operator-select .${prefixCls}-select-selection-placeholder {
            width: 100%;
            min-width: 0;
            display: flex;
            align-items: center;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            line-height: 30px !important;
        }

        .sha-query-builder-field-slot .${prefixCls}-select-selection-item > *,
        .sha-query-builder-value-editor-slot .${prefixCls}-select-selection-item > *,
        .sha-query-builder-operator-select .${prefixCls}-select-selection-item > * {
            min-width: 0;
            max-width: 100%;
        }

        .sha-query-builder-field-slot .sha-property-select-option,
        .sha-query-builder-value-editor-slot .sha-property-select-option {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            width: 100%;
            max-width: 100%;
            min-width: 0;
        }

        .sha-query-builder-field-slot .sha-property-select-option-icon,
        .sha-query-builder-value-editor-slot .sha-property-select-option-icon {
            flex: 0 0 auto;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .sha-query-builder-field-slot .sha-property-select-option-text,
        .sha-query-builder-value-editor-slot .sha-property-select-option-text {
            flex: 1 1 auto;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .sha-query-builder-operator-slot {
            width: 155px;
            min-width: 155px;
            height: 32px;
            border: 1px solid #d0d5dd;
            border-radius: 8px;
            background: #fff;
            box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);
            overflow: hidden;
        }

        .sha-query-builder-operator-select {
            width: 100%;
            height: 100%;
        }

        .sha-query-builder-operator-select .${prefixCls}-select {
            width: 100%;
            height: 100%;
        }

        .sha-query-builder-value-shell {
            width: 100%;
            max-width: 418px;
            min-width: 0;
            min-height: 32px;
            display: grid;
            grid-template-columns: 60px minmax(0, 1fr);
            align-items: stretch;
            border: 1px solid #d0d5dd;
            border-radius: 8px;
            background: #fff;
            box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);
            overflow: hidden;
        }

        .sha-query-builder-value-shell.is-function {
            grid-template-columns: 60px minmax(0, 1fr) 54px;
        }

        .sha-query-builder-value-shell--empty {
            background: rgba(255, 255, 255, 0.6);
        }

        .sha-query-builder-value-editor {
            min-width: 0;
            height: 32px;
            display: flex;
            align-items: stretch;
            overflow: hidden;
        }

        .sha-query-builder-boolean-value {
            width: 100%;
            min-width: 0;
            min-height: 32px;
            display: flex;
            align-items: center;
        }

        .sha-query-builder-value-editor.is-range {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            padding: 0 8px;
            box-sizing: border-box;
        }

        .sha-query-builder-value-editor-slot {
            min-width: 0;
            display: flex;
            align-items: stretch;
        }

        .sha-query-builder-widget-host,
        .sha-query-builder-func-expression {
            width: 100%;
            min-width: 0;
            height: 32px;
            display: flex;
            align-items: stretch;
            overflow: hidden;
        }

        .sha-query-builder-func-checkbox {
            width: 54px;
            min-width: 54px;
            height: 32px;
            border-left: 1px solid #d0d5dd;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #fff;
            overflow: hidden;
        }

        .sha-query-builder-func-checkbox .${prefixCls}-checkbox-wrapper {
            margin-inline-start: 0;
        }

        .sha-query-builder-value-editor-slot .${prefixCls}-picker,
        .sha-query-builder-value-editor-slot .${prefixCls}-input-number,
        .sha-query-builder-value-editor-slot .${prefixCls}-input,
        .sha-query-builder-value-editor-slot .${prefixCls}-select,
        .sha-query-builder-field-slot .${prefixCls}-select,
        .sha-query-builder-func-expression .sha-expression-editor {
            height: 32px;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
        }

        .sha-query-builder-value-editor-slot .${prefixCls}-picker,
        .sha-query-builder-value-editor-slot .${prefixCls}-input-number,
        .sha-query-builder-value-editor-slot .${prefixCls}-input {
            padding: 0 16px;
        }

        .sha-query-builder-value-editor-slot .${prefixCls}-picker-input > input,
        .sha-query-builder-value-editor-slot .${prefixCls}-input,
        .sha-query-builder-value-editor-slot .${prefixCls}-input-number-input {
            width: 100%;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .sha-query-builder-value-editor-slot .${prefixCls}-picker-input,
        .sha-query-builder-value-editor-slot .${prefixCls}-input-number-input-wrap {
            min-width: 0;
        }

        .sha-query-builder-value-editor-slot .${prefixCls}-picker-suffix,
        .sha-query-builder-value-editor-slot .${prefixCls}-picker-clear,
        .sha-query-builder-value-editor-slot .${prefixCls}-select-arrow,
        .sha-query-builder-value-editor-slot .${prefixCls}-select-clear {
            flex-shrink: 0;
        }

        .sha-query-builder-value-editor-slot .${prefixCls}-segmented {
            padding: 2px 8px;
            box-sizing: border-box;
        }

        .sha-query-builder-value-placeholder {
            width: 100%;
            min-width: 0;
        }

        .sha-query-builder-item-row:has(> .sha-query-builder-item-main > .sha-query-builder-rule-row .sha-expression-editor-input:focus) {
            align-items: stretch;
        }

        .sha-query-builder-item-row:has(> .sha-query-builder-item-main > .sha-query-builder-rule-row .sha-expression-editor-input:focus) > .sha-query-builder-item-main > .sha-query-builder-rule-row,
        .sha-query-builder-item-row:has(> .sha-query-builder-item-main > .sha-query-builder-rule-row .sha-expression-editor-input:focus) > .sha-query-builder-item-rail,
        .sha-query-builder-item-row:has(> .sha-query-builder-item-main > .sha-query-builder-rule-row .sha-expression-editor-input:focus) > .sha-query-builder-item-main > .sha-query-builder-rule-row .sha-query-builder-value-shell.is-function {
            min-height: 94px;
            align-items: stretch;
        }

        .sha-query-builder-item-row:has(> .sha-query-builder-item-main > .sha-query-builder-rule-row .sha-expression-editor-input:focus) > .sha-query-builder-item-main > .sha-query-builder-rule-row .sha-query-builder-func-expression,
        .sha-query-builder-item-row:has(> .sha-query-builder-item-main > .sha-query-builder-rule-row .sha-expression-editor-input:focus) > .sha-query-builder-item-main > .sha-query-builder-rule-row .sha-query-builder-source-slot,
        .sha-query-builder-item-row:has(> .sha-query-builder-item-main > .sha-query-builder-rule-row .sha-expression-editor-input:focus) > .sha-query-builder-item-main > .sha-query-builder-rule-row .sha-query-builder-func-checkbox {
            height: auto;
            min-height: 94px;
        }

        .sha-query-builder-item-row:has(> .sha-query-builder-item-main > .sha-query-builder-rule-row .sha-expression-editor-input:focus) > .sha-query-builder-item-main > .sha-query-builder-rule-row .sha-query-builder-func-expression .sha-expression-editor,
        .sha-query-builder-item-row:has(> .sha-query-builder-item-main > .sha-query-builder-rule-row .sha-expression-editor-input:focus) > .sha-query-builder-item-main > .sha-query-builder-rule-row .sha-query-builder-func-expression .sha-expression-editor-overlay,
        .sha-query-builder-item-row:has(> .sha-query-builder-item-main > .sha-query-builder-rule-row .sha-expression-editor-input:focus) > .sha-query-builder-item-main > .sha-query-builder-rule-row .sha-query-builder-func-expression .sha-expression-editor-input {
            height: 100%;
            min-height: 94px;
        }

        .sha-query-builder-item-row:has(> .sha-query-builder-item-main > .sha-query-builder-rule-row .sha-expression-editor-input:focus) > .sha-query-builder-item-main > .sha-query-builder-rule-row .sha-query-builder-func-checkbox {
            align-items: center;
            justify-content: center;
            padding-top: 0;
            box-sizing: border-box;
        }

        .query-builder-container.qb-empty .query-builder {
            margin: 0 !important;
        }

        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container {
            margin: 0 !important;
            padding-right: 0 !important;
        }

        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group {
            padding: 0 !important;
        }

        .query-builder .sha-query-builder-empty-state-message {
            display: block;
            margin: 0;
            font-size: 14px;
            line-height: 22px;
            font-weight: 400;
            color: #585858;
            width: 239.79px;
            font-family: Inter, Roboto, Helvetica, Arial, sans-serif;
        }

        .query-builder .group--footer:has(> .sha-query-builder-empty-state) {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }

        .query-builder .group--footer > .sha-query-builder-empty-state {
            margin: 0;
        }

        .query-builder .group--footer > .sha-query-builder-empty-state--root {
            width: 100%;
        }

        .query-builder .sha-query-builder-empty-state-content {
            width: 100%;
            max-width: 100%;
            min-height: 68px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            gap: 10px;
            padding: 0;
            background: transparent;
            border-radius: 0;
        }

        .query-builder .sha-query-builder-empty-state-actions {
            display: inline-flex;
            justify-content: flex-start;
            align-items: flex-start;
            gap: 12px;
            flex: 0 0 auto;
            padding-left: 0;
            width: 100%;
            box-sizing: border-box;
        }

        .query-builder .group--footer > .sha-query-builder-empty-state + .group--actions,
        .query-builder .group--footer > .sha-query-builder-empty-state + .group--actions.group--actions--br,
        .query-builder .group--footer > .sha-query-builder-empty-state + .group--actions.group--actions--tr {
            margin: 0 !important;
            width: auto !important;
            flex: 0 0 auto !important;
            justify-content: flex-start !important;
        }

        .query-builder .group--footer > .sha-query-builder-empty-state--root + .group--actions,
        .query-builder .group--footer > .sha-query-builder-empty-state--root + .group--actions.group--actions--br,
        .query-builder .group--footer > .sha-query-builder-empty-state--root + .group--actions.group--actions--tr {
            display: none !important;
        }

        .query-builder .group--footer > .sha-query-builder-empty-state + .group--actions .ant-btn-group {
            display: inline-flex !important;
            justify-content: flex-start !important;
            align-items: center !important;
            gap: 10px;
        }

        .query-builder .sha-query-builder-group-footer-logic {
            display: inline-flex;
            align-items: center;
            margin: 0;
            font-size: 14px;
            line-height: 1.43;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.88);
            white-space: nowrap;
        }

        .query-builder-container > .qb-logic-heading.sha-query-builder-group-footer-logic {
            display: inline-flex;
            align-items: center;
            margin: 0 0 12px;
            font-family: Inter, Roboto, Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 22px;
            font-weight: 400;
            color: #000;
            white-space: nowrap;
        }

        .query-builder .group--footer > .sha-query-builder-group-footer-logic {
            flex: 0 0 auto;
            align-self: center;
        }

        .query-builder .group--footer > .sha-query-builder-group-footer-logic ~ .group--actions,
        .query-builder .group--footer > .sha-query-builder-group-footer-logic ~ .group--actions.group--actions--br,
        .query-builder .group--footer > .sha-query-builder-group-footer-logic ~ .group--actions.group--actions--tr {
            margin-left: auto !important;
            width: auto !important;
            flex: 1 1 auto !important;
            justify-content: flex-end !important;
        }
    
        .${shaQueryBuilderBtns} {
            display: flex;
            justify-content: flex-end;
    
            button {
                margin-left: ${sheshaStyles.paddingLG}px;
            }
        }

        .query-builder > .group-or-rule-container > .group,
        .query-builder .group {
            background: transparent !important;
            border: 0 !important;
            border-radius: 0;
        }

        .query-builder .group--header:not(.no--children):not(.hide--conjs)::before,
        .query-builder .group--children > .group-or-rule-container > .group-or-rule::before,
        .query-builder .group--children > .group-or-rule-container > .group-or-rule::after {
            display: none !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group {
            display: flex;
            width: 100%;
            min-width: 0;
            min-height: 133px;
            padding: 10px;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            background: rgba(43, 120, 228, 0.30) !important;
            border: 1px solid #7fa8dc !important;
            border-radius: 11px;
            position: relative;
            box-sizing: border-box;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--header {
            margin: 0 !important;
            padding: 0 !important;
            min-height: 0 !important;
            display: none !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--children {
            width: 100%;
            margin: 28px 0 0;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer {
            margin: 0;
            min-height: 0;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .sha-query-builder-group-footer-logic {
            position: absolute;
            top: 8px;
            left: 8px;
            height: 24px;
            display: inline-flex;
            align-items: center;
            margin: 0 !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--header.no--children + .group--children.one--child {
            display: none;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .sha-query-builder-empty-state-message {
            margin-bottom: 8px;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions {
            position: absolute !important;
            top: 8px !important;
            right: 38px !important;
            width: auto !important;
            margin: 0 !important;
            justify-content: flex-start !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions .ant-btn-group {
            gap: 6px !important;
            height: 24px !important;
            display: inline-flex !important;
            align-items: center !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions .ant-btn {
            width: 24px !important;
            min-width: 24px !important;
            height: 24px !important;
            padding: 0 !important;
            border-radius: 6px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 0 !important;
            line-height: 1 !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions .ant-btn .ant-btn-icon {
            margin: 0 !important;
            font-size: 12px !important;
            line-height: 1 !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions .ant-btn > span:not(.ant-btn-icon) {
            display: none !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions .action--ADD-RULE.ant-btn,
        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions .action--ADD-GROUP.ant-btn {
            background: #fff !important;
            border: 1px solid #d0d5dd !important;
            color: ${token.colorPrimary} !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions .action--DELETE.ant-btn {
            background: #fff !important;
            border: 1px solid #ffd1cc !important;
            color: ${token.colorError} !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .sha-query-builder-group-extra-actions {
            position: absolute !important;
            top: 8px !important;
            right: 8px !important;
            width: 24px;
            height: 24px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .sha-query-builder-group-extra-action {
            width: 24px;
            min-width: 24px;
            height: 24px;
            border: 1px solid #d0d5dd;
            border-radius: 6px;
            background: #fff;
            color: #667085;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            margin: 0 !important;
            position: relative !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
            flex-shrink: 0;
            cursor: grab;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .sha-query-builder-group-extra-action .anticon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            font-size: 12px;
        }
    
        .rule--value {
            .rule--widget {
                &.rule--widget--REFLISTDROPDOWN {
                    .${prefixCls}-select {
                        min-width: 150px;
                    }
                }
            }
        }

        .query-builder .rule--field-wrapper {
            min-width: 0 !important;
            box-sizing: border-box;
            overflow: hidden;
        }

        .query-builder > .group-or-rule-container > .group > .group--header {
            margin: 0 0 20px;
            padding: 0;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
            min-height: 32px;
        }

        .query-builder > .group-or-rule-container > .group > .group--header::before {
            content: "Show all...";
            display: block;
            width: 100%;
            font-size: 14px;
            line-height: 1.43;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.88);
            margin-bottom: 12px;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--header::before {
            display: none;
        }

        .query-builder > .group-or-rule-container > .group > .group--header:not(.no--children) .group--conjunctions .ant-btn-group {
            display: inline-flex;
            gap: 6px;
        }

        .query-builder > .group-or-rule-container > .group > .group--header .group--conjunctions .group--drag-handler {
            width: 24px;
            min-width: 24px;
            height: 24px;
            border: 1px solid #d0d5dd;
            border-radius: 6px;
            background: #fff;
            color: #667085;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            margin: 0 !important;
            position: relative !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
            flex-shrink: 0;
        }

        .query-builder > .group-or-rule-container > .group > .group--header .group--conjunctions .group--drag-handler .anticon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            font-size: 12px;
        }

        .query-builder > .group-or-rule-container > .group > .group--header:not(.no--children) .group--conjunctions .sha-query-builder-conjunction-select {
            display: inline-flex;
            align-items: center;
        }

        .query-builder > .group-or-rule-container > .group > .group--header:not(.no--children) .group--conjunctions .sha-query-builder-conjunction-select .${prefixCls}-select {
            width: 84px;
        }

        .query-builder > .group-or-rule-container > .group > .group--header:not(.no--children) .group--conjunctions .sha-query-builder-conjunction-select .${prefixCls}-select-selector {
            min-height: 24px;
            border: 1px solid #c7ced8 !important;
            border-radius: 8px !important;
            box-shadow: none !important;
            padding: 0 8px !important;
        }

        .query-builder > .group-or-rule-container > .group > .group--header:not(.no--children) .group--conjunctions .sha-query-builder-conjunction-select .${prefixCls}-select-selection-item {
            line-height: 22px !important;
            font-weight: 500;
            color: ${token.colorPrimary};
        }

        .query-builder > .group-or-rule-container > .group > .group--header:not(.no--children) .group--conjunctions::before {
            content: none;
        }

        .query-builder .group--header:not(.no--children) + .group--children {
            position: relative;
            padding-left: 0 !important;
        }

        .query-builder > .group-or-rule-container > .group > .group--children {
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .query-builder > .group-or-rule-container > .group > .group--children > .group-or-rule-container,
        .query-builder .group-or-rule-container {
            margin: 0 !important;
            padding: 0 !important;
        }

        .query-builder .rule {
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            background: transparent !important;
        }

        .query-builder .group--children {
            gap: 0 !important;
        }

        .query-builder .group--header:not(.no--children) + .group--children::before {
            content: none;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation {
            position: relative;
            display: flex;
            width: 100%;
            min-width: 0;
            padding: 0;
            align-items: flex-start;
            gap: 10px;
            flex-shrink: 0;
            box-sizing: border-box;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .sha-query-builder-item-prefix {
            width: var(--qb-relation-width);
            min-width: var(--qb-relation-width);
            flex: 0 0 var(--qb-relation-width);
            min-height: 28px;
            padding-top: 2px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .sha-query-builder-item-prefix--where .sha-query-builder-item-prefix-label {
            color: ${token.colorPrimary};
            font-size: 14px;
            font-weight: 500;
            line-height: 20px;
            white-space: nowrap;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .sha-query-builder-item-prefix--relation .sha-query-builder-item-relation {
            width: 100%;
            display: inline-flex;
            align-items: center;
            pointer-events: auto;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation > .group-or-rule-container {
            flex: 1 1 auto;
            min-width: 0;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation--has-relation .sha-query-builder-item-relation .${prefixCls}-select {
            width: 100%;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation--has-relation .sha-query-builder-item-relation .${prefixCls}-select-selector {
            min-height: 24px;
            border: 1px solid #c7ced8 !important;
            border-radius: 8px !important;
            box-shadow: none !important;
            padding: 0 6px !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation--has-relation .sha-query-builder-item-relation .${prefixCls}-select-selection-item {
            line-height: 22px !important;
            font-size: 12px;
            font-weight: 500;
            color: ${token.colorPrimary};
        }

        .query-builder {
            --qb-relation-width: 64px;
            --qb-relation-gap: 8px;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation--has-relation .sha-query-builder-item-relation .${prefixCls}-select {
            width: 100%;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation--has-relation .sha-query-builder-item-relation .${prefixCls}-select-selector {
            min-height: 28px;
            padding: 0 8px !important;
        }

        .query-builder .group--children > .sha-query-builder-item-with-relation--has-relation .sha-query-builder-item-relation .${prefixCls}-select-selection-item {
            line-height: 26px !important;
            font-size: 13px;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .group--actions,
        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .group--actions.group--actions--br,
        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .group--actions.group--actions--tr {
            margin: 0 !important;
            padding-left: calc(var(--qb-relation-width) + 10px) !important;
            width: 100% !important;
            box-sizing: border-box !important;
            justify-content: flex-end !important;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .group--actions .ant-btn-group {
            display: inline-flex;
            gap: 10px;
            align-items: center;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .group--actions .ant-btn-group .ant-btn + .ant-btn {
            margin-left: 0;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .action--ADD-RULE.ant-btn,
        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .action--ADD-GROUP.ant-btn {
            height: 32px;
            min-width: 0;
            border-radius: 4px;
            box-shadow: none;
            padding: 0 16px;
            font-size: 14px;
            font-weight: 500;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .action--ADD-GROUP.ant-btn {
            border-color: ${token.colorPrimary};
            color: ${token.colorPrimary};
            background: #fff;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .action--ADD-GROUP.ant-btn:hover,
        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .action--ADD-GROUP.ant-btn:focus-visible {
            border-color: ${token.colorPrimaryHover};
            color: ${token.colorPrimaryHover};
            background: #fff;
        }

        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .action--ADD-RULE.ant-btn .anticon,
        .query-builder-container.qb-has-rules .query-builder > .group-or-rule-container > .group > .group--footer .action--ADD-GROUP.ant-btn .anticon {
            font-size: 16px;
            margin-right: 8px;
        }

        .query-builder .group .group--footer .group--actions,
        .query-builder .group .group--footer .group--actions.group--actions--br,
        .query-builder .group .group--footer .group--actions.group--actions--tr {
            margin: 0 !important;
            width: 100% !important;
            justify-content: flex-end !important;
        }

        .query-builder .group .group--footer .group--actions .ant-btn-group {
            display: inline-flex;
            gap: 12px;
            align-items: center;
        }

        .query-builder .group .group--footer .group--actions .ant-btn-group .ant-btn + .ant-btn {
            margin-left: 0;
        }

        .query-builder .group .group--footer .action--ADD-RULE.ant-btn,
        .query-builder .group .group--footer .action--ADD-GROUP.ant-btn {
            height: 36px;
            min-width: 160px;
            border-radius: 10px;
            box-shadow: none;
            padding: 0 16px;
            font-size: 14px;
            font-weight: 500;
        }

        .query-builder .group .group--footer .action--ADD-GROUP.ant-btn {
            border-color: ${token.colorPrimary};
            color: ${token.colorPrimary};
            background: #fff;
        }

        .query-builder .group .group--footer .action--ADD-GROUP.ant-btn:hover,
        .query-builder .group .group--footer .action--ADD-GROUP.ant-btn:focus-visible {
            border-color: ${token.colorPrimaryHover};
            color: ${token.colorPrimaryHover};
            background: #fff;
        }

        .query-builder .group .group--footer .action--ADD-RULE.ant-btn .anticon,
        .query-builder .group .group--footer .action--ADD-GROUP.ant-btn .anticon {
            font-size: 16px;
            margin-right: 8px;
        }

        .query-builder > .group-or-rule-container > .group > .group--footer {
            margin-top: 12px;
        }

        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--header,
        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--children {
            display: none !important;
        }

        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--header,
        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--children {
            display: none !important;
        }

        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer {
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }

        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer {
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }

        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer .group--actions,
        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer .group--actions.group--actions--br,
        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer .group--actions.group--actions--tr {
            margin: 0 !important;
            width: 100% !important;
            justify-content: flex-start !important;
        }

        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions,
        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions.group--actions--br,
        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer .group--actions.group--actions--tr {
            margin: 0 !important;
            width: 100% !important;
            justify-content: flex-start !important;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children {
            display: none;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child {
            display: none;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer {
            margin: 0;
            padding: 0;
            background: transparent;
            border: 0;
            border-radius: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .group--actions,
        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .group--actions.group--actions--br,
        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .group--actions.group--actions--tr {
            margin: 0 !important;
            width: 100% !important;
            justify-content: flex-start !important;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .group--actions .ant-btn-group {
            display: inline-flex;
            gap: 12px;
            align-items: center;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .group--actions .ant-btn-group .ant-btn + .ant-btn {
            margin-left: 0;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-RULE.ant-btn,
        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-GROUP.ant-btn {
            height: 36px;
            min-width: 160px;
            border-radius: 10px;
            box-shadow: none;
            padding: 0 16px;
            font-size: 14px;
            font-weight: 500;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-GROUP.ant-btn {
            border-color: ${token.colorPrimary};
            color: ${token.colorPrimary};
            background: #fff;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-GROUP.ant-btn:hover,
        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-GROUP.ant-btn:focus-visible {
            border-color: ${token.colorPrimaryHover};
            color: ${token.colorPrimaryHover};
            background: #fff;
        }

        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-RULE.ant-btn .anticon,
        .query-builder > .group-or-rule-container > .group > .group--header.no--children + .group--children.one--child + .group--footer .action--ADD-GROUP.ant-btn .anticon {
            font-size: 16px;
            margin-right: 8px;
        }

        .query-builder.qb-lite:not(.qb-dragging) .rule .rule--fieldsrc,
        .query-builder.qb-lite:not(.qb-dragging) .rule .widget--valuesrc,
        .query-builder.qb-lite:not(.qb-dragging) .rule .rule--header,
        .query-builder.qb-lite:not(.qb-dragging) .rule .rule--drag-handler {
            opacity: 1 !important;
            visibility: visible !important;
        }

        .query-builder.qb-lite:not(.qb-dragging) .group .group--drag-handler,
        .query-builder.qb-lite:not(.qb-dragging) .group .group--actions {
            opacity: 1 !important;
            visibility: visible !important;
        }

        .query-builder.qb-lite .rule .rule--drag-handler,
        .query-builder.qb-lite .group .group--drag-handler {
            opacity: 1 !important;
            visibility: visible !important;
        }

        .sha-query-builder-source-trigger {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            cursor: pointer;
            box-sizing: border-box;
            transition: background-color 0.15s ease, color 0.15s ease;
            border: 0;
            outline: none;
            box-shadow: none;
            border-radius: 0;
            background: transparent;
            color: rgba(0, 0, 0, 0.45);
            appearance: none;
            -webkit-appearance: none;
        }

        .sha-query-builder-source-trigger:hover,
        .sha-query-builder-source-trigger:focus-visible {
            color: #1677ff;
            outline: none;
            box-shadow: none;
            border-color: transparent;
        }

        .sha-query-builder-source-trigger:disabled {
            cursor: not-allowed;
            opacity: 0.55;
        }

        .sha-query-builder-source-dropdown-trigger {
            display: inline-flex;
            min-width: 0;
            pointer-events: auto !important;
        }

        .query-builder .widget--valuesrc,
        .query-builder .widget--valuesrc * {
            pointer-events: auto !important;
        }

        .sha-query-builder-source-trigger-icon,
        .sha-query-builder-source-trigger-arrow {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            flex-shrink: 0;
            aspect-ratio: 1 / 1;
            line-height: 1;
            font-size: 11px;
        }

        .sha-query-builder-source-trigger-label {
            flex: 1 1 0;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 13px;
            line-height: 1;
        }

        .sha-query-builder-packed-select {
            display: flex;
            align-items: stretch;
            width: 100%;
            height: 100%;
            min-width: 0;
            flex: 1 1 auto;
        }

        .query-builder .rule--fieldsrc,
        .query-builder .widget--valuesrc {
            margin: 0;
            flex: 0 0 auto;
        }

        .query-builder .rule--fieldsrc {
            flex: 0 0 calc(100% * 0.32787);
            width: calc(100% * 0.32787);
            max-width: calc(100% * 0.32787);
            min-width: 0;
        }

        .query-builder .widget--valuesrc {
            flex: 0 0 auto;
            width: auto;
            max-width: none;
            min-width: 0;
        }

        .query-builder .rule--field .sha-query-builder-packed-select {
            display: flex;
            align-items: stretch;
            width: 100%;
            height: 100%;
            min-width: 0;
            flex: 1 1 auto;
        }

        /* Strip borders from the PropertySelect (Ant Design Select) inside the field cell */
        .query-builder .rule--field .sha-query-builder-packed-select .${prefixCls}-select {
            flex: 1 1 auto !important;
            width: 100% !important;
            height: 100% !important;
            min-width: 0;
            border: 0 !important;
            outline: none !important;
            box-shadow: none !important;
            background: transparent !important;
            border-radius: 0 !important;
        }

        .query-builder .rule--field .sha-query-builder-packed-select .${prefixCls}-select-selector {
            height: 100% !important;
            min-height: 30px !important;
            border: 0 !important;
            border-color: transparent !important;
            outline: none !important;
            box-shadow: none !important;
            background: transparent !important;
            display: flex !important;
            align-items: center !important;
            border-radius: 0 !important;
        }

        .query-builder .rule--field .sha-query-builder-packed-select .${prefixCls}-select-outlined:not(.${prefixCls}-select-customize-input) .${prefixCls}-select-selector,
        .query-builder .rule--field .sha-query-builder-packed-select .${prefixCls}-select-borderless .${prefixCls}-select-selector {
            border: 0 !important;
            border-color: transparent !important;
            outline: none !important;
            box-shadow: none !important;
            background: transparent !important;
            border-radius: 0 !important;
        }

        .query-builder .rule--field .sha-query-builder-packed-select .${prefixCls}-select:hover .${prefixCls}-select-selector,
        .query-builder .rule--field .sha-query-builder-packed-select .${prefixCls}-select-active .${prefixCls}-select-selector,
        .query-builder .rule--field .sha-query-builder-packed-select .${prefixCls}-select-focused .${prefixCls}-select-selector,
        .query-builder .rule--field .sha-query-builder-packed-select .${prefixCls}-select-open .${prefixCls}-select-selector {
            border: 0 !important;
            border-color: transparent !important;
            outline: none !important;
            box-shadow: none !important;
            background: transparent !important;
            border-radius: 0 !important;
        }

        .query-builder .rule--field .sha-query-builder-packed-select .${prefixCls}-select-focused .${prefixCls}-select-selector,
        .query-builder .rule--field .sha-query-builder-packed-select .${prefixCls}-select:focus .${prefixCls}-select-selector,
        .query-builder .rule--field .sha-query-builder-packed-select .${prefixCls}-select-open .${prefixCls}-select-selector {
            border: 0 !important;
            border-color: transparent !important;
            box-shadow: none !important;
            outline: none !important;
            border-radius: 0 !important;
        }

        /* Source triggers inside packed rule cells — shared base */

        .query-builder .rule--fieldsrc .sha-query-builder-source-dropdown-trigger,
        .query-builder .widget--valuesrc .sha-query-builder-source-dropdown-trigger {
            display: flex;
            align-items: stretch;
            height: 100%;
        }

        .query-builder .rule--fieldsrc .sha-query-builder-source-trigger,
        .query-builder .widget--valuesrc .sha-query-builder-source-trigger {
            display: flex;
            width: 60px;
            height: 100%;
            height: 32px;
            min-height: 30px;
            padding: 10px 5px;
            justify-content: center;
            align-items: center;
            flex-shrink: 0;
            min-width: 0;
            overflow: hidden;
            border-radius: 0;
            border: 0;
            border-right: 1px solid #d0d5dd;
            background: #f8fafc;
            color: #344054;
            gap: 4px;
        }

        .query-builder .rule--fieldsrc .sha-query-builder-source-trigger {
            border-right: 0;
            box-shadow: none;
            outline: none;
            border-radius: 0;
        }

        .query-builder .rule--fieldsrc .sha-query-builder-source-trigger .sha-query-builder-source-trigger-icon,
        .query-builder .widget--valuesrc .sha-query-builder-source-trigger .sha-query-builder-source-trigger-icon {
            color: #1d2939;
            font-size: 14px;
        }

        .query-builder .rule--fieldsrc .sha-query-builder-source-trigger .sha-query-builder-source-trigger-arrow,
        .query-builder .widget--valuesrc .sha-query-builder-source-trigger .sha-query-builder-source-trigger-arrow {
            color: #98a2b3;
            font-size: 9px;
        }

        .query-builder .rule--before-widget:empty {
            display: none;
        }

        .query-builder .rule--before-widget:has(.sha-query-builder-empty-rule-placeholders) {
            flex: 0 0 calc((100% - 20px) * 0.75502 + 10px);
            width: calc((100% - 20px) * 0.75502 + 10px);
            max-width: calc((100% - 20px) * 0.75502 + 10px);
            min-width: 0;
            box-sizing: border-box;
            overflow: hidden;
        }

        .query-builder .rule--before-widget .sha-query-builder-empty-rule-placeholders {
            display: flex;
            align-items: stretch;
            gap: 10px;
            width: 100%;
            min-width: 0;
        }

        .query-builder .sha-query-builder-empty-operator {
            flex: 0 0 calc((100% - 10px) * 0.20750 / 0.75502);
            min-width: 0;
            width: calc((100% - 10px) * 0.20750 / 0.75502);
            max-width: calc((100% - 10px) * 0.20750 / 0.75502);
            min-height: 32px;
            padding: 0 12px;
            border: 1px solid #d0d5dd;
            border-radius: 8px;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.05);
            box-sizing: border-box;
            overflow: hidden;
        }

        .query-builder .sha-query-builder-empty-operator-text,
        .query-builder .sha-query-builder-empty-value-text {
            color: #98a2b3;
            line-height: 32px;
            font-size: 14px;
        }

        .query-builder .sha-query-builder-empty-value {
            flex: 0 0 calc((100% - 10px) * 0.54752 / 0.75502);
            min-width: 0;
            width: calc((100% - 10px) * 0.54752 / 0.75502);
            max-width: calc((100% - 10px) * 0.54752 / 0.75502);
            min-height: 32px;
            border: 1px solid #d0d5dd;
            border-radius: 8px;
            background: #fff;
            overflow: hidden;
            display: flex;
            align-items: stretch;
            box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.05);
            box-sizing: border-box;
        }

        .query-builder .sha-query-builder-empty-value-type {
            width: 40px;
            min-width: 40px;
            box-sizing: border-box;
            padding: 0 4px;
            border-right: 1px solid #d0d5dd;
            background: #f8fafc;
            color: #1d2939;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2px;
        }

        .query-builder .sha-query-builder-empty-value-type-icon {
            font-size: 12px;
        }

        .query-builder .sha-query-builder-empty-value-text {
            flex: 1 1 auto;
            min-width: 0;
            padding: 0 12px;
            display: flex;
            align-items: center;
        }

        .query-builder .sha-query-builder-empty-caret {
            color: #98a2b3;
            font-size: 9px;
        }

        .query-builder .rule--func {
            display: none;
        }

        .query-builder .rule--func--bracket-before,
        .query-builder .rule--func--bracket-after,
        .query-builder .rule--func--arg-sep {
            display: none;
        }


        .sha-query-builder-source-option .${prefixCls}-dropdown-menu-title-content {
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .sha-query-builder-ignore-unassigned {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0;
            width: 100%;
            height: 100%;
            padding: 0 3px;
            box-sizing: border-box;
        }

        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox-wrapper,
        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox {
            flex: 0 0 24px;
            width: 24px;
            height: 24px;
            margin: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox-inner {
            border-radius: 4px;
        }

        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox-checked .${prefixCls}-checkbox-inner {
            background-color: #52c41a;
            border-color: #52c41a;
        }

        .sha-query-builder-ignore-unassigned-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            flex-shrink: 0;
            aspect-ratio: 1 / 1;
            color: #52c41a;
            font-size: 11px;
        }

        .sha-bool-btn-group {
            display: inline-flex;
            height: 32px;
            min-height: 32px;
            max-height: 32px;
            align-items: stretch;
            border: 1px solid #d0d5dd;
            border-radius: 8px;
            box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.05);
            overflow: hidden;
            box-sizing: border-box;
        }

        .sha-query-builder-boolean-value .sha-bool-btn-group {
            flex: 0 0 auto;
        }

        .sha-bool-btn-group.is-disabled {
            opacity: 0.6;
            pointer-events: none;
        }

        .sha-bool-btn-group__btn {
            min-width: 40px;
            height: 100%;
            min-height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px 16px;
            font-size: 14px;
            font-weight: 400;
            line-height: 20px;
            font-family: Inter, sans-serif;
            white-space: nowrap;
            cursor: pointer;
            border: none;
            box-sizing: border-box;
            background: #ffffff;
            color: #344054;
            border-right: 1px solid #d0d5dd;
        }

        .sha-bool-btn-group__btn:last-child {
            border-right: none;
        }

        .sha-bool-btn-group__btn.is-active {
            background: #2b78e4;
            color: #ffffff;
        }

        .query-builder .action--ADD-RULE.ant-btn:not(.ant-btn-icon-only),
        .query-builder .action--ADD-GROUP.ant-btn:not(.ant-btn-icon-only) {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
        }

        .query-builder .action--ADD-RULE.ant-btn:not(.ant-btn-icon-only) .ant-btn-icon,
        .query-builder .action--ADD-GROUP.ant-btn:not(.ant-btn-icon-only) .ant-btn-icon {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            line-height: 1 !important;
            margin: 0 !important;
        }

        .query-builder .action--ADD-RULE.ant-btn:not(.ant-btn-icon-only) .ant-btn-icon .anticon,
        .query-builder .action--ADD-GROUP.ant-btn:not(.ant-btn-icon-only) .ant-btn-icon .anticon {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            line-height: 1 !important;
            margin: 0 !important;
        }

        .query-builder .rule.group-or-rule {
            display: flex;
            align-items: center;
            width: 100%;
            min-width: 0;
        }

        .query-builder .rule.group-or-rule > .sha-query-builder-rule-drag-placeholder.rule--drag-handler {
            order: 3;
            pointer-events: none;
            cursor: default;
        }

        .query-builder .rule.group-or-rule > .rule--drag-handler {
            order: 3;
            margin: 0 !important;
            padding: 0 6px !important;
            border: 0 !important;
            border-left: 1px solid #f4f5f6 !important;
            align-self: center !important;
            flex: 0 0 auto;
        }

        .query-builder .rule.group-or-rule > .rule--body--wrapper {
            flex: 1 1 auto;
            min-width: 0;
            margin: 0 !important;
            padding: 0 8px !important;
            border-left: 0 !important;
            border-right: 0 !important;
        }

        .query-builder .rule.group-or-rule > .rule--header {
            order: 2;
            margin: 0 !important;
            padding: 0 6px !important;
            border-left: 1px solid #eaecf0 !important;
            border-right: 0 !important;
            display: inline-flex;
            align-items: center;
            align-self: center;
            flex: 0 0 auto;
        }

        .query-builder .rule.group-or-rule > .rule--header::before,
        .query-builder .rule.group-or-rule > .rule--header::after {
            content: none !important;
            display: none !important;
        }

        .query-builder .rule.group-or-rule > .rule--header .ant-btn-group {
            display: inline-flex;
            align-items: center;
            margin: 0 !important;
        }

        .query-builder .rule.group-or-rule > .rule--header .ant-btn-group > .ant-btn {
            margin-left: 0 !important;
        }

        .query-builder .rule.group-or-rule > .rule--header .action--DELETE.ant-btn {
            width: 16px !important;
            min-width: 16px !important;
            height: 16px !important;
            padding: 0 !important;
        }

        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer:has(> .sha-query-builder-empty-state--root) {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
        }

        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer:has(> .sha-query-builder-empty-state--root) {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
        }

        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer:has(> .sha-query-builder-empty-state--root) > .group--actions,
        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer:has(> .sha-query-builder-empty-state--root) > .group--actions.group--actions--br,
        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer:has(> .sha-query-builder-empty-state--root) > .group--actions.group--actions--tr {
            margin: 0 !important;
            width: auto !important;
            flex: 0 0 auto !important;
            justify-content: flex-start !important;
        }

        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer:has(> .sha-query-builder-empty-state--root) > .group--actions,
        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer:has(> .sha-query-builder-empty-state--root) > .group--actions.group--actions--br,
        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer:has(> .sha-query-builder-empty-state--root) > .group--actions.group--actions--tr {
            margin: 0 !important;
            width: auto !important;
            flex: 0 0 auto !important;
            justify-content: flex-start !important;
        }

        .query-builder-container.qb-empty .query-builder > .group-or-rule-container > .group > .group--footer:has(> .sha-query-builder-empty-state--root) > .group--actions .ant-btn-group {
            display: inline-flex !important;
            justify-content: flex-start !important;
            align-items: center !important;
            gap: 12px;
        }

        .query-builder-container.qb-empty .query-builder > .sha-query-builder-item-with-relation > .group-or-rule-container.group-container > .group > .group--footer:has(> .sha-query-builder-empty-state--root) > .group--actions .ant-btn-group {
            display: inline-flex !important;
            justify-content: flex-start !important;
            align-items: center !important;
            gap: 12px;
        }

        /* ── Rule cells: shared "pill" border ─────────────────────────── */

        .query-builder .rule--field,
        .query-builder .rule--operator,
        .query-builder .rule--value {
            display: flex;
            align-items: stretch;
            gap: 0;
            height: 32px;
            min-height: 32px;
            max-height: 32px;
            min-width: 0;
            max-width: 100%;
            box-sizing: border-box;
            border: 1px solid #d0d5dd;
            border-radius: 6px;
            overflow: hidden;
            background: #fff;
        }

        .query-builder .rule--field-wrapper {
            width: 183px;
            min-width: 183px;
            max-width: 183px;
            flex: 0 0 183px;
        }

        .query-builder .rule--field {
            border: none;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            width: 123px;
            min-width: 123px;
            max-width: 123px;
            height: 32px;
            flex: 0 0 123px;
        }

        .query-builder .rule--operator {
            width: 155px;
            min-width: 155px;
            max-width: 155px;
            height: 32px;
            flex: 0 0 155px;
        }

        .query-builder .rule--value {
            width: 418px;
            min-width: 418px;
            max-width: 418px;
            flex: 0 0 418px;
        }

        .query-builder .rule--field > *,
        .query-builder .rule--operator > *,
        .query-builder .rule--value > * {
            min-width: 0;
            max-width: 100%;
            box-sizing: border-box;
        }

        /* Strip individual borders from children — the container owns the border */

        .query-builder .rule--field .${prefixCls}-select,
        .query-builder .rule--operator .${prefixCls}-select,
        .query-builder .rule--value .${prefixCls}-select {
            width: 100% !important;
            height: 100% !important;
            min-width: 0;
            border: 0 !important;
            box-shadow: none !important;
        }

        .query-builder .rule--field .${prefixCls}-select-selector,
        .query-builder .rule--operator .${prefixCls}-select-selector,
        .query-builder .rule--value .${prefixCls}-select-selector {
            height: 100% !important;
            min-height: 30px !important;
            border: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
            display: flex !important;
            align-items: center !important;
        }

        .query-builder .rule--operator .${prefixCls}-select-selector {
            padding: 10px 5px !important;
        }

        .query-builder .rule--field .${prefixCls}-select-selection-wrap,
        .query-builder .rule--operator .${prefixCls}-select-selection-wrap,
        .query-builder .rule--value .${prefixCls}-select-selection-wrap {
            align-items: center !important;
        }

        .query-builder .rule--field .${prefixCls}-select-single .${prefixCls}-select-selection-item,
        .query-builder .rule--field .${prefixCls}-select-single .${prefixCls}-select-selection-placeholder,
        .query-builder .rule--operator .${prefixCls}-select-single .${prefixCls}-select-selection-item,
        .query-builder .rule--operator .${prefixCls}-select-single .${prefixCls}-select-selection-placeholder,
        .query-builder .rule--value .${prefixCls}-select-single .${prefixCls}-select-selection-item,
        .query-builder .rule--value .${prefixCls}-select-single .${prefixCls}-select-selection-placeholder {
            display: flex !important;
            align-items: center !important;
            line-height: 30px !important;
            font-size: 14px !important;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .query-builder .rule--operator .${prefixCls}-select-single .${prefixCls}-select-selection-item,
        .query-builder .rule--operator .${prefixCls}-select-single .${prefixCls}-select-selection-placeholder {
            width: 100% !important;
            height: 32px !important;
        }

        .query-builder .rule--field .${prefixCls}-select-single .${prefixCls}-select-selection-search,
        .query-builder .rule--operator .${prefixCls}-select-single .${prefixCls}-select-selection-search,
        .query-builder .rule--value .${prefixCls}-select-single .${prefixCls}-select-selection-search {
            display: flex;
            align-items: center;
            height: 100%;
        }

        .query-builder .rule--field .${prefixCls}-select-single .${prefixCls}-select-selection-search-input,
        .query-builder .rule--operator .${prefixCls}-select-single .${prefixCls}-select-selection-search-input,
        .query-builder .rule--value .${prefixCls}-select-single .${prefixCls}-select-selection-search-input {
            height: 100% !important;
        }

        .query-builder .rule--value .${prefixCls}-input {
            width: 100% !important;
            height: 100% !important;
            min-height: 30px !important;
            line-height: 30px !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            padding-inline: 16px !important;
            font-size: 14px !important;
            border: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
            display: block;
        }

        .query-builder .rule--value .${prefixCls}-input-number {
            width: 100% !important;
            height: 100% !important;
            min-height: 30px !important;
            border: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
        }

        .query-builder .rule--value .${prefixCls}-input-number-input-wrap {
            height: 100% !important;
            display: flex;
            align-items: center;
        }

        .query-builder .rule--value .${prefixCls}-input-number-input {
            height: 100% !important;
            min-height: 30px !important;
            line-height: 30px !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            padding-inline: 16px !important;
            font-size: 14px !important;
        }

        .query-builder .rule--value .${prefixCls}-picker {
            width: 100% !important;
            height: 100% !important;
            min-height: 30px !important;
            padding: 0 !important;
            min-width: 0 !important;
            display: flex !important;
            align-items: center !important;
            box-sizing: border-box !important;
            border: 0 !important;
            border-color: transparent !important;
            box-shadow: none !important;
            outline: none !important;
            background: transparent !important;
            border-radius: 0 !important;
        }

        .query-builder .rule--value .${prefixCls}-picker:hover,
        .query-builder .rule--value .${prefixCls}-picker-focused,
        .query-builder .rule--value .${prefixCls}-picker:focus,
        .query-builder .rule--value .${prefixCls}-picker:focus-within {
            border: 0 !important;
            border-color: transparent !important;
            box-shadow: none !important;
            outline: none !important;
            border-radius: 0 !important;
        }

        .query-builder .rule--value .${prefixCls}-picker .${prefixCls}-picker-input,
        .query-builder .rule--value .${prefixCls}-picker .${prefixCls}-picker-input > input {
            height: 100% !important;
            min-height: 30px !important;
            min-width: 0 !important;
            border: 0 !important;
            box-shadow: none !important;
            outline: none !important;
            background: transparent !important;
            border-radius: 0 !important;
        }

        .query-builder .rule--value .${prefixCls}-picker .${prefixCls}-picker-input {
            flex: 1 1 auto !important;
            width: 0 !important;
            overflow: hidden !important;
            padding: 0 16px !important;
            box-sizing: border-box !important;
        }

        .query-builder .rule--value .${prefixCls}-picker .${prefixCls}-picker-input > input {
            width: 100% !important;
            text-overflow: ellipsis !important;
        }

        .query-builder .rule--value .${prefixCls}-picker .${prefixCls}-picker-suffix,
        .query-builder .rule--value .${prefixCls}-picker .${prefixCls}-picker-clear {
            flex: 0 0 auto !important;
            margin-right: 16px !important;
            align-self: center;
        }

        /* Focus ring on the container instead of the child */

        .query-builder .rule--field:focus-within,
        .query-builder .rule--operator:focus-within,
        .query-builder .rule--value:focus-within {
            border-color: #1677ff;
            box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.15);
        }

        /* ── Widget layout inside .rule--value ─────────────────────────── */

        .query-builder .rule--field .sha-query-builder-packed-select,
        .query-builder .rule--field .sha-query-builder-packed-select > *,
        .query-builder .rule--fieldsrc .sha-query-builder-source-dropdown-trigger,
        .query-builder .rule--operator > *,
        .query-builder .rule--value .rule--widget,
        .query-builder .rule--value .widget--widget,
        .query-builder .rule--value .widget--func,
        .query-builder .rule--value .widget--widget > *:not(.widget--valuesrc),
        .query-builder .rule--value .widget--func > *:not(.widget--valuesrc),
        .query-builder .rule--before-widget .sha-query-builder-empty-rule-placeholders,
        .query-builder .rule--before-widget .sha-query-builder-empty-rule-placeholders > * {
            max-width: 100%;
            box-sizing: border-box;
        }

        .query-builder .rule--value .rule--widget {
            width: 100% !important;
            height: 100% !important;
            min-width: 0;
            flex: 1 1 auto;
            display: flex;
            flex-direction: row !important;
            align-items: stretch;
        }

        .query-builder .rule--value .rule--widget > .widget--valuesrc {
            order: 0 !important;
            flex: 0 0 auto !important;
            width: 60px !important;
            min-width: 60px !important;
            max-width: 60px !important;
            height: 32px !important;
            display: flex !important;
            align-items: stretch !important;
        }

        .query-builder .rule--value .rule--widget > .widget--widget,
        .query-builder .rule--value .rule--widget > .widget--func {
            order: 1 !important;
            width: 358px !important;
            min-width: 358px !important;
            max-width: 358px !important;
            flex: 0 0 358px !important;
            height: 32px !important;
        }

        /* Both .widget--widget (plain values) and .widget--func (expression/func) fill the value cell */

        .query-builder .rule--value .widget--widget,
        .query-builder .rule--value .widget--func {
            width: auto !important;
            max-width: 100%;
            height: 100% !important;
            min-width: 0;
            flex: 1 1 0;
            display: flex;
            align-items: stretch;
            gap: 0;
        }

        .query-builder .rule--value .widget--widget > *:not(.widget--valuesrc),
        .query-builder .rule--value .widget--func > *:not(.widget--valuesrc) {
            width: auto !important;
            max-width: 100%;
            height: 100% !important;
            min-width: 0;
            flex: 1 1 0;
            display: flex;
            align-items: stretch;
        }

        /* func wrapper, args, and expression arg chain — transparent to flex */

        .query-builder .rule--value .rule--func--wrapper,
        .query-builder .rule--value .rule--func--args,
        .query-builder .rule--value [class*="rule--func--arg--expression"],
        .query-builder .rule--value [class*="rule--func--arg--expression"] .rule--func--arg-value,
        .query-builder .rule--value [class*="rule--func--arg--expression"] .rule--func--arg-value > .rule--widget {
            display: contents;
        }

        /* ── Expression editor native blend ────────────────────────────── */

        .query-builder .rule--value .sha-query-builder-mustache-expression-input {
            flex: 1 1 0 !important;
            min-width: 0 !important;
            width: 100% !important;
            height: 30px !important;
            max-height: 30px !important;
            display: flex !important;
            align-items: center !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
            overflow: hidden !important;
            position: static !important;
        }

        .query-builder .rule--value .sha-query-builder-mustache-expression-input .sha-expression-editor-overlay {
            position: relative !important;
            inset: auto !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
        }

        .query-builder .rule--value .sha-query-builder-mustache-expression-input .sha-expression-editor-backdrop,
        .query-builder .rule--value .sha-query-builder-mustache-expression-input .sha-expression-editor-input {
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
        }

        .query-builder .rule--value .sha-query-builder-mustache-expression-input .sha-expression-editor-backdrop-content,
        .query-builder .rule--value .sha-query-builder-mustache-expression-input .sha-expression-editor-input {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            padding-left: 12px !important;
            padding-right: 32px !important;
            line-height: 30px !important;
            font-size: 14px !important;
        }

        .query-builder .rule--value .sha-query-builder-mustache-expression-input .sha-expression-editor-backdrop-content {
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
        }

        .query-builder .rule--value .sha-query-builder-mustache-expression-input .sha-expression-editor-input {
            min-height: 30px !important;
            height: 30px !important;
            resize: none !important;
        }

        .query-builder .rule--value .sha-query-builder-mustache-expression-input .sha-expression-editor-expand {
            right: 6px !important;
            bottom: 6px !important;
        }

        .query-builder .rule--value .widget--func:has(.sha-query-builder-mustache-expression-input) {
            width: 100% !important;
            min-width: 0 !important;
            flex: 1 1 auto !important;
            display: flex !important;
            align-items: stretch !important;
            gap: 0 !important;
        }

        .query-builder .rule--value .rule--widget:has(.sha-query-builder-mustache-expression-input) {
            width: 100% !important;
            min-width: 0 !important;
            display: flex !important;
            align-items: stretch !important;
            gap: 0 !important;
        }

        .query-builder .rule--value .rule--widget:has(.sha-query-builder-mustache-expression-input) > .widget--valuesrc {
            flex: 0 0 auto !important;
        }

        .query-builder .rule--value .rule--widget:has(.sha-query-builder-mustache-expression-input) > .widget--func {
            flex: 1 1 auto !important;
            min-width: 0 !important;
            display: flex !important;
            align-items: stretch !important;
        }

        .query-builder .rule--value .widget--func:has(.sha-query-builder-mustache-expression-input) .widget--valuesrc {
            flex: 0 0 auto !important;
            width: auto !important;
        }

        .query-builder .rule--value .widget--func:has(.sha-query-builder-mustache-expression-input) .sha-query-builder-mustache-expression-input {
            flex: 1 1 auto !important;
            width: auto !important;
            min-width: 0 !important;
            max-width: none !important;
        }

        .query-builder .rule--value .rule--func--wrapper:has([class*="rule--func--EVALUATE_"][class*="--args"]) {
            width: 100% !important;
            min-width: 0 !important;
            display: flex !important;
            align-items: stretch !important;
        }

        .query-builder .rule--value .rule--func--wrapper:has([class*="rule--func--EVALUATE_"][class*="--args"]) > .rule--func,
        .query-builder .rule--value .rule--func--wrapper:has([class*="rule--func--EVALUATE_"][class*="--args"]) > .rule--func--bracket-before,
        .query-builder .rule--value .rule--func--wrapper:has([class*="rule--func--EVALUATE_"][class*="--args"]) > .rule--func--bracket-after {
            display: none !important;
        }

        .query-builder .rule--value [class*="rule--func--EVALUATE_"][class*="--args"] {
            width: 100% !important;
            min-width: 0 !important;
            display: flex !important;
            align-items: stretch !important;
            gap: 0 !important;
        }

        .query-builder .rule--value [class*="rule--func--EVALUATE_"][class*="--arg--expression"] {
            flex: 1 1 auto !important;
            min-width: 0 !important;
            display: flex !important;
            align-items: stretch !important;
        }

        .query-builder .rule--value [class*="rule--func--EVALUATE_"][class*="--arg--expression"] .rule--func--arg-value,
        .query-builder .rule--value [class*="rule--func--EVALUATE_"][class*="--arg--expression"] .rule--func--arg-value > .rule--widget,
        .query-builder .rule--value [class*="rule--func--EVALUATE_"][class*="--arg--expression"] .widget--widget {
            flex: 1 1 auto !important;
            width: 100% !important;
            min-width: 0 !important;
            display: flex !important;
            align-items: stretch !important;
        }

        .query-builder .rule--value [class*="rule--func--EVALUATE_"][class*="--arg--ignoreIfUnassigned"] {
            flex: 0 0 48px !important;
            width: 48px !important;
            min-width: 48px !important;
            display: flex !important;
            align-items: stretch !important;
        }

        .query-builder .rule--value [class*="rule--func--EVALUATE_"][class*="--arg--ignoreIfUnassigned"] .rule--func--arg-sep {
            display: none !important;
        }

        .query-builder .rule--value:has(.sha-query-builder-mustache-expression-input:focus-within) {
            height: auto !important;
            max-height: none !important;
            min-height: 72px !important;
            align-items: stretch !important;
            width: auto !important;
            max-width: 100% !important;
        }

        .query-builder .rule.group-or-rule:has(.sha-query-builder-mustache-expression-input:focus-within) {
            align-items: stretch !important;
        }

        .query-builder .rule--value:has(.sha-query-builder-mustache-expression-input:focus-within) .rule--widget,
        .query-builder .rule--value:has(.sha-query-builder-mustache-expression-input:focus-within) .widget--widget,
        .query-builder .rule--value:has(.sha-query-builder-mustache-expression-input:focus-within) .widget--func {
            height: auto !important;
            min-height: 72px !important;
            align-items: stretch !important;
            width: auto !important;
            max-width: 100% !important;
        }

        .query-builder .rule--value:has(.sha-query-builder-mustache-expression-input:focus-within) .sha-query-builder-mustache-expression-input,
        .query-builder .rule--value:has(.sha-query-builder-mustache-expression-input:focus-within) .sha-query-builder-mustache-expression-input .sha-expression-editor-overlay {
            height: auto !important;
            max-height: none !important;
            min-height: 72px !important;
            align-items: stretch !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
        }

        .query-builder .rule--value:has(.sha-query-builder-mustache-expression-input:focus-within) .sha-query-builder-mustache-expression-input .sha-expression-editor-backdrop-content,
        .query-builder .rule--value:has(.sha-query-builder-mustache-expression-input:focus-within) .sha-query-builder-mustache-expression-input .sha-expression-editor-input {
            min-height: 72px !important;
            height: 100% !important;
            line-height: 20px !important;
            padding-top: 8px !important;
            padding-bottom: 8px !important;
            white-space: pre-wrap !important;
        }

        .query-builder .rule--value:has(.sha-query-builder-mustache-expression-input:focus-within) .sha-query-builder-mustache-expression-input .sha-expression-editor-backdrop-content {
            display: block !important;
            align-items: flex-start !important;
        }

        .query-builder .rule--value:has(.sha-query-builder-mustache-expression-input:focus-within) [class*="rule--func--arg--ignoreIfUnassigned"] {
            height: auto !important;
            min-height: 72px !important;
            align-items: stretch !important;
            width: 48px !important;
            min-width: 48px !important;
            padding: 0 8px !important;
            border-left: 1px solid #d0d5dd !important;
            opacity: 1 !important;
            pointer-events: auto !important;
        }

        .query-builder .rule--value:has(.sha-query-builder-mustache-expression-input:focus-within) [class*="rule--func--arg--ignoreIfUnassigned"] .rule--func--arg-value,
        .query-builder .rule--value:has(.sha-query-builder-mustache-expression-input:focus-within) [class*="rule--func--arg--ignoreIfUnassigned"] .rule--func--arg-value > .rule--widget,
        .query-builder .rule--value:has(.sha-query-builder-mustache-expression-input:focus-within) [class*="rule--func--arg--ignoreIfUnassigned"] .widget--widget,
        .query-builder .rule--value:has(.sha-query-builder-mustache-expression-input:focus-within) [class*="rule--func--arg--ignoreIfUnassigned"] .sha-query-builder-ignore-unassigned {
            height: 100% !important;
            min-height: 72px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        .query-builder .rule--value [class*="rule--func--arg--ignoreIfUnassigned"] .sha-query-builder-ignore-unassigned {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 6px !important;
            width: 100% !important;
        }

        .query-builder .rule--value [class*="rule--func--arg--ignoreIfUnassigned"] .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox-wrapper,
        .query-builder .rule--value [class*="rule--func--arg--ignoreIfUnassigned"] .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin: 0 !important;
        }

        /* ── Ignore-if-unassigned: compact right-side addon with divider ── */

        .query-builder .rule--value:has(.sha-query-builder-mustache-expression-input) [class*="rule--func--arg--ignoreIfUnassigned"] {
            flex: 0 0 48px !important;
            width: 48px !important;
            min-width: 48px !important;
            padding: 0 8px !important;
            border-left: 1px solid #d0d5dd !important;
            opacity: 1 !important;
            overflow: hidden !important;
            pointer-events: auto !important;
        }

        .query-builder .rule--value [class*="rule--func--arg--ignoreIfUnassigned"] {
            flex: 0 0 auto !important;
            width: auto !important;
            height: 30px !important;
            margin: 0 !important;
            padding: 0 8px !important;
            border-left: 1px solid #d0d5dd !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: #f8fafc !important;
        }

        .query-builder .rule--value [class*="rule--func--arg--ignoreIfUnassigned"] .rule--func--arg-value {
            display: flex !important;
            align-items: center !important;
            height: 100% !important;
        }

        .query-builder .rule--value [class*="rule--func--arg--ignoreIfUnassigned"] .rule--func--arg-value > .rule--widget {
            display: flex !important;
            align-items: center !important;
            height: 100% !important;
            width: auto !important;
            flex: 0 0 auto !important;
        }

        .query-builder .rule--value [class*="rule--func--arg--ignoreIfUnassigned"] .widget--widget {
            display: flex !important;
            align-items: center !important;
            flex: 0 0 auto !important;
            width: auto !important;
            height: auto !important;
        }

        .query-builder .rule--value [class*="rule--func--arg--ignoreIfUnassigned"] .sha-query-builder-ignore-unassigned {
            padding-right: 0;
        }
    `);

  return {
    shaQueryBuilder,
    shaQueryBuilderBtns,
  };
});
