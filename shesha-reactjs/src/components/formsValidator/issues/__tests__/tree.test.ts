import { FieldValidationError } from '@/interfaces';
import { TreeContext } from '../models';
import { buildGroups, toTreeData } from '../utils';
import errors from './errors.json';

describe('getComponentsChain()', () => {
  it('should validate default settings', () => {
    const typedErrors = errors as FieldValidationError[];
    const root = buildGroups(typedErrors);
    const ctx: TreeContext = { issueByKey: new Map(), keyByIssueKey: new Map() };
    const data = toTreeData(root, ctx);

    expect(data).toBeDefined();
  });
});
