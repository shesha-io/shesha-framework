import classNames from 'classnames';
import React, { FC, useCallback, useMemo, useRef } from 'react';
import { isEqual } from 'lodash';
import { IQueryBuilderProps } from './interfaces';
import { usePrevious } from 'react-use';
import { useStyles } from './styles/styles';
import { getRootLogicLabel, normalizeTreeForJsonLogic, IPlainTreeNode } from './treeRelations';
import type { JsonTree } from '@react-awesome-query-builder/antd';
import {
  Query,
  Utils as QbUtils,
  ImmutableTree,
  Config,
  BuilderProps,
  Utils,
} from '@react-awesome-query-builder/antd';
import { CustomQueryBuilder } from './customBuilder';

interface IQueryBuilderContentProps extends IQueryBuilderProps {
  qbConfig: Config;
}

const loadJsonLogic = (jlValue: object, config: Config): ImmutableTree | undefined => {
  try {
    return QbUtils.loadFromJsonLogic(jlValue, config);
  } catch (error) {
    console.error('failed to parse JsonLogic expression', { error, jlValue, config });
    return undefined;
  }
};

export const QueryBuilderContent: FC<IQueryBuilderContentProps> = ({
  showActionBtnOnHover = true,
  onChange,
  value,
  qbConfig,
}) => {
  const { styles } = useStyles();
  const lastLocallyChangedValue = useRef(value);
  // Content comparison, not reference: Shesha form bindings hand back a new object
  // reference for identical content (setFormData clones via deepMergeValues), so a
  // reference check is permanently "changed" and rebuilds the tree on every render → loop.
  const changedOutside = !isEqual(value, lastLocallyChangedValue.current);
  const prevValue = usePrevious(value);
  const prevTree = useRef<ImmutableTree | undefined>(undefined);
  // Set when WE emit a change. The resulting value echo must NOT rebuild the tree — RAQB
  // already holds the up-to-date tree, and rebuilding hands it a new reference that retriggers
  // its internal redux store (QueryContainer.onPropsChanged → dispatch → re-render → …).
  // A content compare can't catch this for date values: their JsonLogic round-trip
  // (moment(...).format()) drifts every cycle, so the echo never equals what we emitted.
  const selfOriginated = useRef(false);

  const tree = useMemo<ImmutableTree | undefined>(() => {
    if (selfOriginated.current) {
      selfOriginated.current = false;
      lastLocallyChangedValue.current = value;
      return prevTree.current;
    }

    const needRebuildTree = value !== prevValue && changedOutside;

    if (!needRebuildTree && prevTree.current)
      return prevTree.current;

    const loadedTree = value
      ? loadJsonLogic(value, qbConfig)
      : QbUtils.loadTree({ id: QbUtils.uuid(), type: 'group' });

    const checkedTree = loadedTree ? Utils.Validation.sanitizeTree(loadedTree, qbConfig).fixedTree : undefined;

    prevTree.current = checkedTree;
    lastLocallyChangedValue.current = value;

    return checkedTree;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const renderBuilder = useCallback((props: BuilderProps): React.JSX.Element => {
    const children1 = props.tree.getIn(['children1']);
    const hasRules = Boolean(children1 && (children1 as { size: number }).size > 0);
    const plainTree = QbUtils.getTree(props.tree);
    const logicHeading = getRootLogicLabel(plainTree);

    return (
      <div className={classNames('query-builder-container', { 'qb-has-rules': hasRules, 'qb-empty': !hasRules })} data-root-logic-label={logicHeading}>
        <div className={classNames('qb-rule-layout', { 'qb-rule-layout--active': hasRules })}>
          <div className={classNames('sha-query-builder-canvas', { 'qb-lite': showActionBtnOnHover })}>
            <CustomQueryBuilder {...props} />
          </div>
        </div>
      </div>
    );
  }, [showActionBtnOnHover]);

  const handleChange = (_tree: ImmutableTree, _config: Config): void => {
    // Keep our controlled value in sync with RAQB's own internal tree, so the next render
    // hands <Query> the exact reference it already holds (no spurious onPropsChanged).
    prevTree.current = _tree;
    if (onChange) {
      const normalizedTree = QbUtils.loadTree(normalizeTreeForJsonLogic(QbUtils.getTree(_tree) as unknown as IPlainTreeNode) as unknown as JsonTree);
      const jsonLogicResult = QbUtils.jsonLogicFormat(normalizedTree, _config);

      const previous = lastLocallyChangedValue.current;
      lastLocallyChangedValue.current = jsonLogicResult;
      // Don't re-emit identical content — breaks the controlled value ⇄ onChange echo loop.
      if (isEqual(jsonLogicResult, previous))
        return;
      // The upcoming value echo is our own — don't rebuild the tree from it (see selfOriginated).
      selfOriginated.current = true;
      onChange(jsonLogicResult);
    }
  };

  return (
    <div className={styles.shaQueryBuilder}>
      {tree && <Query {...qbConfig} value={tree} onChange={handleChange} renderBuilder={renderBuilder} />}
    </div>
  );
};
