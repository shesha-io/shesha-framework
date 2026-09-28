import { randomInt } from 'crypto';
import { badRequest, notFound } from '../../abp/ajaxResponse';
import { config } from '../../config';
import { hashPassword, verifyPassword } from '../../auth/password';
import { otpRepo, OtpRow } from '../../db/repositories';
import { newGuid } from '../../utils/guid';
import { pickArg } from '../../utils/dto';
import { BehaviourHandler } from './types';

/**
 * One-time pins.
 *
 * `OtpAppService` is the only place shesha-core mints and checks pins, and the user password-reset
 * flows (`SendSMSOTP`, `SendEmailLink`, `ValidateResetCode`) are thin wrappers over it. Both are
 * served from the same functions here so a pin issued by one path verifies through the other —
 * which is what the reset-password wizard relies on.
 *
 * There is no SMS/email transport in the gateway, so the pin is logged and (outside production)
 * echoed in the `SendPin` result. That keeps the OTP screens exercisable end to end.
 */

/** `OtpSendType`: Sms = 1, Email = 2, EmailLink = 4. */
export const OTP_SEND_TYPE = { Sms: 1, Email: 2, EmailLink: 4 } as const;

const DEFAULT_LIFETIME_SECONDS = 300;
const MAX_ATTEMPTS = 5;

const str = (value: unknown, fallback = ''): string =>
  value === undefined || value === null ? fallback : String(value);

const toInt = (value: unknown, fallback: number): number => {
  const n = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
};

const isExpired = (row: OtpRow): boolean => Date.parse(row.expiresAt) <= Date.now();

export interface SendPinOptions {
  sendTo: string;
  sendType: number;
  recipientType?: string | null;
  recipientId?: string | null;
  actionType?: string | null;
  username?: string | null;
  lifetimeSeconds?: number;
}

export interface SendPinResult {
  operationId: string;
  sentTo: string;
  /** Development only — the gateway has no SMS/email transport. */
  pin?: string;
}

/**
 * Mints a pin, stores its hash and "sends" it.
 * Exported so the user reset flows can issue a pin without going through the HTTP layer.
 */
export const issuePin = async (options: SendPinOptions): Promise<SendPinResult> => {
  if (!options.sendTo) throw badRequest('`sendTo` is required');

  const operationId = newGuid();
  const pin = String(randomInt(0, 1_000_000)).padStart(6, '0');
  const lifetime = options.lifetimeSeconds && options.lifetimeSeconds > 0
    ? options.lifetimeSeconds
    : DEFAULT_LIFETIME_SECONDS;

  otpRepo.add({
    operationId,
    sendTo: options.sendTo,
    sendType: String(options.sendType),
    recipientType: options.recipientType ?? null,
    recipientId: options.recipientId ?? null,
    actionType: options.actionType ?? null,
    pinHash: await hashPassword(pin),
    username: options.username ?? null,
    expiresAt: new Date(Date.now() + lifetime * 1000).toISOString(),
  });

  // eslint-disable-next-line no-console
  console.info(`[otp] pin for ${options.sendTo} (${operationId}): ${pin}`);

  return config.nodeEnv === 'production'
    ? { operationId, sentTo: options.sendTo }
    : { operationId, sentTo: options.sendTo, pin };
};

export interface VerifyPinResult {
  isSuccess: boolean;
  errorMessage: string | null;
}

/**
 * Checks a pin. Returns the ABP `IVerifyPinResponse` rather than throwing, because shesha-core
 * reports a wrong pin as `isSuccess: false` and the OTP screen renders `errorMessage` inline.
 */
export const checkPin = async (operationId: string, pin: string): Promise<VerifyPinResult> => {
  const row = otpRepo.get(operationId);
  if (!row) return { isSuccess: false, errorMessage: 'OTP operation not found' };
  if (isExpired(row)) return { isSuccess: false, errorMessage: 'The one time pin has expired' };
  if (row.isVerified) return { isSuccess: false, errorMessage: 'The one time pin has already been used' };

  const attempts = otpRepo.recordAttempt(operationId);
  if (attempts > MAX_ATTEMPTS) {
    return { isSuccess: false, errorMessage: 'Too many attempts. Please request a new pin' };
  }

  if (!(await verifyPassword(pin, row.pinHash))) {
    return { isSuccess: false, errorMessage: 'The one time pin provided is invalid' };
  }

  otpRepo.markVerified(operationId);
  return { isSuccess: true, errorMessage: null };
};

/** POST /api/services/app/Otp/SendPin — `SendPinInput` -> `ISendPinResponse`. */
export const sendPin: BehaviourHandler = async (ctx) => {
  const body = ctx.body ?? {};
  return issuePin({
    sendTo: str(pickArg(ctx, 'sendTo', 'SendTo')),
    sendType: toInt(pickArg(ctx, 'sendType', 'SendType'), OTP_SEND_TYPE.Sms),
    recipientType: body.recipientType === undefined ? null : str(body.recipientType),
    recipientId: body.recipientId === undefined ? null : str(body.recipientId),
    actionType: body.actionType === undefined ? null : str(body.actionType),
    username: body.username === undefined ? null : str(body.username),
    lifetimeSeconds: toInt(body.lifetime, 0),
  });
};

/** POST /api/services/app/Otp/ResendPin?operationId= — re-issues against the same recipient. */
export const resendPin: BehaviourHandler = async (ctx) => {
  const operationId = str(pickArg(ctx, 'operationId', 'OperationId'));
  const previous = otpRepo.get(operationId);
  if (!previous) throw notFound(`There is no OTP operation '${operationId}'`);

  const issued = await issuePin({
    sendTo: previous.sendTo,
    sendType: toInt(previous.sendType, OTP_SEND_TYPE.Sms),
    recipientType: previous.recipientType,
    recipientId: previous.recipientId,
    actionType: previous.actionType,
    username: previous.username,
  });
  otpRepo.remove(operationId);
  return issued;
};

/** POST /api/services/app/Otp/VerifyPin — `VerifyPinInput` -> `IVerifyPinResponse`. */
export const verifyPin: BehaviourHandler = async (ctx) => {
  const operationId = str(pickArg(ctx, 'operationId', 'OperationId'));
  const pin = str(pickArg(ctx, 'pin', 'Pin'));

  // The reset wizard only knows the username at this point, so fall back to its latest pin.
  const resolved = operationId || str(otpRepo.latestByUsername(str(pickArg(ctx, 'username', 'UserName')))?.operationId);
  if (!resolved) throw badRequest('An `operationId` is required');

  return checkPin(resolved, pin);
};

/** Resolves the pin row a reset token refers to (the token *is* the operation id). */
export const pinByToken = (token: string): OtpRow | undefined => {
  const row = otpRepo.get(token);
  return row && !isExpired(row) ? row : undefined;
};

export const consumePin = (operationId: string): void => otpRepo.remove(operationId);
