import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FullscreenOutlined, FunctionOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import {
  getMustacheFunctionDefinitions,
} from '@/utils/mustacheExpressionFunctions';
import './styles.css';

export type ExpressionContextValue = string |
  number |
  boolean |
  null |
  undefined |
  ExpressionContext;

export interface ExpressionContext {
  [key: string]: ExpressionContextValue;
}

export type ExpressionFunctionCategory = string;

export interface ExpressionFunctionArg {
  name: string;
  description: string;
  optional?: boolean;
}

export interface ExpressionFunctionDefinition {
  name: string;
  description: string;
  category: ExpressionFunctionCategory;
  args: ExpressionFunctionArg[];
}

interface ExpressionSuggestion {
  label: string;
  insertText: string;
  description: string;
  category: string;
  type: 'function' | 'object' | 'property';
}

interface HighlightToken {
  text: string;
  className: string;
}

export interface ExpressionEditorProps {
  value: string;
  onChange: (value: string) => void;
  context: ExpressionContext;
  functions?: ExpressionFunctionDefinition[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  controlClassName?: string;
  focusRows?: number;
  inline?: boolean;
  allowExpand?: boolean;
}

export interface BuildExpressionContextFromPathsOptions {
  rootKey?: string;
  additionalRoots?: string[];
  leafValue?: ExpressionContextValue;
}

const ensureObjectBranch = (node: ExpressionContext, segment: string): ExpressionContext => {
  const existing = node[segment];
  if (existing && typeof existing === 'object' && !Array.isArray(existing))
    return existing as ExpressionContext;

  const nextNode: ExpressionContext = {};
  node[segment] = nextNode;
  return nextNode;
};

export const buildExpressionContextFromPaths = (
  paths: Array<string | undefined | null>,
  options?: BuildExpressionContextFromPathsOptions,
): ExpressionContext => {
  const rootKey = options?.rootKey?.trim() || 'data';
  const additionalRoots = options?.additionalRoots ?? ['globalState', 'pageContext', 'contexts'];
  const leafValue = options?.leafValue ?? null;

  const context: ExpressionContext = {};
  context[rootKey] = {};

  additionalRoots
    .filter(Boolean)
    .forEach((root) => {
      const normalizedRoot = root.trim();
      if (!normalizedRoot || normalizedRoot === rootKey) return;
      if (!(normalizedRoot in context))
        context[normalizedRoot] = {};
    });

  const root = context[rootKey] as ExpressionContext;
  paths.forEach((pathValue) => {
    if (!pathValue) return;

    const segments = pathValue
      .split('.')
      .map((segment) => segment.trim())
      .filter(Boolean);

    if (segments.length === 0) return;

    let cursor = root;
    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1;
      if (isLast) {
        if (!(segment in cursor)) {
          cursor[segment] = leafValue;
        }
        return;
      }

      cursor = ensureObjectBranch(cursor, segment);
    });
  });

  return context;
};

const getContextKeys = (context: ExpressionContext, path: string[] = []): string[] => {
  let current: ExpressionContextValue = context;

  for (const key of path) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return [];
    }
    current = (current as ExpressionContext)[key];
  }

  if (current === null || current === undefined || typeof current !== 'object') {
    return [];
  }

  return Object.keys(current as ExpressionContext);
};

const getMustacheContext = (
  text: string,
  cursorPos: number,
): { insideMustache: boolean; partial: string; startPos: number } | null => {
  const beforeCursor = text.slice(0, cursorPos);

  let lastOpen = -1;
  let searchFrom = 0;
  while (true) {
    const index = beforeCursor.indexOf('{{', searchFrom);
    if (index === -1) break;
    lastOpen = index;
    searchFrom = index + 2;
  }

  if (lastOpen === -1) return null;

  const betweenOpenAndCursor = beforeCursor.slice(lastOpen + 2);
  if (betweenOpenAndCursor.includes('}}')) return null;

  return {
    insideMustache: true,
    partial: betweenOpenAndCursor.trim(),
    startPos: lastOpen + 2,
  };
};

