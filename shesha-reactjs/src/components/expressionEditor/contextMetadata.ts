import { DataTypes } from '@/interfaces';
import {
  ITypeDefinitionBuilder,
  IObjectMetadata,
  IPropertyMetadata,
  NestedProperties,
  TypeDefinition,
  TypeDefinitionLoader,
  isPropertiesArray,
  isPropertiesLoader,
} from '@/interfaces/metadata';

export type ExpressionContextTree = {
  [key: string]: null | ExpressionContextTree;
};

type ParsedDefinition = {
  kind: 'interface';
  body: string;
  extendsTypes: string[];
} | {
  kind: 'type';
  expression: string;
};

type ParsedDefinitions = Map<string, ParsedDefinition>;

const PRIMITIVE_TYPE_NAMES = new Set([
  'Date',
  'Error',
  'Map',
  'Object',
  'Promise',
  'Record',
  'Set',
  'any',
  'bigint',
  'boolean',
  'false',
  'never',
  'null',
  'number',
  'object',
  'string',
  'symbol',
  'true',
  'undefined',
  'unknown',
  'void',
]);

const ensureBranch = (node: ExpressionContextTree, segment: string): ExpressionContextTree => {
  const existing = node[segment];
  if (existing && typeof existing === 'object') {
    return existing;
  }

  const nextNode: ExpressionContextTree = {};
  node[segment] = nextNode;
  return nextNode;
};

export const mergeExpressionContexts = (target: ExpressionContextTree, source?: ExpressionContextTree): ExpressionContextTree => {
  if (!source) return target;

  Object.entries(source).forEach(([key, value]) => {
    if (value && typeof value === 'object') {
      mergeExpressionContexts(ensureBranch(target, key), value);
      return;
    }

    if (!(key in target)) {
      target[key] = null;
    }
  });

  return target;
};

const splitPath = (path: string): string[] => path
  .split('.')
  .map((segment) => segment.trim())
  .filter(Boolean);

const setPropertyPath = (target: ExpressionContextTree, propertyPath: string, value: null | ExpressionContextTree): void => {
  const segments = splitPath(propertyPath);
  if (segments.length === 0) return;

  let cursor = target;
  segments.slice(0, -1).forEach((segment) => {
    cursor = ensureBranch(cursor, segment);
  });

  const lastSegment = segments[segments.length - 1];
  if (value && typeof value === 'object') {
    mergeExpressionContexts(ensureBranch(cursor, lastSegment), value);
    return;
  }

  if (!(lastSegment in cursor)) {
    cursor[lastSegment] = null;
  }
};

const loadProperties = (properties: NestedProperties | undefined): Promise<IPropertyMetadata[]> => {
  if (!properties) return Promise.resolve([]);
  if (isPropertiesArray(properties)) return Promise.resolve(properties);
  if (isPropertiesLoader(properties)) return properties();
  return Promise.resolve([]);
};

const stripComments = (source: string): string => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');

const splitTopLevel = (source: string, delimiter: string): string[] => {
  const parts: string[] = [];
  let current = '';
  let braceDepth = 0;
  let bracketDepth = 0;
  let parenDepth = 0;
  let angleDepth = 0;
  let inString = false;
  let stringChar = '';

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const previous = source[index - 1];

    if (inString) {
      current += character;
      if (character === stringChar && previous !== '\\') {
        inString = false;
        stringChar = '';
      }
      continue;
    }

    if (character === '"' || character === "'" || character === '`') {
      inString = true;
      stringChar = character;
      current += character;
      continue;
    }

    if (character === '{') braceDepth += 1;
    if (character === '}') braceDepth -= 1;
    if (character === '[') bracketDepth += 1;
    if (character === ']') bracketDepth -= 1;
    if (character === '(') parenDepth += 1;
    if (character === ')') parenDepth -= 1;
    if (character === '<') angleDepth += 1;
    if (character === '>') angleDepth = Math.max(0, angleDepth - 1);

    if (
      character === delimiter &&
      braceDepth === 0 &&
      bracketDepth === 0 &&
      parenDepth === 0 &&
      angleDepth === 0
    ) {
      const trimmed = current.trim();
      if (trimmed) parts.push(trimmed);
      current = '';
      continue;
    }

    current += character;
  }

  const trimmed = current.trim();
  if (trimmed) parts.push(trimmed);

  return parts;
};

const findMatching = (source: string, startIndex: number, openChar: string, closeChar: string): number => {
  let depth = 0;
  let inString = false;
  let stringChar = '';

  for (let index = startIndex; index < source.length; index += 1) {
    const character = source[index];
    const previous = source[index - 1];

    if (inString) {
      if (character === stringChar && previous !== '\\') {
        inString = false;
        stringChar = '';
      }
      continue;
    }

    if (character === '"' || character === "'" || character === '`') {
      inString = true;
      stringChar = character;
      continue;
    }

    if (character === openChar) depth += 1;
    if (character === closeChar) depth -= 1;

    if (depth === 0) {
      return index;
    }
  }

  return -1;
};

