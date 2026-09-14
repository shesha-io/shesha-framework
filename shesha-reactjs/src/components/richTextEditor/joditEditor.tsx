import { Suspense, FC, lazy, useCallback, useMemo } from 'react';
import { Skeleton } from 'antd';
import { JoditEditorProps } from "jodit-react";
import DOMPurify, { UponSanitizeAttributeHookEvent } from 'dompurify';
import { isNullOrWhiteSpace } from '@/utils/nullables';

export type JoditConfig = JoditEditorProps["config"];
type JoditInstance = Parameters<NonNullable<JoditEditorProps["editorRef"]>>[0];

const JoditEditor = lazy(async () => {
  await import("jodit");
  const joditReact = await import('jodit-react');
  // temporary disable ace editor because of conflicts with code editor
  joditReact.Jodit.defaultOptions.sourceEditor = 'area';

  return joditReact;
});

export interface IJoditEditorProps {
  value?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
  config?: JoditConfig | undefined;
  allowBase64Images: boolean;
  id?: string | undefined;
}

const stripBase64ImageSrc = (_node: Element, data: UponSanitizeAttributeHookEvent): void => {
  if (data.attrName === 'src' && data.attrValue.trim().toLowerCase().startsWith('data:')) {
    data.keepAttr = false;
  }
};

// DOMPurify hooks are global, so add/remove around each call to avoid leaking into other sanitize() calls in the app.
const sanitizeContent = (value: string, allowBase64Images: boolean): string => {
  if (!allowBase64Images) DOMPurify.addHook('uponSanitizeAttribute', stripBase64ImageSrc);
  const result = DOMPurify.sanitize(value, { USE_PROFILES: { html: true } });
  if (!allowBase64Images) DOMPurify.removeHook('uponSanitizeAttribute', stripBase64ImageSrc);
  return result;
};

export const JoditEditorWrapper: FC<IJoditEditorProps> = (props) => {
  const { config, value, onChange, allowBase64Images, id } = props;

  const sanitizedValue = useMemo(() => (!isNullOrWhiteSpace(value) ? sanitizeContent(value, allowBase64Images) : ""),
    [value, allowBase64Images],
  );

  const handleBlur = (newValue: string): void => {
    const cleanValue = typeof newValue === 'string'
      ? sanitizeContent(newValue, allowBase64Images)
      : newValue;
    onChange?.(cleanValue);
  };

  // Catches content applied directly to the editor DOM (e.g. switching from Source/HTML mode back to WYSIWYG), which bypasses onBlur.
  const handleEditorRef = useCallback((editor: JoditInstance) => {
    if (allowBase64Images) return;
    editor.e.on('beforeSetValueToEditor', (rawValue: string) => sanitizeContent(rawValue, allowBase64Images));
  }, [allowBase64Images]);

  const isSSR = typeof window === 'undefined';

  return isSSR ? (
    <Skeleton loading={true} />
  ) : (
    <Suspense fallback={<div>Loading editor...</div>}>
      <JoditEditor
        value={sanitizedValue}
        {...(config ? { config } : {})}
        {...(id ? { id } : {})}
        editorRef={handleEditorRef}
        onBlur={handleBlur} // preferred to use only this option to update the content for performance reasons
      />
    </Suspense>
  );
};

export default JoditEditorWrapper;
