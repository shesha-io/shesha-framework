import { getDisabledAndReadOnly, isReadOnlyEditMode } from './formComponentApi';

const editable = { disabled: false, readOnly: false };
const readOnly = { disabled: false, readOnly: true };
const disabled = { disabled: true, readOnly: false };

describe('getDisabledAndReadOnly', () => {
  it.each([
    [true, editable],
    ['editable', editable],
    [false, disabled],
    ['disabled', disabled],
    ['readOnly', readOnly],
  ])('maps %j', (mode, expected) => {
    expect(getDisabledAndReadOnly(mode)).toEqual(expected);
  });

  // values returned by JS settings may be any string
  it.each([
    ['edit', editable],
    ['Editable', editable],
    ['EDIT', editable],
    ['readonly', readOnly],
    ['READONLY', readOnly],
    ['unknown', disabled],
  ])('maps calculated value %j', (mode, expected) => {
    expect(getDisabledAndReadOnly(mode)).toEqual(expected);
  });
});

describe('isReadOnlyEditMode', () => {
  it('is true for an explicit read only mode', () => {
    expect(isReadOnlyEditMode('readOnly')).toBe(true);
    expect(isReadOnlyEditMode('readonly')).toBe(true);
  });

  it.each([undefined, 'inherited', 'editable', 'disabled', true, false])('is false for %j', (mode) => {
    expect(isReadOnlyEditMode(mode)).toBe(false);
  });
});