const parseInterfaceDefinitions = (source: string, definitions: ParsedDefinitions): void => {
  const interfaceRegex = /(?:^|\s)(?:export\s+)?interface\s+([A-Za-z_]\w*)(?:\s*<[^>{]*>)?(?:\s+extends\s+([^{]+))?\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = interfaceRegex.exec(source)) !== null) {
    const name = match[1];
    const extendsSource = match[2]?.trim() ?? '';
    const bodyStart = source.indexOf('{', match.index);
    if (bodyStart < 0) continue;

    const bodyEnd = findMatching(source, bodyStart, '{', '}');
    if (bodyEnd < 0) continue;

    definitions.set(name, {
      kind: 'interface',
      body: source.slice(bodyStart + 1, bodyEnd),
      extendsTypes: extendsSource
        ? splitTopLevel(extendsSource, ',').map((item) => item.trim()).filter(Boolean)
        : [],
    });

    interfaceRegex.lastIndex = bodyEnd + 1;
  }
};

const findTypeExpressionEnd = (source: string, startIndex: number): number => {
  let braceDepth = 0;
  let bracketDepth = 0;
  let parenDepth = 0;
  let angleDepth = 0;
  let inString = false;
  let stringChar = '';

  for (let index = startIndex; index < source.length; index += 1) {
    const character = source[index];
    const previous = source[index - 1];

    if (inString) {
      if (character === stringChar && previous !== '\\') {
        inString = false;
        stringChar = '';
      }
      continue;
    }

    if (character === '"' || character === "'" || character === '`') {
      inString = true;
      stringChar = character;
      continue;
    }

    if (character === '{') braceDepth += 1;
    if (character === '}') braceDepth -= 1;
    if (character === '[') bracketDepth += 1;
    if (character === ']') bracketDepth -= 1;
    if (character === '(') parenDepth += 1;
    if (character === ')') parenDepth -= 1;
    if (character === '<') angleDepth += 1;
    if (character === '>') angleDepth = Math.max(0, angleDepth - 1);

    if (
      character === ';' &&
      braceDepth === 0 &&
      bracketDepth === 0 &&
      parenDepth === 0 &&
      angleDepth === 0
    ) {
      return index;
    }
  }

  return source.length;
};

const parseTypeDefinitions = (source: string, definitions: ParsedDefinitions): void => {
  const typeRegex = /(?:^|\s)(?:export\s+)?type\s+([A-Za-z_]\w*)(?:\s*<[^>{]*>)?\s*=/g;
  let match: RegExpExecArray | null;

  while ((match = typeRegex.exec(source)) !== null) {
    const name = match[1];
    const expressionStart = typeRegex.lastIndex;
    const expressionEnd = findTypeExpressionEnd(source, expressionStart);

    definitions.set(name, {
      kind: 'type',
      expression: source.slice(expressionStart, expressionEnd).trim(),
    });

    typeRegex.lastIndex = expressionEnd + 1;
  }
};

const parseDefinitions = (files: TypeDefinition['files']): ParsedDefinitions => {
  const definitions: ParsedDefinitions = new Map();

  files.forEach((file) => {
    const source = stripComments(file.content);
    parseInterfaceDefinitions(source, definitions);
    parseTypeDefinitions(source, definitions);
  });

  return definitions;
};

const normalizeTypeExpression = (typeExpression: string): string => typeExpression
  .replace(/\s+/g, ' ')
  .trim();

const isInlineObjectType = (typeExpression: string): boolean => {
  const trimmed = normalizeTypeExpression(typeExpression);
  return trimmed.startsWith('{') && trimmed.endsWith('}');
};

const isCollectionType = (typeExpression: string): boolean => {
  const trimmed = normalizeTypeExpression(typeExpression);
  return trimmed.endsWith('[]') || /^ReadonlyArray\s*</.test(trimmed) || /^Array\s*</.test(trimmed);
};

const parseMember = (member: string): { name: string; typeExpression?: string } | null => {
  const cleaned = member
    .replace(/^readonly\s+/, '')
    .trim();

  if (!cleaned || cleaned.startsWith('[')) {
    return null;
  }

  const methodMatch = cleaned.match(/^([A-Za-z_$][\w$]*)\??\s*\([^)]*\)\s*:\s*([\s\S]+)$/);
  if (methodMatch) {
    return { name: methodMatch[1] };
  }

  const propertyMatch = cleaned.match(/^([A-Za-z_$][\w$]*)\??\s*:\s*([\s\S]+)$/);
  if (!propertyMatch) {
    return null;
  }

  return {
    name: propertyMatch[1],
    typeExpression: propertyMatch[2].trim(),
  };
};