const extractToken = (partial: string): { token: string; prefixPath: string[]; inFunctionArg: boolean } => {
  let relevantPart = partial;
  let inFunctionArg = false;
  let lastBoundary = -1;
  let inString = false;
  let stringChar = '';
  let parenDepth = 0;

  for (let i = 0; i < partial.length; i += 1) {
    const character = partial[i];

    if (inString) {
      if (character === stringChar && partial[i - 1] !== '\\') inString = false;
      continue;
    }

    if (character === '"' || character === "'") {
      inString = true;
      stringChar = character;
      continue;
    }

    if (character === '(') {
      parenDepth += 1;
      lastBoundary = i;
      inFunctionArg = true;
    } else if (character === ')') {
      parenDepth -= 1;
    } else if (character === ',' && parenDepth > 0) {
      lastBoundary = i;
    }
  }

  if (lastBoundary >= 0) {
    relevantPart = partial.slice(lastBoundary + 1).trim();
  }

  const parts = relevantPart.split('.');
  if (relevantPart.endsWith('.')) {
    return {
      token: '',
      prefixPath: parts.slice(0, -1),
      inFunctionArg,
    };
  }

  if (parts.length > 1) {
    return {
      token: parts[parts.length - 1],
      prefixPath: parts.slice(0, -1),
      inFunctionArg,
    };
  }

  return {
    token: parts[0],
    prefixPath: [],
    inFunctionArg,
  };
};

const tokenizeExpression = (expression: string, knownFunctions: Set<string>): HighlightToken[] => {
  const tokens: HighlightToken[] = [];
  let index = 0;

  while (index < expression.length) {
    const character = expression[index];

    if (/\s/.test(character)) {
      let cursor = index;
      while (cursor < expression.length && /\s/.test(expression[cursor])) cursor += 1;
      tokens.push({ text: expression.slice(index, cursor), className: '' });
      index = cursor;
      continue;
    }

    if (character === '"' || character === "'") {
      let cursor = index + 1;
      while (cursor < expression.length && expression[cursor] !== character) {
        if (expression[cursor] === '\\') cursor += 1;
        cursor += 1;
      }
      if (cursor < expression.length) cursor += 1;
      tokens.push({ text: expression.slice(index, cursor), className: 'hl-string' });
      index = cursor;
      continue;
    }

    if (/\d/.test(character) || (character === '-' && index + 1 < expression.length && /\d/.test(expression[index + 1]))) {
      let cursor = index;
      if (expression[cursor] === '-') cursor += 1;
      while (cursor < expression.length && /[\d.]/.test(expression[cursor])) cursor += 1;
      tokens.push({ text: expression.slice(index, cursor), className: 'hl-number' });
      index = cursor;
      continue;
    }

    if (/[a-zA-Z_]/.test(character)) {
      let cursor = index;
      while (cursor < expression.length && /[a-zA-Z0-9_]/.test(expression[cursor])) cursor += 1;
      const word = expression.slice(index, cursor);

      if (word === 'true' || word === 'false' || word === 'null') {
        tokens.push({ text: word, className: 'hl-keyword' });
        index = cursor;
        continue;
      }

      let lookAhead = cursor;
      while (lookAhead < expression.length && /\s/.test(expression[lookAhead])) lookAhead += 1;
      if (lookAhead < expression.length && expression[lookAhead] === '(' && knownFunctions.has(word.toUpperCase())) {
        tokens.push({ text: word, className: 'hl-function' });
      } else {
        tokens.push({ text: word, className: 'hl-variable' });
      }

      index = cursor;
      continue;
    }

    if (character === '.') {
      tokens.push({ text: character, className: 'hl-dot' });
      index += 1;
      continue;
    }

    if (character === '(' || character === ')') {
      tokens.push({ text: character, className: 'hl-paren' });
      index += 1;
      continue;
    }

    if (character === ',') {
      tokens.push({ text: character, className: 'hl-comma' });
      index += 1;
      continue;
    }

    if ('+-*/><=!&|?:'.includes(character)) {
      let cursor = index + 1;
      if (cursor < expression.length) {
        const twoCharOperator = `${character}${expression[cursor]}`;
        if (['>=', '<=', '!=', '==', '&&', '||'].includes(twoCharOperator)) {
          cursor += 1;
        }
      }

      tokens.push({ text: expression.slice(index, cursor), className: 'hl-operator' });
      index = cursor;
      continue;
    }

    tokens.push({ text: character, className: '' });
    index += 1;
  }

  return tokens;
};

