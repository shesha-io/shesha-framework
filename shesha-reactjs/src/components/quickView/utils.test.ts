import moment from 'moment';
import { getQuickViewInitialValues } from './utils';

vi.mock('antd', () => ({ Spin: () => null }));
vi.mock('@/utils/metadata', () => ({
  getDataProperty: (_properties: unknown[], _name: string, key: string) =>
    key === 'dataType' ? 'date-time' : 'DD/MM/YYYY HH:mm:ss.SSS',
}));

describe('getQuickViewInitialValues date-time formatting', () => {
  it.each([
    ['2004-12-01T09:05:30.1234567', '01/12/2004 09:05:30.123'],
    ['2004-12-01T09:05:30Z', moment.utc('2004-12-01T09:05:30Z').local().format('DD/MM/YYYY HH:mm:ss.SSS')],
    ['2004-12-01T11:05:30+02:00', moment.utc('2004-12-01T09:05:30Z').local().format('DD/MM/YYYY HH:mm:ss.SSS')],
    ['2004-12-01T04:05:30-0500', moment.utc('2004-12-01T09:05:30Z').local().format('DD/MM/YYYY HH:mm:ss.SSS')],
    ['2004-12-01T11:05:30.123+02:00', moment.utc('2004-12-01T09:05:30.123Z').local().format('DD/MM/YYYY HH:mm:ss.SSS')],
    ['20041201T090530.123Z', moment.utc('2004-12-01T09:05:30.123Z').local().format('DD/MM/YYYY HH:mm:ss.SSS')],
  ])('formats the entire timestamp %s', (timestamp, expected) => {
    expect(getQuickViewInitialValues({ createdAt: `Created ${timestamp} by admin` }, []))
      .toEqual({ createdAt: `Created ${expected} by admin` });
  });
});
