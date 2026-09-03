import { IModelMetadata, IPropertyMetadata } from '@/interfaces/metadata';
import { DataTypes } from '@/interfaces/dataTypes';
import {
  MAX_NUMBER_OF_FETCH_COLS,
  SUPPORTED_FETCH_DATA_TYPES,
  calculateDefaultColumns,
  filterPropertiesBySupportedTypes,
} from './utils';

const prop = (path: string, dataType: string, extra: Partial<IPropertyMetadata> = {}): IPropertyMetadata =>
  ({ path, dataType, ...extra }) as IPropertyMetadata;

// mirrors SheshaFunctionalTests.MembershipPayment, the entity behind the reported blank `Payment Type`
const membershipPayment: IPropertyMetadata[] = [
  prop('id', DataTypes.guid),
  prop('amount', DataTypes.number),
  prop('paymentDate', DataTypes.dateTime),
  prop('paymentType', DataTypes.referenceListItem, { referenceListName: 'PaymentTypes' }),
  prop('member', DataTypes.entityReference, { entityType: 'Shesha.Domain.Person' }),
  prop('attachments', DataTypes.array, { dataFormat: 'child-entity' }),
  prop('extra', DataTypes.object),
  prop('creationTime', DataTypes.dateTime, { isFrameworkRelated: true }),
];

const asMetadata = (properties: IPropertyMetadata[]): IModelMetadata =>
  ({ entityType: 'SheshaFunctionalTests.MembershipPayment', properties }) as IModelMetadata;

const pathsOf = (properties: IPropertyMetadata[]): string[] => properties.map((p) => p.path);

describe('filterPropertiesBySupportedTypes', () => {
  it('keeps reference lists but drops entity references by default (grid columns)', () => {
    const result = pathsOf(filterPropertiesBySupportedTypes(membershipPayment));

    expect(result).toContain('amount');
    expect(result).toContain('paymentDate');
    expect(result).toContain('paymentType');
    expect(result).not.toContain('member');
  });

  it('keeps reference lists and entity references for the fetch set', () => {
    const result = pathsOf(filterPropertiesBySupportedTypes(membershipPayment, SUPPORTED_FETCH_DATA_TYPES));

    expect(result).toContain('paymentType');
    expect(result).toContain('member');
  });

  it('still excludes collections and nested objects from the fetch set', () => {
    const result = pathsOf(filterPropertiesBySupportedTypes(membershipPayment, SUPPORTED_FETCH_DATA_TYPES));

    // collections of entities break ProjectionHelper on the back-end (issue #4961)
    expect(result).not.toContain('attachments');
    // nested objects need dot-notation paths a flat property list cannot produce
    expect(result).not.toContain('extra');
  });
});

describe('calculateDefaultColumns', () => {
  it('registers paymentType when called with the fetch options', async () => {
    const columns = await calculateDefaultColumns(asMetadata(membershipPayment), {
      supportedDataTypes: SUPPORTED_FETCH_DATA_TYPES,
      maxColumns: MAX_NUMBER_OF_FETCH_COLS,
    });

    expect(columns.map((c) => c.propertyName)).toContain('paymentType');
  });

  it('includes paymentType with the default (grid) options', async () => {
    const columns = await calculateDefaultColumns(asMetadata(membershipPayment));

    expect(columns.map((c) => c.propertyName)).toContain('paymentType');
  });

  it('excludes framework-related and id properties regardless of the type set', async () => {
    const columns = await calculateDefaultColumns(asMetadata(membershipPayment), {
      supportedDataTypes: SUPPORTED_FETCH_DATA_TYPES,
    });
    const names = columns.map((c) => c.propertyName);

    expect(names).not.toContain('id');
    expect(names).not.toContain('creationTime');
  });

  it('applies the supplied column limit and reports what it dropped', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const many = Array.from({ length: 5 }, (_, i) => prop(`field${i}`, DataTypes.string));

    const columns = await calculateDefaultColumns(asMetadata(many), { maxColumns: 3 });

    expect(columns).toHaveLength(3);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('field3, field4'));
    warn.mockRestore();
  });

  it('supports a properties loader', async () => {
    const metadata = {
      entityType: 'SheshaFunctionalTests.MembershipPayment',
      properties: () => Promise.resolve(membershipPayment),
    } as unknown as IModelMetadata;

    const columns = await calculateDefaultColumns(metadata, { supportedDataTypes: SUPPORTED_FETCH_DATA_TYPES });

    expect(columns.map((c) => c.propertyName)).toContain('paymentType');
  });
});