function buildContextFromTypeExpression(
  typeExpression: string,
  definitions: ParsedDefinitions,
  visited: Set<string>,
): ExpressionContextTree | null {
  const normalized = normalizeTypeExpression(typeExpression);
  if (!normalized || PRIMITIVE_TYPE_NAMES.has(normalized)) {
    return null;
  }

  if (isCollectionType(normalized)) {
    return null;
  }

  if (isInlineObjectType(normalized)) {
    // Recursive parser helpers intentionally reference each other.
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return buildContextFromMembers(normalized.slice(1, -1), definitions, visited);
  }

  const referencedTypes = Array.from(
    new Set(
      (normalized.match(/\b[A-Za-z_]\w*\b/g) ?? [])
        .filter((token) => !PRIMITIVE_TYPE_NAMES.has(token))
        .filter((token) => definitions.has(token)),
    ),
  );

  if (referencedTypes.length === 0) {
    return null;
  }

  const result: ExpressionContextTree = {};
  referencedTypes.forEach((typeName) => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    mergeExpressionContexts(result, buildContextFromDefinition(typeName, definitions, visited));
  });

  return Object.keys(result).length > 0 ? result : null;
}

function buildContextFromMembers(
  body: string,
  definitions: ParsedDefinitions,
  visited: Set<string>,
): ExpressionContextTree {
  const context: ExpressionContextTree = {};

  splitTopLevel(body, ';').forEach((member) => {
    const parsedMember = parseMember(member);
    if (!parsedMember) return;

    const childContext = parsedMember.typeExpression
      ? buildContextFromTypeExpression(parsedMember.typeExpression, definitions, visited)
      : null;

    context[parsedMember.name] = childContext && Object.keys(childContext).length > 0
      ? childContext
      : null;
  });

  return context;
}

function buildContextFromDefinition(
  typeName: string,
  definitions: ParsedDefinitions,
  visited: Set<string>,
): ExpressionContextTree | null {
  if (visited.has(typeName)) {
    return null;
  }

  const definition = definitions.get(typeName);
  if (!definition) {
    return null;
  }

  const nextVisited = new Set(visited);
  nextVisited.add(typeName);

  if (definition.kind === 'type') {
    return buildContextFromTypeExpression(definition.expression, definitions, nextVisited);
  }

  const context = buildContextFromMembers(definition.body, definitions, nextVisited);
  definition.extendsTypes.forEach((extendedType) => {
    mergeExpressionContexts(
      context,
      buildContextFromTypeExpression(extendedType, definitions, nextVisited) ?? undefined,
    );
  });

  return context;
}

const loadTypeDefinition = async (typeDefinitionLoader: TypeDefinitionLoader): Promise<TypeDefinition | null> => {
  const generatedFiles = new Map<string, string>();
  const typeDefinitionBuilder: ITypeDefinitionBuilder = {
    getEntityType: () => Promise.resolve(undefined),
    makeFormType: (_formId, content) => ({
      typeName: 'FormModel',
      files: [{ fileName: 'forms/generated/model.ts', content }],
    }),
    makeFile: (fileName, content) => {
      generatedFiles.set(fileName, content);
    },
  };

  try {
    const definition = await typeDefinitionLoader({ typeDefinitionBuilder });
    const extraFiles = Array.from(generatedFiles.entries())
      .filter(([fileName]) => !definition.files.some((file) => file.fileName === fileName))
      .map(([fileName, content]) => ({ fileName, content }));

    return {
      ...definition,
      files: [...definition.files, ...extraFiles],
    };
  } catch (error) {
    console.error('Failed to load expression editor type definition', error);
    return null;
  }
};

const buildContextFromTypeDefinitionLoader = async (typeDefinitionLoader: TypeDefinitionLoader): Promise<ExpressionContextTree | null> => {
  const definition = await loadTypeDefinition(typeDefinitionLoader);
  if (!definition) {
    return null;
  }

  const definitions = parseDefinitions(definition.files);
  return buildContextFromDefinition(definition.typeName, definitions, new Set());
};

async function buildPropertyContext(property: IPropertyMetadata): Promise<ExpressionContextTree | null> {
  const nestedContext: ExpressionContextTree = {};

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  mergeExpressionContexts(nestedContext, await buildExpressionContextFromProperties(property.properties));
  if (property.typeDefinitionLoader) {
    mergeExpressionContexts(nestedContext, await buildContextFromTypeDefinitionLoader(property.typeDefinitionLoader));
  }

  if (Object.keys(nestedContext).length > 0) {
    return nestedContext;
  }

  if (property.dataType === DataTypes.object) {
    return {};
  }

  return null;
}

export async function buildExpressionContextFromProperties(properties: NestedProperties | undefined): Promise<ExpressionContextTree> {
  const context: ExpressionContextTree = {};
  const loadedProperties = await loadProperties(properties);

  for (const property of loadedProperties) {
    setPropertyPath(context, property.path, await buildPropertyContext(property));
  }

  return context;
}

export const buildExpressionContextFromMetadata = async (metadata?: IObjectMetadata): Promise<ExpressionContextTree> => {
  if (!metadata) {
    return {};
  }

  const context = await buildExpressionContextFromProperties(metadata.properties);
  if (metadata.typeDefinitionLoader) {
    mergeExpressionContexts(context, await buildContextFromTypeDefinitionLoader(metadata.typeDefinitionLoader));
  }
  return context;
};
