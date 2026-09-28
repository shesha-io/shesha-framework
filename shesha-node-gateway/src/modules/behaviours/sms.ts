import { BehaviourHandler } from './types';

/**
 * `api/Sms/Gateways` — the dropdown of SMS providers the SMS settings page offers.
 *
 * shesha-core builds this by reflecting over every registered `ISmsGateway`, so the list is
 * "whatever is compiled in" rather than configured data. The gateway cannot reflect over CLR
 * types, so it declares the same two providers core ships (`ClickatellSmsGateway` and
 * `NullSmsGateway`) with their real `[ClassUid]` values: the uid is what gets persisted into
 * `Shesha.SmsSettings`, so inventing one would silently break the setting for anyone migrating
 * back to the .NET backend.
 *
 * `api/Sms/Test` is deliberately not implemented — it would have to fabricate a `SendStatus` for
 * a send that never happened, so it falls through to the upstream instead.
 */

interface SmsGatewayDto {
  uid: string;
  alias: string;
  name: string;
  description: string | null;
}

/** `[Display(Name = ...)]`; `SmsUtils.GetGatewayAlias` is that name with the spaces removed. */
const GATEWAYS: SmsGatewayDto[] = [
  {
    uid: 'fb8e8757-d831-41a3-925f-fd5c5088ef9b',
    alias: 'Clickatell',
    name: 'Clickatell',
    description: null,
  },
  {
    uid: '648fa648-0673-4bf1-a3ca-ecdd454e3afc',
    alias: 'Disabled',
    name: 'Disabled',
    description: null,
  },
];

/** GET /api/Sms/Gateways — `SmsGatewaysAppService.GetAll()`, ordered by name and anonymous. */
export const gateways: BehaviourHandler = () =>
  [...GATEWAYS].sort((a, b) => a.name.localeCompare(b.name));
