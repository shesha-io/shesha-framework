import { badRequest, notFound } from '../../abp/ajaxResponse';
import { hashPassword } from '../../auth/password';
import { ResourceDefinition } from '../../config/types';
import { UserRow, usersRepo } from '../../db/repositories';
import { GatewayRequestContext } from '../../gateway/native';
import { pagedResult, pickArg } from '../../utils/dto';
import { parseQueryOptions } from '../entityStore';
import { applyJsonLogic, parseFilter } from '../../utils/jsonLogic';
import { CrudAction } from './entityCrud';

/**
 * Generic CRUD bound to the gateway's `users` table.
 *
 * `User` and `UserManagement` are ABP services over the account entity rather than over a
 * configurable one, so they get their own storage kind instead of a row in `entity_rows` —
 * there is already an authoritative table, and duplicating it would let the two disagree about
 * who can log in.
 */

const str = (value: unknown, fallback = ''): string =>
  value === undefined || value === null ? fallback : String(value);

/** `UserDto` / `PersonAccountDto` — the fields the user-management forms and tables read. */
export const toUserDto = (row: UserRow): Record<string, unknown> => ({
  id: row.id,
  userName: row.userName,
  name: row.firstName,
  surname: row.lastName,
  firstName: row.firstName,
  lastName: row.lastName,
  fullName: [row.firstName, row.lastName].filter(Boolean).join(' ') || row.userName,
  emailAddress: row.email,
  email: row.email,
  mobileNumber: null,
  isActive: Boolean(row.isActive),
  personId: row.personId,
  tenantId: row.tenantId,
  roles: [],
  permissions: JSON.parse(row.permissions || '[]') as string[],
});

export const findUserRow = (ctx: GatewayRequestContext): UserRow | undefined => {
  const id = str(pickArg(ctx, 'id', 'Id', 'userId', 'UserId'));
  if (id) return usersRepo.findById(Number(id));
  const userName = str(pickArg(ctx, 'userName', 'UserName', 'username'));
  if (userName) return usersRepo.all().find((row) => row.userName.toLowerCase() === userName.toLowerCase());
  return undefined;
};

export const userCrud = async (
  ctx: GatewayRequestContext,
  _resource: ResourceDefinition,
  action: CrudAction,
): Promise<unknown> => {
  switch (action) {
    case 'get': {
      const row = findUserRow(ctx);
      if (!row) throw notFound(`There is no user with that id`);
      return toUserDto(row);
    }

    case 'getAll': {
      const options = parseQueryOptions(ctx);
      const logic = parseFilter(options.filter);
      let rows = usersRepo.all().map(toUserDto);
      rows = rows.filter((row) => applyJsonLogic(logic, row));
      if (options.quickSearch) {
        const needle = options.quickSearch.toLowerCase();
        rows = rows.filter((row) =>
          [row.userName, row.fullName, row.emailAddress].some((v) => str(v).toLowerCase().includes(needle)),
        );
      }
      const totalCount = rows.length;
      const skip = options.skipCount ?? 0;
      if (skip > 0) rows = rows.slice(skip);
      if (options.maxResultCount !== undefined && options.maxResultCount >= 0) rows = rows.slice(0, options.maxResultCount);
      return pagedResult(rows, totalCount);
    }

    case 'create': {
      const body = ctx.body ?? {};
      const userName = str(body.userName ?? body.username).trim();
      if (!userName) throw badRequest('userName is required');
      if (usersRepo.findByLogin(userName)) throw badRequest(`User '${userName}' already exists`);

      const password = str(body.password) || '123qwe';
      if (body.passwordConfirmation && str(body.passwordConfirmation) !== password) {
        throw badRequest('Password and confirmation do not match');
      }

      usersRepo.upsert({
        userName,
        email: body.emailAddress === undefined ? null : str(body.emailAddress),
        firstName: body.firstName === undefined ? null : str(body.firstName),
        lastName: body.lastName === undefined ? null : str(body.lastName),
        passwordHash: await hashPassword(password),
        permissions: Array.isArray(body.permissions) ? (body.permissions as string[]).map(String) : [],
      });
      const created = usersRepo.findByLogin(userName);
      return created ? toUserDto(created) : null;
    }

    case 'update': {
      const row = findUserRow(ctx);
      if (!row) throw notFound('There is no user with that id');
      const body = ctx.body ?? {};

      usersRepo.upsert({
        userName: row.userName,
        email: body.emailAddress === undefined ? row.email : str(body.emailAddress),
        firstName: body.firstName === undefined ? row.firstName : str(body.firstName),
        lastName: body.lastName === undefined ? row.lastName : str(body.lastName),
        passwordHash: row.passwordHash,
        personId: row.personId,
        tenantId: row.tenantId,
        permissions: Array.isArray(body.permissions) ? (body.permissions as string[]).map(String) : usersRepo.permissionsOf(row),
      });
      return toUserDto(usersRepo.findById(row.id) as UserRow);
    }

    case 'delete': {
      const row = findUserRow(ctx);
      if (!row) throw notFound('There is no user with that id');
      // No hard delete on accounts: deactivating keeps audit trails and history resolvable,
      // which is what shesha-core's soft delete achieves for the same reason.
      usersRepo.setActive(row.id, false);
      return null;
    }

    default:
      throw badRequest(`Unsupported CRUD action '${action}'`);
  }
};
