import { badRequest, forbidden, notFound, unauthorized } from '../../abp/ajaxResponse';
import { hashPassword, verifyPassword } from '../../auth/password';
import { hasPermission } from '../../auth/permissions';
import { settingsRepo, otpRepo, UserRow, usersRepo } from '../../db/repositories';
import { GatewayRequestContext } from '../../gateway/native';
import { pickArg } from '../../utils/dto';
import { checkPin, consumePin, issuePin, OTP_SEND_TYPE, pinByToken } from './otp';
import { BehaviourHandler } from './types';

/**
 * The `User` / `UserManagement` actions that are not plain CRUD.
 *
 * shesha-core splits password recovery across three collaborators: `UserAppService` owns the
 * account, `OtpAppService` owns the pin, and the security settings decide which recovery methods
 * are on offer. The same split is kept here — pins come from `behaviours/otp`, and the method list
 * is derived from the settings rather than hard-coded, so turning a method off in the Security
 * Settings form removes it from `GetUserPasswordResetOptions` exactly as it does in core.
 */

/** `RefListPasswordResetMethods`: EmailLink = 2, SmsOtp = 4, SecurityQuestions = 8. */
export const RESET_METHOD = { None: 0, EmailLink: 2, SmsOtp: 4, SecurityQuestions: 8 } as const;

const str = (value: unknown, fallback = ''): string =>
  value === undefined || value === null ? fallback : String(value);

const num = (value: unknown, fallback = 0): number => {
  const n = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
};

const bool = (value: unknown, fallback: boolean): boolean => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

/** `StringHelper.MaskEmail(usernameChars: 5, domainChars: 7)`. */
export const maskEmail = (email: string): string => {
  const at = email.indexOf('@');
  if (at < 0) return email;
  let username = email.slice(0, at);
  let domain = email.slice(at + 1);
  if (username.length > 5) username = username.slice(0, 5) + '*'.repeat(username.length - 5);
  if (domain.length > 7) domain = '*'.repeat(domain.length - 7) + domain.slice(-7);
  return `${username}@${domain}`;
};

/** `StringHelper.MaskMobileNo` — every digit but the last four becomes `*`. */
export const maskMobileNo = (mobileNo: string): string => {
  if (!mobileNo) return mobileNo;
  const head = mobileNo.slice(0, Math.max(0, mobileNo.length - 4));
  return head.replace(/\d/g, '*') + mobileNo.slice(-4);
};

export const requireUser = (ctx: GatewayRequestContext): UserRow => {
  if (!ctx.user) throw unauthorized('Please log in before attempting this operation');
  const row = usersRepo.findById(Number(ctx.user.sub));
  if (!row) throw unauthorized('The authenticated user no longer exists');
  return row;
};

export const findUserByLogin = (login: string): UserRow | undefined => {
  const value = str(login).trim();
  if (!value) return undefined;
  return usersRepo.all().find((row) => row.userName.toLowerCase() === value.toLowerCase());
};

interface SecuritySettings {
  useResetPasswordViaEmailLink: boolean;
  useResetPasswordViaSmsOtp: boolean;
  useResetPasswordViaSecurityQuestions: boolean;
  resetPasswordSmsOtpLifetime: number;
}

/** `Shesha.SecuritySettings`, read the same way the Security Settings form writes it. */
const securitySettings = (): SecuritySettings => {
  const stored = settingsRepo.parseValue(settingsRepo.get('Shesha.SecuritySettings', 'Shesha', ''));
  const value = stored && typeof stored === 'object' ? (stored as Record<string, unknown>) : {};
  return {
    useResetPasswordViaEmailLink: bool(value.useResetPasswordViaEmailLink, true),
    useResetPasswordViaSmsOtp: bool(value.useResetPasswordViaSmsOtp, true),
    useResetPasswordViaSecurityQuestions: bool(value.useResetPasswordViaSecurityQuestions, false),
    resetPasswordSmsOtpLifetime: num(value.resetPasswordSmsOtpLifetime, 300),
  };
};

/**
 * The gateway stores no security questions, so the method is only offered when a user actually has
 * them — never. Kept as a function so the shape mirrors `UserAppService` line for line.
 */
const hasSecurityQuestions = (_user: UserRow): boolean => false;

/** The recovery methods available to `user`, as the bit flags `SupportedPasswordResetMethods` uses. */
const supportedMethods = (user: UserRow, settings: SecuritySettings): number[] => {
  const methods: number[] = [];
  if (settings.useResetPasswordViaEmailLink && user.email) methods.push(RESET_METHOD.EmailLink);
  if (settings.useResetPasswordViaSmsOtp) methods.push(RESET_METHOD.SmsOtp);
  if (settings.useResetPasswordViaSecurityQuestions && hasSecurityQuestions(user)) {
    methods.push(RESET_METHOD.SecurityQuestions);
  }
  return methods;
};

