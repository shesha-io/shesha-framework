import { OperationDefinition, OperationsConfig } from '../config/types';

export interface ResolvedOperation {
  operation: OperationDefinition;
  /** path params captured from `:name` segments and the `*` wildcard (`wildcard` key) */
  params: Record<string, string>;
}

interface CompiledPattern {
  op: OperationDefinition;
  segments: string[];
  specificity: number;
}

const splitPath = (p: string): string[] => p.split('/').filter((s) => s !== '');

/**
 * Resolves an incoming Shesha request (method + path) to a declarative
 * operation. Exact matches win, then `:param` patterns, then `*` wildcards.
 */
export class OperationMap {
  private readonly exact = new Map<string, OperationDefinition>();
  private readonly patterns: CompiledPattern[] = [];
  readonly defaultMode: OperationsConfig['defaultMode'];
  readonly defaultBackend?: string;

  constructor(cfg: OperationsConfig) {
    this.defaultMode = cfg.defaultMode;
    this.defaultBackend = cfg.defaultBackend;

    for (const op of cfg.operations) {
      const method = op.shesha.method.toUpperCase();
      const segments = splitPath(op.shesha.path);
      const hasParam = segments.some((s) => s.startsWith(':'));
      const hasWildcard = segments.includes('*');

      if (!hasParam && !hasWildcard) {
        this.exact.set(`${method} /${segments.join('/')}`, op);
      } else {
        // Higher specificity = more literal segments; wildcards rank lowest.
        const literals = segments.filter((s) => !s.startsWith(':') && s !== '*').length;
        const specificity = literals * 10 - (hasWildcard ? 5 : 0) - segments.filter((s) => s.startsWith(':')).length;
        this.patterns.push({ op, segments, specificity });
      }
    }
    this.patterns.sort((a, b) => b.specificity - a.specificity);
  }

  all(): OperationDefinition[] {
    const ops: OperationDefinition[] = [...this.exact.values()];
    return ops.concat(this.patterns.map((p) => p.op));
  }

  resolve(method: string, rawPath: string): ResolvedOperation | undefined {
    const m = method.toUpperCase();
    const segments = splitPath(rawPath);

    const exactOp = this.exact.get(`${m} /${segments.join('/')}`);
    if (exactOp) return { operation: exactOp, params: {} };

    for (const pattern of this.patterns) {
      if (pattern.op.shesha.method.toUpperCase() !== m) continue;
      const params = this.matchSegments(pattern.segments, segments);
      if (params) return { operation: pattern.op, params };
    }
    return undefined;
  }

  private matchSegments(pattern: string[], segments: string[]): Record<string, string> | null {
    const params: Record<string, string> = {};
    for (let i = 0; i < pattern.length; i++) {
      const p = pattern[i];
      if (p === '*') {
        params.wildcard = segments.slice(i).join('/');
        return params;
      }
      if (i >= segments.length) return null;
      if (p.startsWith(':')) {
        params[p.slice(1)] = decodeURIComponent(segments[i]);
      } else if (p !== segments[i]) {
        return null;
      }
    }
    return pattern.length === segments.length ? params : null;
  }
}
