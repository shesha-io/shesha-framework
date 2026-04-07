import classNames from 'classnames';
import React, { FC, useMemo, useRef } from 'react';
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
    return null;
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
  const changedOutside = value !== lastLocallyChangedValue.current;
  const prevValue = usePrevious(value);
  const prevTree = useRef<ImmutableTree>(null);

  const tree = useMemo(() => {
    const needRebuildTree = value !== prevValue && changedOutside;

    if (!needRebuildTree && prevTree.current)
      return prevTree.current;

    const loadedTree = value
      ? loadJsonLogic(value, qbConfig)
      : QbUtils.loadTree({ id: QbUtils.uuid(), type: 'group' });

    const checkedTree = QbUtils.checkTree(loadedTree, qbConfig);

    prevTree.current = checkedTree;
    lastLocallyChangedValue.current = value;

    return checkedTree;
  }, [value]);

  const renderBuilder = (props: BuilderProps): JSX.Element => {
    const children1 = props.tree?.getIn?.(['children1']);
    const hasRules = Boolean(children1 && (children1 as { size?: number })?.size > 0);
    const plainTree = props.tree ? QbUtils.getTree(props.tree) : undefined;
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
  };

  const handleChange = (_tree: ImmutableTree, _config: Config): void => {
    if (onChange) {
      const normalizedTree = QbUtils.loadTree(normalizeTreeForJsonLogic(QbUtils.getTree(_tree) as unknown as IPlainTreeNode) as unknown as JsonTree);
      const jsonLogicResult = QbUtils.jsonLogicFormat(normalizedTree, _config);

      lastLocallyChangedValue.current = jsonLogicResult.logic;
      onChange(jsonLogicResult);
    }
  };

  return (
    <div className={styles.shaQueryBuilder}>
      {tree && qbConfig && <Query {...qbConfig} value={tree} onChange={handleChange} renderBuilder={renderBuilder} />}
    </div>
  );
};
