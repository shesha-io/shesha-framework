import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { DEFAULT_ACTION_COLUMN_WIDTH, IDataTableUserConfig } from './contexts';
import { prepareColumn, prepareTableColumn } from './utils';

const actionColumn = (extra: Partial<IConfigurableColumnsProps> = {}): IConfigurableColumnsProps =>
  ({
    id: 'act1',
    caption: 'Edit',
    columnType: 'action',
    sortOrder: 0,
    itemType: 'item',
    isVisible: true,
    icon: 'EditOutlined',
    actionConfiguration: undefined,
    ...extra,
  }) as IConfigurableColumnsProps;

const userConfigWithWidth = (width: number): IDataTableUserConfig =>
  ({ quickSearch: '', tableSorting: [], columns: [{ id: 'act1', width }] }) as IDataTableUserConfig;

describe.each([
  ['prepareColumn', (column: IConfigurableColumnsProps, userConfig?: IDataTableUserConfig) => prepareColumn(column, [], userConfig)],
  ['prepareTableColumn', (column: IConfigurableColumnsProps, userConfig?: IDataTableUserConfig) => prepareTableColumn(column, [], userConfig)],
])('%s - action column widths', (_name, prepare) => {
  it('defaults to a strict icon width when nothing is configured', () => {
    const result = prepare(actionColumn());
    expect(result?.minWidth).toBe(DEFAULT_ACTION_COLUMN_WIDTH);
    expect(result?.maxWidth).toBe(DEFAULT_ACTION_COLUMN_WIDTH);
  });

  it('passes designer-configured widths through untouched', () => {
    const result = prepare(actionColumn({ minWidth: 60, maxWidth: 90 }));
    expect(result?.minWidth).toBe(60);
    expect(result?.maxWidth).toBe(90);
  });

  it('preserves a user-resized width instead of clamping it to the default', () => {
    const result = prepare(actionColumn(), userConfigWithWidth(80));
    expect(result?.width).toBe(80);
    expect(result?.minWidth).toBe(DEFAULT_ACTION_COLUMN_WIDTH);
    expect(result?.maxWidth).toBeUndefined();
  });
});
