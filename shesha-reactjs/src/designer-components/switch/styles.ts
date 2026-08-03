import { createStyles } from '@/styles';
import { addPx } from '@/utils/style';
import { isDefined } from '@/utils/nullables';
import { ISwitchComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';

export const useStyles = createStyles(({ css, cx, prefixCls }, model: ISwitchComponentProps) => {
  // Two independent style sets: the root model styles the track, `handleStyles` styles the
  // handle (the moving knob).
  const handle = model.handleStyles;

  // antd derives the handle geometry from its `handleSize` token, inlining it into `calc()` for
  // the width/height, the checked-state offset and the inner-label margins. Overriding a single
  // CSS variable would leave those out of sync, so each dependent rule is restated here whenever
  // a handle size is configured.
  //
  // antd's handle is always square, so one token covers both axes. Here width and height are
  // configured independently, so the horizontal rules (checked offset, inner-label margins) must
  // use the handle's *width* — using the height would let a wide handle overflow the track.
  const handleWidth = addPx(handle?.dimensions?.width) ?? addPx(handle?.dimensions?.height);
  const hasHandleWidth = isDefined(handleWidth);
  const trackPadding = '2px';

  const switchStyles = cx('sha-switch', css`
      &.${prefixCls}-switch {
        /* Track */
        ${dimensionsStyles(model.dimensions)}
        ${borderStyles(model.border)}
        ${shadowStyles(model.shadow)}
        ${paddingStyles(model.stylingBoxJson)}

        /* The track background applies only in the "on" state — the off state keeps antd's
           default grey so the two states stay distinguishable. The hover selector is repeated
           because antd's own \`&-checked:hover\` rule would otherwise win on hover. */
        &.${prefixCls}-switch-checked,
        &.${prefixCls}-switch-checked:hover:not(.${prefixCls}-switch-disabled) {
          ${backgroundStyles(model.background)}
        }

        /* Handle */
        .${prefixCls}-switch-handle {
          ${dimensionsStyles(handle?.dimensions)}

          /* The handle is sized as a border box so a handle border eats into its own width
             rather than growing it past the track. */
          box-sizing: border-box;
          &::before { box-sizing: border-box; }

          /* antd pins the handle to a fixed \`top: trackPadding\`, so a resized handle drifts off
             centre. Centre it instead, independently of the handle and track heights. */
          top: 50%;
          transform: translateY(-50%);

          &::before {
            ${borderStyles(handle?.border)}
            ${backgroundStyles(handle?.background)}
            ${shadowStyles(handle?.shadow)}
          }
        }

        /* Rest the handle against the leading edge when off. antd hard-codes its own
           \`trackPadding\` here, which ignores any padding configured on the track. */
        ${hasHandleWidth ? `.${prefixCls}-switch-handle { inset-inline-start: ${trackPadding}; }` : ''}

        /* Keep the "on" position aligned with the resized handle. The handle is absolutely
           positioned, so its \`100%\` resolves against the track's padding box — subtracting the
           handle width and one padding lands it flush against the trailing edge at any track
           size. Kept as a length (rather than switching to \`inset-inline-end\`) so antd's
           \`transition: all\` still slides the handle between the two states. */
        &.${prefixCls}-switch-checked .${prefixCls}-switch-handle {
          ${hasHandleWidth ? `inset-inline-start: calc(100% - ${handleWidth} - ${trackPadding});` : ''}
        }

        /* Inner label margins are derived from the handle size in antd. */
        ${hasHandleWidth
          ? `.${prefixCls}-switch-inner .${prefixCls}-switch-inner-checked { margin-inline-start: calc(-1 * (${handleWidth} + ${trackPadding})); margin-inline-end: calc(${handleWidth} + ${trackPadding}); }`
          : ''}
        ${hasHandleWidth
          ? `.${prefixCls}-switch-inner .${prefixCls}-switch-inner-unchecked { margin-inline-start: calc(${handleWidth} + ${trackPadding}); margin-inline-end: calc(-1 * (${handleWidth} + ${trackPadding})); }`
          : ''}
      }
    `);

  return {
    switchStyles,
  };
});
