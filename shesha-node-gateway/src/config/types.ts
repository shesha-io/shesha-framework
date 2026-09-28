/**
 * Declarative configuration types for the Shesha Integration Gateway.
 *
 * The whole gateway is data-driven: backends (any language) and operations
 * (Shesha endpoints) are described here as data, not code. The dispatcher +
 * transform engine interpret these definitions at runtime.
 */

/** How an operation is served. Switch this via config to migrate call-by-call. */
export type OperationMode = 'native' | 'adapter' | 'proxy' | 'mock';

/** How the caller's Shesha bearer token is forwarded to a backend. */
export interface BackendAuth {
  type: 'none' | 'bearer-passthrough' | 'static-bearer' | 'header';
  /** static token value (for `static-bearer`) */
  token?: string;
  /** header name (for `header`, defaults to Authorization) */
  header?: string;
  /** scheme prefix (defaults to Bearer) */
  scheme?: string;
}

/** A named upstream backend. Can be Go, .NET, Python, Rust — anything speaking HTTP. */
export interface BackendDefinition {
  name: string;
  baseUrl: string;
  /** static headers applied to every request to this backend */
  headers?: Record<string, string>;
  auth?: BackendAuth;
  timeoutMs?: number;
  /** optional path probed by the health/status check */
  healthPath?: string;
  description?: string;
}

/**
 * A mapping spec is a JSON tree that mirrors the *desired output shape*.
 * Leaf values are expressions resolved against a source object:
 *  - `"$.a.b"`               -> path reference into the source
 *  - `{ "$path": "a.b" }`    -> path reference
 *  - `{ "$const": <any> }`   -> literal value
 *  - `{ "$template": "x={{$.a}}" }` -> string template
 *  - `{ "$coalesce": ["$.a","$.b"], "$default": v }`
 *  - `{ "$each": "$.items", "$as": <spec> }` -> array map (item at `$`, index at `$index`)
 *  - plain object / array    -> recursed
 */
export type MappingSpec = unknown;

/** The target call an `adapter` operation makes against a backend. */
export interface AdapterTarget {
  /** backend registry name */
  backend: string;
  method: string;
  /** templated path, e.g. "/users/{{$.query.id}}" */
  path: string;
  query?: MappingSpec;
  headers?: MappingSpec;
  body?: MappingSpec;
}

export interface AdapterDefinition {
  target: AdapterTarget;
  /**
   * Map the backend response into the Shesha DTO (the `result` payload).
   * Source is `{ status, headers, body }`.
   */
  response?: MappingSpec;
  /** if the backend already returns an ABP `{ success, result }` envelope, pass it through */
  passthroughEnvelope?: boolean;
  /** treat these backend HTTP statuses as success (default: 2xx) */
  successStatuses?: number[];
}

export interface SheshaEndpoint {
  method: string;
  /**
   * Shesha path. Supports `:param` segments and a trailing `/*` wildcard,
   * e.g. "/api/services/app/DynamicEntity/*".
   */
  path: string;
}

export interface OperationDefinition {
  id: string;
  shesha: SheshaEndpoint;
  mode: OperationMode;
  description?: string;
  requiresAuth?: boolean;
  tags?: string[];
  /** adapter mode */
  adapter?: AdapterDefinition;
  /** native mode: key into the native handler registry */
  native?: string;
  /** mock mode */
  mock?: { status?: number; result?: unknown };
}

export interface OperationsConfig {
  /** mode used when an incoming path matches no explicit operation */
  defaultMode: OperationMode;
  /** default backend for adapter operations that omit `target.backend` */
  defaultBackend?: string;
  operations: OperationDefinition[];
}

export interface BackendsConfig {
  backends: BackendDefinition[];
}

/**
 * Where a resource's rows live. `entity` is the generic JSON row store (the default — any entity
 * created in the Entity Designer works with no code); `configItem` binds the service to a
 * Configuration Studio item type; `user` binds it to the auth table; `module` binds it to the
 * module table the Configuration Studio already reads; `behaviour` means the resource has no
 * generic CRUD at all and every action is named.
 */
export type ResourceStorageKind = 'entity' | 'configItem' | 'user' | 'module' | 'behaviour';

export interface ResourceStorage {
  kind: ResourceStorageKind;
  /** for `entity`: the module the rows belong to (defaults to the resource's `serviceModule` mapping) */
  module?: string;
  /** for `entity`: the entity/table name (defaults to `service`) */
  entity?: string;
  /** for `configItem`: the Configuration Studio item type, e.g. `reference-list` */
  itemType?: string;
}

export interface ResourceAuth {
  /** every action requires a bearer token unless this is explicitly false */
  requiresAuth?: boolean;
  /**
   * Actions reachable with no token at all — the password-reset and OTP flows, which by definition
   * belong to someone who cannot authenticate yet. `requiresAuth: false` opens the whole resource;
   * this opens one action on an otherwise protected resource.
   */
  anonymousActions?: string[];
  /**
   * Permission name checked with the same wildcard rules as `Permission/IsPermissionGranted`.
   */
  permission?: string;
  /**
   * Per-action overrides of `permission`. An empty string is meaningful: it means "authenticated,
   * but no specific permission", which is how core's `AnyAuthenticated` actions are expressed.
   */
  actions?: Record<string, string>;
}

/**
 * One Shesha app-service. This is the declarative half of the gateway's "single endpoint" design:
 * `/api/services/:serviceModule/:service/:action` is ONE operation, and a resource entry is what
 * turns it into a working API. Standard ABP CRUD (`Get`, `GetAll`, `Create`, `Update`, `Delete`)
 * needs no `actions` entry at all — it is derived from `storage`.
 */
export interface ResourceDefinition {
  /** the `{Service}` path segment, e.g. "PermissionedObject" */
  service: string;
  /**
   * The `{serviceModule}` path segment; defaults to "app". Set to `"*"` to claim the service in
   * every module — framework services are generated under both `app` and `Shesha` depending on the
   * client, and `Sms`/`ModelConfigurations` sit outside `/api/services/...` entirely. An exact
   * module match always wins over a wildcard one.
   */
  serviceModule?: string;
  description?: string;
  storage: ResourceStorage;
  /**
   * Named behaviours for non-standard actions (and for overriding a standard one).
   * Values are keys into the behaviour registry.
   */
  actions?: Record<string, string>;
  /** field used when the caller identifies a row by name instead of id (e.g. `Permission/Delete?name=`) */
  nameField?: string;
  /** default sort applied to `GetAll` when the caller sends none */
  defaultSorting?: string;
  auth?: ResourceAuth;
}

export interface ResourcesConfig {
  resources: ResourceDefinition[];
}
