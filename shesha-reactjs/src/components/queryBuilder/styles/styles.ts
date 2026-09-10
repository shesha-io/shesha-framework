import { createStyles, sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls, token }) => {
  const shaQueryBuilderBtns = "sha-query-builder-btns";
  const shaQueryBuilder = cx("sha-query-builder", css`
        background-image: white !important;
    
        .query-builder-container {
            padding: unset !important;

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
            --sha-query-builder-prefix-width: 70px;
            width: 100%;
            min-width: 0;
            overflow: hidden;
        }

        .sha-query-builder-surface {
            width: 100%;
            min-width: 0;
            min-height: 0;
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 10px;
            box-sizing: border-box;
            background: #f5f5f5;
            border: 1px solid #ececec;
            border-radius: 8px;
        }

        .sha-query-builder-surface.is-empty {
            min-height: 0;
            gap: 0;
            padding: 0;
            background: transparent;
            border: 0;
            border-radius: 0;
        }

        .sha-query-builder-heading {
            margin: 0;
            font-family: Inter, Roboto, Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 22px;
            font-weight: 400;
            color: #000;
        }

        .sha-query-builder-empty-state-message {
            display: block;
            margin: 0;
            font-size: 14px;
            line-height: 22px;
            font-weight: 400;
            color: #585858;
            font-family: Inter, Roboto, Helvetica, Arial, sans-serif;
        }

        .sha-query-builder-filter {
            width: 100%;
            display: flex;
            flex-direction: column;
            flex: 1 1 auto;
            gap: 10px;
            min-width: 0;
        }

        .sha-query-builder-filter-body,
        .sha-query-builder-group-children {
            display: flex;
            flex-direction: column;
            flex: 1 1 auto;
            gap: 10px;
            width: 100%;
            min-width: 0;
            align-items: flex-start;
        }

        /* Single horizontal scrollbar for the whole rule set (incl. nested
           groups) lives here, on the rule container, instead of on each row. */
        .sha-query-builder-filter-body {
            overflow-x: auto;
            overflow-y: hidden;
            padding: 6px 0;
        }

        /* Nested group rows must not scroll on their own — they size to their
           content so the width bubbles up to the filter-body scroller. */
        .sha-query-builder-group-children {
            width: 100%;
            min-width: 0;
        }

        .sha-query-builder-filter-actions,
        .sha-query-builder-group-actions {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 10px;
            width: 100%;
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

        .sha-query-builder-surface.is-empty .sha-query-builder-empty-state-content {
            width: 100%;
            min-height: 84px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            gap: 10px;
            padding: 10px;
            background: #f8f8f8;
            border-radius: 5px;
        }

        .sha-query-builder-surface.is-empty .sha-query-builder-empty-state-actions {
            display: inline-flex;
            align-items: center;
            justify-content: flex-start;
            gap: 11px;
            width: auto;
        }

        .sha-query-builder-surface.is-empty .sha-query-builder-empty-state-actions .${prefixCls}-btn {
            height: 32px;
            padding: 0 16px;
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .sha-query-builder-group-card {
            width: 100%;
            min-width: 0;
            min-height: 0;
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 6px 10px 10px;
            box-sizing: border-box;
            border-radius: 12px;
            border: 1px solid transparent;
            background: color-mix(in srgb, ${token.colorPrimary} 10%, transparent);
        }

        .sha-query-builder-group-card .sha-query-builder-group-card {
            border-color: color-mix(in srgb, ${token.colorPrimary} 45%, #fff);
            background: color-mix(in srgb, ${token.colorPrimary} 15%, transparent);
        }

        .sha-query-builder-group-card.is-drop-append {
            border-color: ${token.colorPrimary};
            box-shadow: 0 0 0 2px ${token.colorPrimaryBg};
            background: color-mix(in srgb, ${token.colorPrimary} 30%, transparent);
        }

        .sha-query-builder-group-card.is-drop-append > .sha-query-builder-group-children:empty,
        .sha-query-builder-group-card.is-drop-append > .sha-query-builder-group-children:has(.sha-query-builder-drop-placeholder:only-child) {
            min-height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .sha-query-builder-drop-placeholder {
            position: relative;
            height: 2px;
            background: ${token.colorPrimary};
            border-radius: 999px;
            margin: 4px 0;
        }

        .sha-query-builder-drop-placeholder::before {
            content: "";
            position: absolute;
            left: -4px;
            top: 50%;
            transform: translateY(-50%);
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${token.colorPrimary};
        }

        .sha-query-builder-drop-placeholder::after {
            content: "";
            position: absolute;
            right: -4px;
            top: 50%;
            transform: translateY(-50%);
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${token.colorPrimary};
        }

        .sha-query-builder-group-header {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: center;
            gap: 12px;
            width: 100%;
            min-height: 36px;
            min-width: 0;
        }

        .sha-query-builder-group-heading {
            display: block;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family: Inter, Roboto, Helvetica, Arial, sans-serif;
            font-size: 14px;
            line-height: 22px;
            font-weight: 400;
            color: #101828;
        }

        .sha-query-builder-group-header .sha-query-builder-group-heading {
            min-width: 0;
        }

        .sha-query-builder-group-actions {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 5px 0;
            flex: 0 0 auto;
            width: auto;
            justify-content: flex-end;
        }

        /* Plain icons per the design: no card chrome, colour alone marks the action. */
        .sha-query-builder-group-action-button.${prefixCls}-btn {
            width: 26px;
            min-width: 26px;
            height: 26px !important;
            padding: 0;
            border-radius: 6px;
            border: none;
            background: transparent;
            box-shadow: none;
            color: #667085;
        }

        .sha-query-builder-group-action-button.${prefixCls}-btn:hover:not(:disabled),
        .sha-query-builder-group-action-button.${prefixCls}-btn:focus-visible:not(:disabled) {
            background: rgba(16, 24, 40, 0.06);
            color: #344054;
        }

        .sha-query-builder-group-action-button.${prefixCls}-btn .${prefixCls}-btn-icon {
            margin-inline-end: 0;
        }

        .sha-query-builder-group-action-button.${prefixCls}-btn .anticon {
            font-size: 14px;
        }

        .sha-query-builder-group-action-button--danger.${prefixCls}-btn {
            color: #d92d20;
        }

        .sha-query-builder-group-action-button--danger.${prefixCls}-btn:hover:not(:disabled),
        .sha-query-builder-group-action-button--danger.${prefixCls}-btn:focus-visible:not(:disabled) {
            background: #fef3f2;
            color: #b42318;
        }

        .sha-query-builder-group-action-button--drag.${prefixCls}-btn,
        .sha-query-builder-group-action-button--drag.${prefixCls}-btn:hover,
        .sha-query-builder-group-action-button--drag.${prefixCls}-btn:focus,
        .sha-query-builder-group-action-button--drag.${prefixCls}-btn:active {
            width: 24px;
            min-width: 24px;
            height: 24px !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            color: #f8fafc;
        }

        .sha-query-builder-item-row {
            position: relative;
            display: grid;
            grid-template-columns: var(--sha-query-builder-prefix-width) minmax(0, 1fr);
            align-items: stretch;
            gap: 10px;
            width: 100%;
            min-width: 0;
        }

        .sha-query-builder-item-row:not(.is-group) .sha-query-builder-item-prefix {
            padding-right: 10px;
            box-sizing: border-box;
        }

        .sha-query-builder-item-row.is-drop-before::before,
        .sha-query-builder-item-row.is-drop-after::after {
            content: "";
            position: absolute;
            left: var(--sha-query-builder-prefix-width);
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
            width: var(--sha-query-builder-prefix-width);
            min-width: var(--sha-query-builder-prefix-width);
            max-width: var(--sha-query-builder-prefix-width);
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
            grid-template-columns: var(--sha-query-builder-prefix-width) minmax(0, 1fr);
        }

        .sha-query-builder-prefix-label {
            width: 100%;
            color: ${token.colorPrimary};
            font-size: 14px;
            line-height: 20px;
            font-weight: 500;
            white-space: nowrap;
        }

        .sha-query-builder-prefix-select {
            width: 100%;
            min-width: var(--sha-query-builder-prefix-width);
        }

        .sha-query-builder-prefix-select .${prefixCls}-select {
            width: 100%;
            height: 32px;
            border: 1px solid #d0d5dd;
            border-radius: 8px;
            background: #fff;
            box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);
        }

        .sha-query-builder-prefix-select .${prefixCls}-select-selector {
            min-height: 30px !important;
            padding: 0 10px !important;
            border: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
            display: flex !important;
            align-items: center !important;
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

        .sha-query-builder-item-shell {
            width: 100%;
            min-width: 0;
            display: grid;
            grid-template-columns: minmax(0, 1fr) 32px 32px;
            align-items: stretch;
            column-gap: 0;
            min-height: 58px;
            box-sizing: border-box;
            background: #fff;
            border-radius: 5px;
            overflow: visible;
        }

        .sha-query-builder-rule-scroll {
            overflow: visible;
            width: 100%;
            min-width: 0;
        }

        .sha-query-builder-group-children .sha-query-builder-item-shell {
            overflow: visible;
        }

        /* Rules wrap rather than shrink: a control that cannot keep its legible width moves to the
           next line instead of being crushed. Horizontal room is fixed, vertical room is not. */
        .sha-query-builder-rule-row {
            width: 100%;
            min-width: 0;
            min-height: 32px;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 10px;
            padding: 13px 10px;
            box-sizing: border-box;
        }

        .sha-query-builder-rule-row > .sha-query-builder-packed-control {
            flex: 0 1 200px;
            min-width: 180px;
        }

        .sha-query-builder-rule-row > .sha-query-builder-operator-slot {
            flex: 0 1 155px;
            min-width: 150px;
        }

        .sha-query-builder-rule-row > .sha-query-builder-value-shell {
            flex: 1 1 260px;
            min-width: 240px;
        }

        /* A function needs room for its own selector plus an argument editor underneath. */
        .sha-query-builder-rule-row > .sha-query-builder-value-shell.is-function,
        .sha-query-builder-rule-row > .sha-query-builder-value-shell:has(.sha-query-builder-value-editor-slot.is-function) {
            flex: 1 1 460px;
            min-width: 440px;
        }

        /* A range with a function at both ends carries two pickers and two skip boxes; below this it wraps to its own line. */
        .sha-query-builder-rule-row > .sha-query-builder-value-shell:has(.sha-query-builder-value-editor-slot.is-function ~ .sha-query-builder-value-editor-slot.is-function) {
            flex: 1 1 600px;
            min-width: 560px;
        }

        .sha-query-builder-rule-row.is-unary {
            justify-content: flex-start;
        }

        .sha-query-builder-item-action {
            width: 32px;
            min-width: 32px;
            min-height: 58px;
            padding: 0;
            border: 0;
            border-left: 1px solid #eaecf0;
            border-radius: 0;
            background: transparent;
            box-shadow: none;
            color: #667085;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            align-self: stretch;
            cursor: pointer;
        }

        .sha-query-builder-item-action + .sha-query-builder-item-action {
            border-left-color: #f4f5f6;
        }

        .sha-query-builder-item-action .anticon {
            font-size: 18px;
        }

        .sha-query-builder-item-action:hover:not(:disabled),
        .sha-query-builder-item-action:focus-visible:not(:disabled) {
            background: #f8fafc;
            color: #344054;
        }

        .sha-query-builder-item-action:disabled {
            opacity: 0.45;
            cursor: not-allowed;
        }

        .sha-query-builder-item-action--drag {
            cursor: grab;
        }

        .sha-query-builder-item-action--drag:disabled {
            cursor: not-allowed;
        }

        .sha-query-builder-item-action--delete {
            color: #f04438;
        }

        .sha-query-builder-item-action--delete:hover:not(:disabled),
        .sha-query-builder-item-action--delete:focus-visible:not(:disabled) {
            background: #fff5f3;
            color: #d92d20;
        }

        .sha-query-builder-packed-control,
        .sha-query-builder-operator-slot,
        .sha-query-builder-value-shell {
            box-sizing: border-box;
            min-width: 0;
            transition: border-color 0.16s ease, box-shadow 0.16s ease;
        }

        .sha-query-builder-packed-control {
            width: 100%;
            max-width: 200px;
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

        .sha-query-builder-packed-control:not(.is-func) {
            height: 32px;
        }

        .sha-query-builder-source-slot {
            width: 58px;
            min-width: 58px;
            height: 32px;
            border-right: 1px solid #d0d5dd;
            background: #f9fafb;
            display: flex;
            align-items: stretch;
        }

        .sha-query-builder-field-slot {
            width: 100%;
            min-width: 0;
            min-height: 32px;
            display: flex;
            align-items: stretch;
            overflow: hidden;
        }

        .sha-query-builder-source-dropdown-trigger,
        .sha-query-builder-source-trigger {
            width: 58px;
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
            gap: 0 !important;
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

        .sha-query-builder-source-trigger-label {
            display: none;
        }

        /* Every embedded control is hosted by a control slot, which owns the border. The control
           itself is stripped bare, so field, operator, value and function arguments are
           indistinguishable from one another. */
        .sha-query-builder-control-slot .sha-query-builder-packed-select,
        .sha-query-builder-control-slot .${prefixCls}-select,
        .sha-query-builder-control-slot .${prefixCls}-picker,
        .sha-query-builder-control-slot .${prefixCls}-input,
        .sha-query-builder-control-slot .${prefixCls}-input-number,
        .sha-query-builder-control-slot .${prefixCls}-segmented,
        .sha-query-builder-control-slot .sha-expression-editor {
            width: 100% !important;
            max-width: 100%;
            min-width: 0;
        }

        .sha-query-builder-control-slot .${prefixCls}-select-selector {
            height: 32px !important;
            min-height: 32px !important;
            padding: 0 4px !important;
            border: 0 !important;
            border-radius: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
        }

        .sha-query-builder-control-slot .${prefixCls}-select-selection-wrap {
            min-width: 0 !important;
        }

        .sha-query-builder-control-slot .${prefixCls}-select-selection-item,
        .sha-query-builder-control-slot .${prefixCls}-select-selection-placeholder {
            width: 100%;
            min-width: 0;
            display: flex;
            align-items: center;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            line-height: 30px !important;
        }

        .sha-query-builder-control-slot .${prefixCls}-select-selection-item > * {
            min-width: 0;
            max-width: 100%;
        }

        .sha-query-builder-operator-slot {
            width: 100%;
            min-width: 0;
            max-width: 155px;
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
            min-width: 0;
            max-width: none;
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

        /* A range has a source picker per end, so it takes the whole shell instead of the source column. */
        .sha-query-builder-value-shell:has(> .sha-query-builder-value-editor.is-range) {
            grid-template-columns: minmax(0, 1fr);
        }

        .sha-query-builder-value-shell--empty {
            background: rgba(255, 255, 255, 0.6);
        }

        .sha-query-builder-value-shell--empty .${prefixCls}-input-disabled {
            color: #98a2b3;
        }

        .sha-query-builder-packed-control:has(.${prefixCls}-select-focused),
        .sha-query-builder-operator-slot:has(.${prefixCls}-select-focused),
        .sha-query-builder-value-shell:has(.${prefixCls}-select-focused),
        .sha-query-builder-value-shell:has(.${prefixCls}-picker-focused),
        .sha-query-builder-value-shell:has(.${prefixCls}-input-affix-wrapper-focused),
        .sha-query-builder-value-shell:has(.${prefixCls}-input-number-focused),
        .sha-query-builder-value-shell:has(input:focus:not(.sha-expression-editor-input)) {
            border-color: ${token.colorPrimary};
            box-shadow: 0 0 0 1px ${token.colorPrimary};
        }

        .sha-query-builder-value-editor {
            width: 100%;
            flex: 1 1 auto;
            min-width: 0;
            height: 32px;
            display: flex;
            align-items: stretch;
            overflow: hidden;
        }

        /* Inside the value shell the Yes / No control keeps its segmented look as a compact pill. */
        .sha-query-builder-control-slot .sha-bool-btn-group {
            width: auto;
            flex: 0 0 auto;
            align-self: center;
            height: 26px;
            min-height: 26px;
            max-height: 26px;
            margin: 0 6px;
            border-radius: 6px;
            box-shadow: none;
        }

        .sha-query-builder-value-editor.is-range {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            padding: 0 8px;
            box-sizing: border-box;
        }

        .sha-query-builder-value-editor.is-range.has-separator {
            grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
            gap: 4px;
            align-items: center;
        }

        .sha-query-builder-value-range-separator {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 8px;
            height: 32px;
            color: #667085;
            font-size: 14px;
            line-height: 32px;
            user-select: none;
        }

        .sha-query-builder-value-editor-slot {
            width: 100%;
            flex: 1 1 0;
            min-width: 0;
            display: flex;
            align-items: stretch;
        }

        .sha-query-builder-widget-host,
        .sha-query-builder-func-arg {
            width: 100%;
            flex: 1 1 auto;
            min-width: 0;
            min-height: 32px;
            display: flex;
            align-items: stretch;
            overflow: hidden;
        }

        .sha-query-builder-control-slot > *:not(.sha-query-builder-source-slot),
        .sha-query-builder-widget-host > * {
            width: 100%;
            flex: 1 1 auto;
            min-width: 0;
        }

        /* A column with one source shows the glyph only: no caret, nothing to focus. */
        .sha-query-builder-source-trigger--static {
            justify-content: center;
            cursor: default;
        }

        /* Controls bring their own minimum widths; the slot decides the width here so the suffix icon stays visible. */
        .sha-query-builder-control-slot .${prefixCls}-select,
        .sha-query-builder-control-slot .${prefixCls}-picker,
        .sha-query-builder-control-slot .${prefixCls}-input-number,
        .sha-query-builder-control-slot .${prefixCls}-input,
        .sha-query-builder-control-slot .sha-expression-editor {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100%;
        }

        /* Function editor: an optional function picker followed by one slot per declared argument. */
        .sha-query-builder-func-editor {
            min-width: 0;
            height: 100%;
            display: flex;
            align-items: stretch;
            overflow: hidden;
        }

        .sha-query-builder-func-args {
            flex: 1 1 auto;
            min-width: 0;
            height: 100%;
            display: flex;
            align-items: stretch;
        }

        .sha-query-builder-func-args > .sha-query-builder-func-arg + .sha-query-builder-func-arg {
            border-left: 1px solid #d0d5dd;
        }

        /* A boolean flag argument only needs room for its control, so it opts out of the even split. */
        .sha-query-builder-func-arg:has(.sha-query-builder-ignore-unassigned) {
            flex: 0 0 auto;
            width: auto;
            min-width: 33px;
            justify-content: center;
            background: #fff;
        }

        .sha-query-builder-func-arg .${prefixCls}-checkbox-wrapper {
            margin-inline-start: 0;
        }

        /* The value shell draws the border; the editor's own box would double it. */
        .sha-query-builder-control-slot .sha-expression-editor-preview,
        .sha-query-builder-control-slot .sha-expression-editor-preview:hover:not(:disabled),
        .sha-query-builder-control-slot .sha-expression-editor-preview:focus-visible {
            border-color: transparent !important;
            background: transparent !important;
            box-shadow: none !important;
        }

        .sha-query-builder-control-slot .${prefixCls}-picker,
        .sha-query-builder-control-slot .${prefixCls}-input-number,
        .sha-query-builder-control-slot .${prefixCls}-input,
        .sha-query-builder-control-slot .${prefixCls}-select,
        .sha-query-builder-control-slot .sha-expression-editor {
            width: 100%;
            height: 32px;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
        }

        .sha-query-builder-control-slot .${prefixCls}-picker,
        .sha-query-builder-control-slot .${prefixCls}-input-number,
        .sha-query-builder-control-slot .${prefixCls}-input {
            padding: 0 4px;
        }

        .sha-query-builder-control-slot .${prefixCls}-picker,
        .sha-query-builder-control-slot .${prefixCls}-input-number,
        .sha-query-builder-control-slot .${prefixCls}-picker-input,
        .sha-query-builder-control-slot .${prefixCls}-input-number-input-wrap,
        .sha-query-builder-control-slot .${prefixCls}-select-single .${prefixCls}-select-selection-search {
            display: flex;
            align-items: center;
            min-height: 32px;
        }

        .sha-query-builder-control-slot .${prefixCls}-picker-input > input,
        .sha-query-builder-control-slot .${prefixCls}-input,
        .sha-query-builder-control-slot .${prefixCls}-input-number-input,
        .sha-query-builder-control-slot .${prefixCls}-select-single .${prefixCls}-select-selection-search-input {
            width: 100%;
            height: 100% !important;
            min-height: 32px !important;
            min-width: 0;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            line-height: 30px !important;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .sha-query-builder-control-slot .${prefixCls}-input-number-input {
            padding-inline: 0 !important;
        }

        .sha-query-builder-control-slot .${prefixCls}-picker-input,
        .sha-query-builder-control-slot .${prefixCls}-input-number-input-wrap {
            height: 100%;
            min-width: 0;
        }

        .sha-query-builder-control-slot .${prefixCls}-picker-suffix,
        .sha-query-builder-control-slot .${prefixCls}-picker-clear,
        .sha-query-builder-control-slot .${prefixCls}-select-arrow,
        .sha-query-builder-control-slot .${prefixCls}-select-clear {
            flex-shrink: 0;
        }

        .sha-query-builder-control-slot .${prefixCls}-segmented {
            padding: 2px 8px;
            box-sizing: border-box;
        }

        .sha-query-builder-value-placeholder {
            width: 100%;
            min-width: 0;
        }

        .${shaQueryBuilderBtns} {
            display: flex;
            justify-content: flex-end;
    
            button {
                margin-left: ${sheshaStyles.paddingLG}px;
            }
        }

        .sha-query-builder-source-trigger {
            display: inline-flex;
            align-items: center;
            justify-content: center;
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
            width: 33px;
            height: 32px;
            padding: 10px 4px;
            box-sizing: border-box;
        }

        .sha-query-builder-ignore-unassigned.is-checked {
            width: auto;
        }

        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox-wrapper {
            flex: 0 0 24px;
            width: 24px;
            height: 24px;
            margin: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        /* antd positions the tick for its own 16px box, so the box keeps that size and only the hit area grows. */
        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox {
            margin: 0;
            top: 0;
            align-self: center;
        }

        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox-inner {
            width: 16px;
            height: 16px;
            border-radius: 4px;
            display: block;
            position: relative;
        }

        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox-checked .${prefixCls}-checkbox-inner,
        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox-wrapper:hover .${prefixCls}-checkbox-checked:not(.${prefixCls}-checkbox-disabled) .${prefixCls}-checkbox-inner,
        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox-checked:not(.${prefixCls}-checkbox-disabled):hover .${prefixCls}-checkbox-inner,
        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox-checked:not(.${prefixCls}-checkbox-disabled):focus-within .${prefixCls}-checkbox-inner {
            background-color: #52c41a;
            border-color: #52c41a;
        }

        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox-checked .${prefixCls}-checkbox-inner::after {
            top: 50%;
            inset-inline-start: 50%;
            width: 5px;
            height: 9px;
            display: block;
            transform: translate(-50%, -58%) rotate(45deg) scale(1);
            transform-origin: center;
        }

        /* antd 6 paints the box on the .ant-checkbox span (tick in its ::after); the -inner rules above cover antd 5 */
        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox.${prefixCls}-checkbox-checked,
        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox-wrapper:hover .${prefixCls}-checkbox.${prefixCls}-checkbox-checked:not(.${prefixCls}-checkbox-disabled),
        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox.${prefixCls}-checkbox-checked:not(.${prefixCls}-checkbox-disabled):hover,
        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox.${prefixCls}-checkbox-checked:not(.${prefixCls}-checkbox-disabled):focus-within {
            background-color: #52c41a;
            border-color: #52c41a;
        }

        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox-checked .${prefixCls}-checkbox-input,
        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox-wrapper:hover .${prefixCls}-checkbox-checked:not(.${prefixCls}-checkbox-disabled) .${prefixCls}-checkbox-input,
        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox-checked:not(.${prefixCls}-checkbox-disabled) .${prefixCls}-checkbox-input:hover,
        .sha-query-builder-ignore-unassigned .${prefixCls}-checkbox-checked:not(.${prefixCls}-checkbox-disabled) .${prefixCls}-checkbox-input:focus-visible {
            background-color: #52c41a;
            border-color: #52c41a;
            outline-color: #52c41a;
            accent-color: #52c41a;
        }

        .sha-query-builder-ignore-unassigned-icon {
            display: none;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            flex-shrink: 0;
            aspect-ratio: 1 / 1;
            color: #52c41a;
            font-size: 11px;
        }

        .sha-query-builder-ignore-unassigned.is-checked .sha-query-builder-ignore-unassigned-icon {
            display: inline-flex;
        }

        .sha-bool-btn-group {
            display: inline-flex;
            height: 32px;
            min-height: 32px;
            max-height: 32px;
            align-items: stretch;
            gap: 1px;
            padding: 1px;
            border: 1px solid #d0d5dd;
            border-radius: 8px;
            background: #ffffff;
            box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.05);
            overflow: hidden;
            box-sizing: border-box;
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
            padding: 0 16px;
            font-size: 14px;
            font-weight: 400;
            line-height: 20px;
            font-family: Inter, sans-serif;
            white-space: nowrap;
            cursor: pointer;
            border: none;
            border-radius: 7px;
            box-sizing: border-box;
            background: transparent;
            color: #344054;
        }

        .sha-bool-btn-group__btn.is-active {
            background: ${token.colorPrimary};
            color: #ffffff;
        }

    `);

  /* The skip checkbox hint renders in a portal, so it gets its own root class: a light card with the documentation link. */
  const shaQueryBuilderHint = css`
        max-width: 300px;

        .${prefixCls}-tooltip-inner {
            padding: 10px 12px;
            color: #344054;
            font-size: 12px;
            line-height: 1.45;
            border: 1px solid #e4e7ec;
            border-radius: 8px;
            box-shadow: 0 6px 16px rgba(16, 24, 40, 0.12);
        }

        .sha-query-builder-hint-title {
            display: block;
            margin-bottom: 4px;
            font-weight: 600;
            color: #1d2939;
        }

        .sha-query-builder-hint-body {
            margin: 0 0 8px;
        }

        .sha-query-builder-hint-link {
            margin: 0;
        }

        .sha-query-builder-hint-link a {
            color: ${token.colorPrimary};
            text-decoration: underline;
            font-style: italic;
        }
    `;

  return {
    shaQueryBuilder,
    shaQueryBuilderBtns,
    shaQueryBuilderHint,
  };
});