const highlightText = (text: string, knownFunctions: Set<string>): HighlightToken[] => {
  if (!text) return [{ text: '', className: '' }];

  if (!text.includes('{{')) {
    return tokenizeExpression(text, knownFunctions);
  }

  interface Block {
    start: number;
    end: number;
    inner: string;
    closed: boolean;
  }

  const blocks: Block[] = [];
  const completeRegex = /\{\{(.*?)\}\}/gs;
  let match: RegExpExecArray | null;
  while ((match = completeRegex.exec(text)) !== null) {
    blocks.push({
      start: match.index,
      end: match.index + match[0].length,
      inner: match[1],
      closed: true,
    });
  }

  const openIndex = text.lastIndexOf('{{');
  if (openIndex >= 0) {
    const insideClosedBlock = blocks.some((block) => openIndex >= block.start && openIndex < block.end);
    if (!insideClosedBlock) {
      blocks.push({
        start: openIndex,
        end: text.length,
        inner: text.slice(openIndex + 2),
        closed: false,
      });
    }
  }

  if (blocks.length === 0) {
    return tokenizeExpression(text, knownFunctions);
  }

  blocks.sort((a, b) => a.start - b.start);

  const result: HighlightToken[] = [];
  let lastIndex = 0;

  blocks.forEach((block) => {
    if (block.start > lastIndex) {
      result.push({ text: text.slice(lastIndex, block.start), className: '' });
    }

    result.push({ text: '{{', className: 'hl-bracket' });
    result.push(...tokenizeExpression(block.inner, knownFunctions));

    if (block.closed) {
      result.push({ text: '}}', className: 'hl-bracket' });
    }

    lastIndex = block.end;
  });

  if (lastIndex < text.length) {
    result.push({ text: text.slice(lastIndex), className: '' });
  }

  return result;
};

const getSuggestions = (
  text: string,
  cursorPos: number,
  context: ExpressionContext,
  functions: ExpressionFunctionDefinition[],
): ExpressionSuggestion[] => {
  const mustacheContext = getMustacheContext(text, cursorPos);
  if (!mustacheContext) return [];

  const { token, prefixPath, inFunctionArg } = extractToken(mustacheContext.partial);
  const normalizedToken = token.toLowerCase();
  const suggestions: ExpressionSuggestion[] = [];

  if (prefixPath.length > 0) {
    const keys = getContextKeys(context, prefixPath);
    const sourcePath = prefixPath.join('.');
    keys.forEach((key) => {
      if (normalizedToken === '' || key.toLowerCase().startsWith(normalizedToken)) {
        suggestions.push({
          label: key,
          insertText: key,
          description: `Property of ${sourcePath}`,
          category: 'Object',
          type: 'property',
        });
      }
    });

    return suggestions;
  }

  getContextKeys(context).forEach((key) => {
    if (normalizedToken === '' || key.toLowerCase().startsWith(normalizedToken)) {
      suggestions.push({
        label: key,
        insertText: key,
        description: 'Data object',
        category: 'Object',
        type: 'object',
      });
    }
  });

  if (!inFunctionArg || normalizedToken !== '') {
    functions.forEach((fn) => {
      if (normalizedToken === '' || fn.name.toLowerCase().startsWith(normalizedToken)) {
        const argList = fn.args
          .filter((arg) => arg.name !== '...more')
          .map((arg) => arg.name)
          .join(', ');

        suggestions.push({
          label: `${fn.name}(${argList})`,
          insertText: `${fn.name}(`,
          description: fn.description,
          category: fn.category,
          type: 'function',
        });
      }
    });
  }

  suggestions.sort((a, b) => {
    if (a.type !== b.type) {
      const order = { object: 0, property: 1, function: 2 };
      return order[a.type] - order[b.type];
    }

    return a.label.localeCompare(b.label);
  });

  return suggestions;
};

const joinClassNames = (...classNames: Array<string | undefined | null | false>): string => {
  return classNames.filter(Boolean).join(' ');
};

const toPreviewText = (value: string): string => value.replace(/\s+/g, ' ').trim();
const FLOATING_EDITOR_VIEWPORT_PADDING = 12;

