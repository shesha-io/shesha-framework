import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useQueryBuilder } from '@/providers';
import { extractVars } from '@/utils/jsonLogic';
import { findProperty } from '../catalogue/fields';
import { JsonLogicFilter } from '@/interfaces/jsonLogic';
import { IQueryBuilderProps } from '../interfaces';
import { exportToJsonLogic } from '../jsonLogic/export';
import { importFromJsonLogic } from '../jsonLogic/import';
import { QueryAction, queryReducer } from '../model/reducer';
import { QueryTree } from '../model/types';
import { useStyles } from '../styles/styles';
import { BuilderContextProvider, IBuilderContext } from './context';
import { useDragHandlers } from './dnd';
import { QueryBuilderGroup } from './group';

/** Hosts the model. Edits go through the reducer; each committed edit is exported once and handed to `onChange`. */
export const QueryBuilder: FC<IQueryBuilderProps> = ({ value, onChange, readOnly = false }) => {
  const { styles } = useStyles();
  const { fields, fetchFields } = useQueryBuilder();

  const [tree, setTree] = useState<QueryTree>(() => importFromJsonLogic(value));
  // the last logic this builder emitted; an incoming `value` equal to it is our own echo, not an external change
  const lastEmitted = useRef<JsonLogicFilter | undefined>(value);
  const externalTree = useRef<QueryTree>(tree);

  // properties referenced by the saved filter but not loaded yet (nested containers) are fetched on demand
  useEffect(() => {
    if (value === undefined) return;
    const missing = extractVars(value).filter((path) => findProperty(fields, path) === undefined);
    if (missing.length > 0) fetchFields(missing);
  }, [value, fields, fetchFields]);

  useEffect(() => {
    if (value === lastEmitted.current) return;
    lastEmitted.current = value;
    const next = importFromJsonLogic(value);
    externalTree.current = next;
    setTree(next);
  }, [value]);

  useEffect(() => {
    if (tree === externalTree.current) return;
    const logic = exportToJsonLogic(tree);
    lastEmitted.current = logic;
    onChange?.({ logic, errors: [] });
    // emit per tree change only; a new onChange identity must not re-emit the same tree
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree]);

  const dispatch = useCallback((action: QueryAction): void => {
    setTree((prev) => queryReducer(prev, action));
  }, []);

  const drag = useDragHandlers(tree, dispatch, readOnly);

  const context = useMemo<IBuilderContext>(() => ({ tree, fields, readOnly, dispatch }), [tree, fields, readOnly, dispatch]);
  const hasRules = tree.children.length > 0;
  const rootLabel = tree.conjunction === 'or' ? 'Show any...' : 'Show all...';

  return (
    <BuilderContextProvider value={context}>
      <div className={styles.shaQueryBuilder}>
        <div className={classNames('query-builder-container', hasRules ? 'qb-has-rules' : 'qb-empty')} data-root-logic-label={rootLabel}>
          <div className={classNames('qb-rule-layout', hasRules && 'qb-rule-layout--active')}>
            <div className="sha-query-builder-canvas qb-lite">
              <QueryBuilderGroup group={tree} depth={0} canDelete={false} canDrag={false} drag={drag} />
            </div>
          </div>
        </div>
      </div>
    </BuilderContextProvider>
  );
};
