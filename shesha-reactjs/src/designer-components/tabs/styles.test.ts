import { cornersFromCss } from './styles';

describe('cornersFromCss', () => {
  it('expands one to four values in CSS order', () => {
    expect(cornersFromCss(17)).toEqual({ topLeft: '17px', topRight: '17px', bottomRight: '17px', bottomLeft: '17px' });
    expect(cornersFromCss('1px 2px')).toEqual({ topLeft: '1px', topRight: '2px', bottomRight: '1px', bottomLeft: '2px' });
    expect(cornersFromCss('1px 2px 3px')).toEqual({ topLeft: '1px', topRight: '2px', bottomRight: '3px', bottomLeft: '2px' });
    expect(cornersFromCss('1px 2px 3px 4px')).toEqual({ topLeft: '1px', topRight: '2px', bottomRight: '3px', bottomLeft: '4px' });
  });

  it('keeps a CSS function whole, spaces and slashes included', () => {
    expect(cornersFromCss('calc(8px + 2px) 0 calc(100% / 4) 1px')).toEqual({
      topLeft: 'calc(8px + 2px)', topRight: '0', bottomRight: 'calc(100% / 4)', bottomLeft: '1px',
    });
  });

  it('ignores the elliptical part after a slash', () => {
    expect(cornersFromCss('10px 5px / 20px')).toEqual({ topLeft: '10px', topRight: '5px', bottomRight: '10px', bottomLeft: '5px' });
  });

  it('is undefined when nothing is set', () => {
    expect(cornersFromCss(undefined)).toBeUndefined();
    expect(cornersFromCss('')).toBeUndefined();
    expect(cornersFromCss('   ')).toBeUndefined();
  });
});
