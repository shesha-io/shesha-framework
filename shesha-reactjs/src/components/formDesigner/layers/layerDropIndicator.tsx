import { CSSProperties, FC } from 'react';
import { Tooltip } from 'antd';
import { isDefined } from '@/utils/nullables';
import { IRowDropState } from './hooks/dndData';
import { LAYER_INDENT, useStyles } from './styles/styles';

/** A line where the component will land, or a box for "inside"; red with the reason when the drop isn't allowed */
export const LayerDropIndicator: FC<{ drop: IRowDropState; depth: number }> = ({ drop, depth }) => {
  const { styles, cx } = useStyles();
  const { instruction, resolution } = drop;
  const isBlocked = resolution.kind === 'blocked';
  const reason = resolution.kind === 'blocked' ? resolution.reason : undefined;

  const isInside = instruction.type === 'make-child' || instruction.type === 'instruction-blocked';
  const lineLevel = instruction.type === 'reparent' ? instruction.desiredLevel : depth;
  const lineStyle: CSSProperties = instruction.type === 'reorder-above'
    ? { left: lineLevel * LAYER_INDENT, top: -1 }
    : { left: lineLevel * LAYER_INDENT, bottom: -1 };

  const marker = isInside
    ? <div className={cx(styles.dropBox, isBlocked && 'is-blocked')} />
    : <div className={cx(styles.dropLine, isBlocked && 'is-blocked')} style={lineStyle} />;

  return isDefined(reason) ? <Tooltip open title={reason}>{marker}</Tooltip> : marker;
};
