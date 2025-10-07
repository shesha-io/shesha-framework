import classNames from 'classnames';
import React, { FC, useMemo, useRef } from 'react';
import { IQueryBuilderProps } from './interfaces';
import { usePrevious } from 'react-use';
import { useStyles } from './styles/styles';
import {
  Query,
  Builder,
  Utils as QbUtils,
  ImmutableTree,
  Config,
  BuilderProps,
} from '@react-awesome-query-builder/antd';

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
    return (
      <div className="query-builder-container">
        <div className={classNames('query-builder', { 'qb-lite': showActionBtnOnHover })}>
          <Builder {...props} />
        </div>
      </div>
    );
  };

  const handleChange = (_tree: ImmutableTree, _config: Config): void => {
    if (onChange) {
      const jsonLogicResult = QbUtils.jsonLogicFormat(_tree, _config);

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