const requireMethod = (user: UserRow, method: number): SecuritySettings => {
  const settings = securitySettings();
  const supported = supportedMethods(user, settings);
  if (!supported.length) throw badRequest('User has no supported password reset methods');
  if (!supported.includes(method)) {
    throw badRequest('User is not allowed to reset password using the selected method');
  }
  return settings;
};

/**
 * `ResetPasswordVerifyOtpResponse` — the shape all three verification endpoints return.
 * `token` is what `ResetPasswordUsingToken` later presents.
 */
interface VerifyResponse {
  isSuccess: boolean;
  errorMessage: string | null;
  token: string | null;
  username: string | null;
}

const verifyFailure = (message: string): VerifyResponse => ({
  isSuccess: false,
  errorMessage: message,
  token: null,
  username: null,
});

/** Issues a recovery pin for `user` and returns the operation id used as the reset token. */
const issueResetPin = async (
  user: UserRow,
  sendType: number,
  sendTo: string,
  lifetime: number,
): Promise<string> => {
  if (!sendTo) throw badRequest('The user has no contact details to send a one time pin to');
  const issued = await issuePin({
    sendTo,
    sendType,
    recipientType: 'Shesha.Domain.User',
    recipientId: String(user.id),
    actionType: 'password restore',
    username: user.userName,
    lifetimeSeconds: lifetime,
  });
  return issued.operationId;
};

/** GET /api/services/app/User/GetUserPasswordResetOptions?username= */
export const getUserPasswordResetOptions: BehaviourHandler = (ctx) => {
  const username = str(pickArg(ctx, 'username', 'userName', 'Username'));
  const user = findUserByLogin(username);
  if (!user) throw badRequest('Your username is not recognised');

  const settings = securitySettings();
  const options: { method: number; prompt: string; maskedIdentifier: string | null }[] = [];

  for (const method of supportedMethods(user, settings)) {
    if (method === RESET_METHOD.EmailLink && user.email) {
      const masked = maskEmail(user.email);
      options.push({ method, prompt: `Email a link to ${masked}`, maskedIdentifier: masked });
    } else if (method === RESET_METHOD.SmsOtp) {
      // No mobile number is stored, so the prompt falls back to the masked username.
      const masked = maskMobileNo(user.userName);
      options.push({ method, prompt: `SMS an OTP to ${masked}`, maskedIdentifier: masked });
    } else if (method === RESET_METHOD.SecurityQuestions) {
      options.push({ method, prompt: 'Answer security questions', maskedIdentifier: null });
    }
  }
  return options;
};

/** GET /api/services/app/User/GetSecurityQuestions?username= */
export const getSecurityQuestions: BehaviourHandler = (ctx) => {
  const user = findUserByLogin(str(pickArg(ctx, 'username', 'userName', 'Username')));
  if (!user) throw badRequest('Your username is not recognised');
  requireMethod(user, RESET_METHOD.SecurityQuestions);
  return [];
};

/** POST /api/services/app/User/SendEmailLink?username= */
export const sendEmailLink: BehaviourHandler = async (ctx) => {
  const user = findUserByLogin(str(pickArg(ctx, 'username', 'userName', 'Username')));
  if (!user) throw badRequest('Your username is not recognised');
  requireMethod(user, RESET_METHOD.EmailLink);

  // The link carries a base64 username plus the token, matching what `ValidateResetCode` decodes.
  await issueResetPin(user, OTP_SEND_TYPE.EmailLink, str(user.email), 3600);
  return true;
};

/** POST /api/services/app/User/SendSMSOTP?username= */
export const sendSmsOtp: BehaviourHandler = async (ctx) => {
  const user = findUserByLogin(str(pickArg(ctx, 'username', 'userName', 'Username')));
  if (!user) throw badRequest('Your username is not recognised');
  const settings = requireMethod(user, RESET_METHOD.SmsOtp);

  await issueResetPin(user, OTP_SEND_TYPE.Sms, user.userName, settings.resetPasswordSmsOtpLifetime);
  return true;
};

/** POST /api/services/app/User/ResetPasswordSendOtp?mobileNo= */
export const resetPasswordSendOtp: BehaviourHandler = async (ctx) => {
  const mobileNo = str(pickArg(ctx, 'mobileNo', 'MobileNo'));
  if (!mobileNo) throw badRequest('`mobileNo` is required');
  const settings = securitySettings();

  const operationId = await issuePin({
    sendTo: mobileNo,
    sendType: OTP_SEND_TYPE.Sms,
    actionType: 'password restore',
    lifetimeSeconds: settings.resetPasswordSmsOtpLifetime,
  });
  return { operationId: operationId.operationId };
};