export const ExpressionEditor: FC<ExpressionEditorProps> = ({
  value,
  onChange,
  context,
  functions,
  disabled = false,
  placeholder = 'Expression',
  className,
  controlClassName,
  focusRows = 6,
  inline = false,
  allowExpand = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<ExpressionSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [draftValue, setDraftValue] = useState<string | null>(null);
  const valueBeforeExpandRef = useRef<string>('');

  const wrapperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const [inlineDropdownStyle, setInlineDropdownStyle] = useState<React.CSSProperties>({
    top: 0,
    left: 0,
    width: 0,
  });

  const functionDefinitions = useMemo(() => functions ?? getMustacheFunctionDefinitions(), [functions]);
  const knownFunctionNames = useMemo(() => {
    const names = new Set<string>();
    functionDefinitions.forEach((definition) => {
      names.add(definition.name.toUpperCase());
    });
    return names;
  }, [functionDefinitions]);
  const activeValue = isExpanded && draftValue !== null ? draftValue : value;

  const highlightTokens = useMemo(
    () => highlightText(activeValue ?? '', knownFunctionNames),
    [knownFunctionNames, activeValue],
  );
  const showDropdown = isFocused && suggestions.length > 0;

  const updateSuggestions = useCallback((text: string, cursorPos: number) => {
    const result = getSuggestions(text, cursorPos, context, functionDefinitions);
    setSuggestions(result);
    setActiveIndex(0);
  }, [context, functionDefinitions]);

  const closeEditor = useCallback(() => {
    setIsFocused(false);
    setSuggestions([]);
    setIsExpanded(false);
  }, []);

  const updateInlineDropdownPosition = useCallback(() => {
    const anchor = wrapperRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const availableWidth = Math.max(220, viewportWidth - (FLOATING_EDITOR_VIEWPORT_PADDING * 2));
    const preferredWidth = Math.max(rect.width + 2, 280);
    const nextWidth = Math.min(360, Math.min(preferredWidth, availableWidth));
    const minLeft = FLOATING_EDITOR_VIEWPORT_PADDING;
    const maxLeft = Math.max(minLeft, viewportWidth - FLOATING_EDITOR_VIEWPORT_PADDING - nextWidth);
    const nextLeft = Math.min(Math.max(rect.left - 1, minLeft), maxLeft);

    setInlineDropdownStyle({
      top: rect.bottom - 1,
      left: nextLeft,
      width: nextWidth,
    });
  }, []);

  const openEditor = useCallback(() => {
    if (disabled) return;

    setIsFocused(true);
    setIsExpanded(!inline);
    if (inline) {
      updateInlineDropdownPosition();
    }
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const cursorPos = textarea.value.length;
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
      updateSuggestions(textarea.value, cursorPos);
      updateInlineDropdownPosition();
    });
  }, [disabled, inline, updateInlineDropdownPosition, updateSuggestions]);

  const expandEditor = useCallback(() => {
    if (disabled) return;

    valueBeforeExpandRef.current = value;
    setDraftValue(value);
    setIsFocused(true);
    setIsExpanded(true);
  }, [disabled, value]);

  const confirmModal = useCallback(() => {
    if (draftValue !== null) {
      onChange(draftValue);
    }
    setDraftValue(null);
    setIsFocused(false);
    setSuggestions([]);
    setIsExpanded(false);
  }, [draftValue, onChange]);

  const cancelModal = useCallback(() => {
    onChange(valueBeforeExpandRef.current);
    setDraftValue(null);
    setIsFocused(false);
    setSuggestions([]);
    setIsExpanded(false);
  }, [onChange]);

  const insertSuggestion = useCallback((suggestion: ExpressionSuggestion) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const mustacheContext = getMustacheContext(activeValue, cursorPos);
    if (!mustacheContext) return;

    const { partial } = mustacheContext;
    const { token, prefixPath } = extractToken(partial);
    const replaceEnd = cursorPos;
    let replaceStart = cursorPos - token.length;

    if (prefixPath.length === 0) {
      const beforeCursor = activeValue.slice(mustacheContext.startPos, cursorPos);
      let tokenStartInPartial = 0;
      let inString = false;
      let stringChar = '';

      for (let i = 0; i < beforeCursor.length; i += 1) {
        const character = beforeCursor[i];
        if (inString) {
          if (character === stringChar && beforeCursor[i - 1] !== '\\') inString = false;
          continue;
        }

        if (character === '"' || character === "'") {
          inString = true;
          stringChar = character;
          continue;
        }

        if (character === '(' || character === ',') {
          tokenStartInPartial = i + 1;
        }
      }

      while (
        tokenStartInPartial < beforeCursor.length &&
        beforeCursor[tokenStartInPartial] === ' '
      ) {
        tokenStartInPartial += 1;
      }

      replaceStart = mustacheContext.startPos + tokenStartInPartial;
    }

    const nextValue = activeValue.slice(0, replaceStart) + suggestion.insertText + activeValue.slice(replaceEnd);
    const nextCursorPos = replaceStart + suggestion.insertText.length;

    if (isExpanded) {
      setDraftValue(nextValue);
    } else {
      onChange(nextValue);
    }
    setSuggestions([]);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursorPos, nextCursorPos);

      if (suggestion.insertText.endsWith('(') || suggestion.insertText.endsWith('.')) {
        updateSuggestions(nextValue, nextCursorPos);
      }
    });
  }, [activeValue, isExpanded, onChange, updateSuggestions]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value;
    const cursorPos = event.target.selectionStart;
    if (isExpanded) {
      setDraftValue(nextValue);
    } else {
      onChange(nextValue);
    }
    updateSuggestions(nextValue, cursorPos);
  }, [isExpanded, onChange, updateSuggestions]);

  const handleSelect = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    updateSuggestions(activeValue, textarea.selectionStart);
  }, [updateSuggestions, activeValue]);

  const handleBlur = useCallback((event: React.FocusEvent<HTMLTextAreaElement>) => {
    if (isExpanded) return;

    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && (
      wrapperRef.current?.contains(nextTarget) ||
      dropdownRef.current?.contains(nextTarget)
    )) {
      return;
    }

    closeEditor();
  }, [closeEditor, isExpanded]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === ' ') {
      event.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      updateSuggestions(activeValue, textarea.selectionStart);
      return;
    }

    if (!showDropdown) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeEditor();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Tab':
      case 'Enter':
        event.preventDefault();
        insertSuggestion(suggestions[activeIndex]);
        break;
      case 'Escape':
        event.preventDefault();
        setSuggestions([]);
        break;
      default:
        break;
    }
  }, [activeIndex, activeValue, closeEditor, insertSuggestion, showDropdown, suggestions, updateSuggestions]);

  useEffect(() => {
    if (!showDropdown || !dropdownRef.current) return;
    const activeElement = dropdownRef.current.querySelector('.sha-expression-editor-dropdown-item.is-active');
    if (activeElement) activeElement.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, showDropdown]);

  useEffect(() => {
    if (!isFocused)
      return undefined;

    const handleWindowChange = (): void => {
      if (!isExpanded) {
        updateInlineDropdownPosition();
      }
    };

    handleWindowChange();
    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('scroll', handleWindowChange, true);

    return () => {
      window.removeEventListener('resize', handleWindowChange);
      window.removeEventListener('scroll', handleWindowChange, true);
    };
  }, [isExpanded, isFocused, updateInlineDropdownPosition]);

  useEffect(() => {
    if (!isFocused || isExpanded)
      return undefined;

    const handleOutsideClick = (event: MouseEvent): void => {
      const target = event.target as Node | null;
      if (!target) return;

      if (wrapperRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      closeEditor();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [closeEditor, isFocused, isExpanded]);

  const handleScroll = useCallback(() => {
    if (!textareaRef.current || !backdropRef.current) return;

    backdropRef.current.scrollTop = textareaRef.current.scrollTop;
    backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
  }, []);

  const resolvedControlClassName = joinClassNames(
    'sha-expression-editor-control',
    controlClassName ?? className,
  );
  const hasValue = Boolean(value?.trim().length);
  const previewText = hasValue ? toPreviewText(value) : placeholder;

  const renderDropdown = (mode: 'inline' | 'floating'): JSX.Element | false => showDropdown && (
    <div
      ref={dropdownRef}
      className={joinClassNames(
        'sha-expression-editor-dropdown',
        mode === 'inline' && 'sha-expression-editor-dropdown--inline',
      )}
      style={mode === 'inline' ? inlineDropdownStyle : undefined}
    >
      {suggestions.map((suggestion, index) => (
        <button
          key={`${suggestion.label}-${index}`}
          type="button"
          tabIndex={-1}
          className={joinClassNames(
            'sha-expression-editor-dropdown-item',
            index === activeIndex && 'is-active',
          )}
          onMouseDown={(event) => {
            event.preventDefault();
            insertSuggestion(suggestion);
          }}
          onMouseEnter={() => setActiveIndex(index)}
        >
          <span className={joinClassNames('sha-expression-editor-badge', `is-${suggestion.category.toLowerCase()}`)}>
            {suggestion.category}
          </span>
          <span className="sha-expression-editor-item-content">
            <span className="sha-expression-editor-item-label">{suggestion.label}</span>
            <span className="sha-expression-editor-item-description">{suggestion.description}</span>
          </span>
        </button>
      ))}
    </div>
  );

  const renderPreviewContent = (): React.ReactNode => {
    if (!hasValue)
      return previewText;

    return (
      <span className="sha-expression-editor-preview-content" aria-hidden="true">
        {highlightTokens.map((token, index) => (
          token.className
            ? (
              <span key={index} className={token.className}>
                {token.text}
              </span>
            )
            : <span key={index}>{token.text}</span>
        ))}
      </span>
    );
  };

  const renderEditorSurface = (mode: 'inline' | 'floating'): JSX.Element => (
    <div className={joinClassNames('sha-expression-editor-overlay', mode === 'floating' && 'sha-expression-editor-overlay--floating')}>
      <div ref={backdropRef} className="sha-expression-editor-backdrop" aria-hidden="true">
        <div className="sha-expression-editor-backdrop-content">
          {highlightTokens.map((token, index) => (
            token.className
              ? (
                <span key={index} className={token.className}>
                  {token.text}
                </span>
              )
              : <span key={index}>{token.text}</span>
          ))}
          {activeValue.endsWith('\n') && <span>{'\n'}</span>}
        </div>
      </div>

      <textarea
        ref={textareaRef}
        className={joinClassNames(
          'sha-expression-editor-input',
          resolvedControlClassName,
        )}
        value={activeValue}
        rows={mode === 'floating' ? focusRows : (isFocused ? Math.max(3, Math.min(focusRows, 4)) : 1)}
        onBlur={handleBlur}
        onFocus={() => setIsFocused(true)}
        onChange={handleChange}
        onSelect={handleSelect}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        disabled={disabled}
        placeholder={placeholder}
        spellCheck={false}
      />

      {allowExpand && mode === 'inline' && isFocused && (
        <button
          type="button"
          className="sha-expression-editor-expand"
          onMouseDown={(event) => event.preventDefault()}
          onClick={expandEditor}
          disabled={disabled}
          aria-label="Expand expression editor"
          title="Expand editor"
        >
          <FullscreenOutlined />
        </button>
      )}

      {mode === 'floating' && renderDropdown('floating')}
    </div>
  );

  return (
    <div ref={wrapperRef} className={joinClassNames('sha-expression-editor', className, (inline || isExpanded) && 'is-expanded', inline && 'is-inline', disabled && 'is-disabled')}>
      {inline && !isExpanded && isFocused ? (
        renderEditorSurface('inline')
      ) : (
        <button
          type="button"
          className={joinClassNames(
            'sha-expression-editor-preview',
            resolvedControlClassName,
            !hasValue && 'is-placeholder',
          )}
          title={hasValue ? value : placeholder}
          onClick={openEditor}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openEditor();
            }
          }}
          disabled={disabled}
        >
          {renderPreviewContent()}
        </button>
      )}

      {!isExpanded && isFocused && typeof document !== 'undefined' && createPortal(
        renderDropdown('inline'),
        document.body,
      )}

      <Modal
        open={isFocused && isExpanded}
        title={<><FunctionOutlined /> Expression Editor</>}
        onCancel={cancelModal}
        onOk={confirmModal}
        okText="Ok"
        cancelText="Cancel"
        width={560}
        destroyOnClose
        className="sha-expression-editor-modal"
        afterOpenChange={(open) => {
          if (open) {
            const textarea = textareaRef.current;
            if (!textarea) return;
            const cursorPos = textarea.value.length;
            textarea.focus();
            textarea.setSelectionRange(cursorPos, cursorPos);
            updateSuggestions(textarea.value, cursorPos);
          }
        }}
      >
        {isFocused && isExpanded && renderEditorSurface('floating')}
      </Modal>
    </div>
  );
};
