import { DataContextManagerInstance } from './instance';
import { IRegisterDataContextPayload, SheshaCommonContexts } from './models';

/** A page context as each dynamic page registers it: same `id` on every page, unique `uid` per instance. */
const pageContext = (uid: string, name: string = SheshaCommonContexts.PageContext): IRegisterDataContextPayload =>
  ({
    id: SheshaCommonContexts.PageContext,
    uid,
    name,
    type: 'page',
    getFull: () => ({ owner: uid }),
  }) as unknown as IRegisterDataContextPayload;

describe('DataContextManagerInstance - overlapping page contexts', () => {
  // In-app navigation on React 19: the new page renders (and registers) before the old page's effect cleanups run.
  it('gives the new page its own page context while the old page is still registered', () => {
    const manager = new DataContextManagerInstance('root');
    const tablePage = pageContext('table');
    const detailsPage = pageContext('details');

    manager.registerDataContextOnce(tablePage);
    manager.registerDataContextOnce(detailsPage); // old page not unregistered yet

    expect(manager.getPageContext()?.uid).toBe('details');
  });

  it('does not remove the new page context when the old page cleans up afterwards', () => {
    const manager = new DataContextManagerInstance('root');
    const tablePage = pageContext('table');
    const detailsPage = pageContext('details');

    manager.registerDataContextOnce(tablePage);
    manager.registerDataContextOnce(detailsPage);
    manager.unregisterDataContext(tablePage); // old page's effect cleanup

    expect(manager.getPageContext()?.uid).toBe('details');
  });

  it('ignores updates from the old page once the new page owns the id', () => {
    const manager = new DataContextManagerInstance('root');
    const tablePage = pageContext('table');
    const detailsPage = pageContext('details');

    manager.registerDataContextOnce(tablePage);
    manager.registerDataContextOnce(detailsPage);
    manager.onChangeContext({ ...tablePage, description: 'late update from the old page' });

    expect(manager.getPageContext()?.uid).toBe('details');
    expect(manager.getPageContext()?.description).toBeUndefined();
  });

  it('keeps the existing entry when the same instance re-renders, and removes it on its own cleanup', () => {
    const manager = new DataContextManagerInstance('root');
    const detailsPage = pageContext('details');

    manager.registerDataContextOnce(detailsPage);
    manager.onChangeContext({ ...detailsPage, description: 'updated' });
    manager.registerDataContextOnce(detailsPage); // re-render

    expect(manager.getPageContext()?.description).toBe('updated');

    manager.unregisterDataContext(detailsPage);
    expect(manager.getPageContext()).toBeUndefined();
  });
});