/**
 * POST /api/services/app/User/ValidateResetCode — `{ code, username, method }`.
 * For an email link the username arrives base64-encoded (shesha-core decodes it the same way).
 */
export const validateResetCode: BehaviourHandler = async (ctx) => {
  const body = ctx.body ?? {};
  const method = num(pickArg(ctx, 'method', 'Method'), RESET_METHOD.SmsOtp);
  const rawUsername = str(pickArg(ctx, 'username', 'userName', 'Username'));
  const code = str(pickArg(ctx, 'code', 'Code'));

  let username = rawUsername;
  if (method === RESET_METHOD.EmailLink && rawUsername) {
    try {
      username = Buffer.from(rawUsername, 'base64').toString('utf-8');
    } catch {
      username = rawUsername;
    }
  }

  const user = findUserByLogin(username);
  if (!user) throw badRequest('Your username is not recognised');
  requireMethod(user, method);

  // An email link carries the operation id itself; an SMS OTP carries the pin and the operation is
  // the one last issued to this user (core keeps that id on `User.PasswordResetCode`). Both paths
  // land on the same `otp_operations` row.
  const presentedToken = pinByToken(code);
  const operationId = presentedToken?.operationId ?? otpRepo.latestByUsername(user.userName)?.operationId;
  if (!operationId) {
    const message = method === RESET_METHOD.SmsOtp ? 'OTP Verification failed' : 'Email link verification failed';
    return verifyFailure(message);
  }

  const result = presentedToken
    ? { isSuccess: true, errorMessage: null as string | null }
    : await checkPin(operationId, code);
  if (!result.isSuccess) return verifyFailure(result.errorMessage ?? 'Verification failed');

  return { isSuccess: true, errorMessage: null, token: operationId, username: user.userName } satisfies VerifyResponse;
};

/** POST /api/services/app/User/ResetPasswordVerifyOtp — `{ operationId, pin, mobileNo }`. */
export const resetPasswordVerifyOtp: BehaviourHandler = async (ctx) => {
  const operationId = str(pickArg(ctx, 'operationId', 'OperationId'));
  const pin = str(pickArg(ctx, 'pin', 'Pin'));
  if (!operationId) throw badRequest('`operationId` is required');

  const result = await checkPin(operationId, pin);
  if (!result.isSuccess) return verifyFailure(result.errorMessage ?? 'OTP Verification failed');

  // Verification hands out the token the actual reset must present.
  return { isSuccess: true, errorMessage: null, token: operationId, username: null } satisfies VerifyResponse;
};

/** POST /api/services/app/User/ValidateSecurityQuestions — `{ username, submittedQuestions[] }`. */
export const validateSecurityQuestions: BehaviourHandler = (ctx) => {
  const user = findUserByLogin(str(pickArg(ctx, 'username', 'userName', 'Username')));
  if (!user) throw badRequest('Your username is not recognised');
  requireMethod(user, RESET_METHOD.SecurityQuestions);
  return verifyFailure('User has not set the security questions');
};

/** POST /api/services/app/User/ResetPasswordUsingToken — `{ username, token, newPassword }`. */
export const resetPasswordUsingToken: BehaviourHandler = async (ctx) => {
  const user = findUserByLogin(str(pickArg(ctx, 'username', 'userName', 'Username')));
  if (!user) throw badRequest('User not found');

  const token = str(pickArg(ctx, 'token', 'Token'));
  if (!pinByToken(token)) {
    throw badRequest('Your token is invalid or has expired, try to reset password again');
  }

  const newPassword = str(pickArg(ctx, 'newPassword', 'NewPassword'));
  if (!newPassword) throw badRequest('`newPassword` is required');

  usersRepo.setPasswordHash(user.id, await hashPassword(newPassword));
  consumePin(token);
  return true;
};

/** POST /api/services/app/User/ChangePassword — `ChangePasswordDto{currentPassword,newPassword}`. */
export const changePassword: BehaviourHandler = async (ctx) => {
  const user = requireUser(ctx);
  const currentPassword = str(pickArg(ctx, 'currentPassword', 'CurrentPassword'));
  const newPassword = str(pickArg(ctx, 'newPassword', 'NewPassword'));

  if (!currentPassword || !newPassword) throw badRequest('Both `currentPassword` and `newPassword` are required');
  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    // `UserAppService.ChangePasswordAsync` re-authenticates rather than comparing hashes, so the
    // message it produces is about the login attempt, not the field.
    throw forbidden(
      "Your 'Existing Password' did not match the one on record.  Please try again or contact an administrator for assistance in resetting your password.",
    );
  }

  usersRepo.setPasswordHash(user.id, await hashPassword(newPassword));
  return true;
};

/**
 * POST /api/services/app/User/ResetPassword — `ResetPasswordDto{userId,newPassword,
 * requireChangePassword}`. This is the administrator path (`user-reset-password` form); the
 * self-service one is `ResetPasswordUsingToken`.
 */
