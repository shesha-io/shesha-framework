import { GatewayRequestContext } from '../../gateway/native';
import { ResourceDefinition } from '../../config/types';

/**
 * A named behaviour: the part of a resource that cannot be derived from its storage.
 *
 * The resource router handles `Get`/`GetAll`/`Create`/`Update`/`Delete` generically for any
 * resource; everything else (a tree projection, a password reset, an OTP send) is a behaviour,
 * referenced by name from `config/resources.json`. Behaviours are ordinary functions, so they
 * stay testable and have no routing concerns of their own.
 */
export type BehaviourHandler = (
  ctx: GatewayRequestContext,
  resource: ResourceDefinition,
) => Promise<unknown> | unknown;

export type BehaviourRegistry = Record<string, BehaviourHandler>;