export const resetPassword: BehaviourHandler = async (ctx) => {
  const current = requireUser(ctx);
  if (!hasPermission(usersRepo.permissionsOf(current), 'users:resetPassword')) {
    throw forbidden('You are not authorized to reset passwords.');
  }

  const userId = num(pickArg(ctx, 'userId', 'UserId', 'id', 'Id'), NaN);
  if (!Number.isFinite(userId)) throw badRequest('`userId` is required');

  const target = usersRepo.findById(userId);
  if (!target) throw notFound(`There is no user with id '${userId}'`);

  const newPassword = str(pickArg(ctx, 'newPassword', 'NewPassword'));
  if (!newPassword) throw badRequest('`newPassword` is required');

  usersRepo.setPasswordHash(target.id, await hashPassword(newPassword));
  // Core reactivates the account and clears the lockout as part of the reset — an administrator
  // resetting a password is implicitly unlocking the user.
  if (!target.isActive) usersRepo.setActive(target.id, true);
  return true;
};

/** POST /api/services/app/User/ActivateUser?userId= */
export const activateUser: BehaviourHandler = (ctx) => {
  requireUser(ctx);
  const userId = num(pickArg(ctx, 'userId', 'UserId', 'id', 'Id'), NaN);
  const target = Number.isFinite(userId) ? usersRepo.findById(userId) : undefined;
  if (!target) throw notFound(`There is no user with id '${userId}'`);
  if (target.isActive) throw badRequest('User is already active');

  usersRepo.setActive(target.id, true);
  return true;
};

/** POST /api/services/app/User/InactivateUser?userId= */
export const inactivateUser: BehaviourHandler = (ctx) => {
  requireUser(ctx);
  const userId = num(pickArg(ctx, 'userId', 'UserId', 'id', 'Id'), NaN);
  const target = Number.isFinite(userId) ? usersRepo.findById(userId) : undefined;
  if (!target) throw notFound(`There is no user with id '${userId}'`);
  if (!target.isActive) throw badRequest('User is already inactive');

  usersRepo.setActive(target.id, false);
  return true;
};

/** `PersonAccountDto` — what `UserManagement/Create` returns after creating the account. */
const toPersonAccountDto = (row: UserRow): Record<string, unknown> => ({
  id: row.personId ?? String(row.id),
  userName: row.userName,
  firstName: row.firstName,
  lastName: row.lastName,
  fullName: [row.firstName, row.lastName].filter(Boolean).join(' ') || row.userName,
  mobileNumber: null,
  emailAddress: row.email,
  isContractor: false,
  primaryOrganisation: null,
  typeOfAccount: null,
  goToUrlAfterRegistration: null,
  userId: row.id,
});

/**
 * POST /api/services/app/UserManagement/Create — `CreatePersonAccountDto`.
 * Registration and the user-management "create" form share this endpoint; `UserManagementAppService`
 * validates the pair, so a mismatched confirmation is rejected here too.
 */
export const userManagementCreate: BehaviourHandler = async (ctx) => {
  const body = ctx.body ?? {};
  const password = str(body.password ?? body.Password);
  const confirmation = str(body.passwordConfirmation ?? body.PasswordConfirmation);
  if (!password) throw badRequest('`password` is required');
  if (password !== confirmation) throw badRequest('Password and confirmation do not match');

  const firstName = str(body.firstName ?? body.FirstName).trim();
  const lastName = str(body.lastName ?? body.LastName).trim();
  if (!firstName) throw badRequest('First Name is mandatory');
  if (!lastName) throw badRequest('Last Name is mandatory');

  const emailAddress = str(body.emailAddress ?? body.EmailAddress).trim();
  if (!emailAddress) throw badRequest('Email Address is mandatory');

  const settings = settingsRepo.parseValue(settingsRepo.get('Shesha.UserManagement', 'Shesha', ''));
  const emailAsUsername = bool(
    settings && typeof settings === 'object' ? (settings as Record<string, unknown>).userEmailAsUsername : false,
    false,
  );
  const userName = emailAsUsername ? emailAddress : str(body.userName ?? body.UserName).trim();
  if (!userName) throw badRequest('Username is mandatory');

  if (usersRepo.findByLogin(userName)) throw badRequest(`User '${userName}' already exists`);
  if (usersRepo.all().some((row) => str(row.email).toLowerCase() === emailAddress.toLowerCase())) {
    throw badRequest('Email address already in use');
  }

  usersRepo.upsert({
    userName,
    email: emailAddress,
    firstName,
    lastName,
    passwordHash: await hashPassword(password),
    permissions: [],
  });

  const created = usersRepo.findByLogin(userName);
  return created ? toPersonAccountDto(created) : null;
};
