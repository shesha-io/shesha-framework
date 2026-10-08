import { Suspense, FC, lazy, useCallback, useMemo } from 'react';
import { Skeleton } from 'antd';
import { JoditEditorProps } from "jodit-react";
import DOMPurify, { UponSanitizeElementHookEvent } from 'dompurify';
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

// Stripping just the src attribute leaves a src-less <img> that still reserves its (often huge) width/height,
// rendering as an oversized broken-image placeholder; removing the whole element avoids that dead space.
const removeDisallowedBase64Image = (node: Node, data: UponSanitizeElementHookEvent): void => {
  if (data.tagName !== 'img' || !(node instanceof Element)) return;
  const src = node.getAttribute('src');
  if (src !== null && src.trim().toLowerCase().startsWith('data:')) node.remove();
};

// Matches the embed URLs Jodit's video plugin generates, so a pasted raw <iframe> is held to the same allow-list.
const ALLOWED_IFRAME_SRC = /^https?:\/\/(www\.)?(youtube(-nocookie)?\.com\/embed\/|player\.vimeo\.com\/video\/)/i;

// The 'html' profile strips <iframe>; ADD_TAGS below allows it back, this limits it to known video-embed hosts.
const restrictIframeSrc = (node: Node, data: UponSanitizeElementHookEvent): void => {
  if (data.tagName !== 'iframe' || !(node instanceof Element)) return;
  const src = node.getAttribute('src');
  if (src === null || !ALLOWED_IFRAME_SRC.test(src)) node.remove();
};

// Pasted links aren't editable-in-place, so force them to open in a new tab rather than navigate away from the form.
const forceLinkTargetBlank = (node: Node): void => {
  if (!(node instanceof Element) || node.tagName !== 'A' || !node.hasAttribute('href')) return;
  node.setAttribute('target', '_blank');
  node.setAttribute('rel', 'noopener noreferrer');
};

// DOMPurify hooks are global, so add/remove around each call to avoid leaking into other sanitize() calls in the app.
const sanitizeContent = (value: string, allowBase64Images: boolean): string => {
  DOMPurify.addHook('uponSanitizeElement', restrictIframeSrc);
  if (!allowBase64Images) DOMPurify.addHook('uponSanitizeElement', removeDisallowedBase64Image);
  DOMPurify.addHook('afterSanitizeAttributes', forceLinkTargetBlank);
  const result = DOMPurify.sanitize(value, { USE_PROFILES: { html: true }, ADD_TAGS: ['iframe'], ADD_ATTR: ['allowfullscreen', 'frameborder'] });
  DOMPurify.removeHook('afterSanitizeAttributes', forceLinkTargetBlank);
  if (!allowBase64Images) DOMPurify.removeHook('uponSanitizeElement', removeDisallowedBase64Image);
  DOMPurify.removeHook('uponSanitizeElement', restrictIframeSrc);
  return result;
};

export const JoditEditorWrapper: FC<IJoditEditorProps> = (props) => {
  const { config, value, onChange, allowBase64Images, id } = props;

  const sanitizedValue = useMemo(() => (!isNullOrWhiteSpace(value) ? sanitizeContent(value, allowBase64Images) : ""),
    [value, allowBase64Images],
  );

  // Jodit's own sanitizer denies <iframe> and sandboxes survivors, breaking embeds; ALLOWED_IFRAME_SRC guards these.
  // link.processVideoLink is disabled so a pasted YouTube/Vimeo URL becomes a plain clickable link, not an embed.
  const mergedConfig = useMemo<NonNullable<JoditConfig>>(() => ({
    ...config,
    cleanHTML: {
      ...config?.cleanHTML,
      denyTags: 'script,object,embed',
      sandboxIframesInContent: false,
    },
    link: {
      ...config?.link,
      processVideoLink: false,
    },
  }), [config]);

  const handleBlur = (newValue: string): void => {
    const cleanValue = typeof newValue === 'string'
      ? sanitizeContent(newValue, allowBase64Images)
      : newValue;
    onChange?.(cleanValue);
  };

  const handleEditorRef = useCallback((editor: JoditInstance) => {
    // rawValue is undefined for a genuine edit's internal resync, and a string only for an external `.value=` set.
    let hasUnsyncedEdit = false;
    editor.e.on('beforeSetValueToEditor', (rawValue: unknown) => {
      if (rawValue === undefined) {
        hasUnsyncedEdit = true;
        return undefined;
      }
      // Jodit also fires this on every keystroke sync with no argument; returning a string there overwrites the typing.
      return allowBase64Images || typeof rawValue !== 'string' ? undefined : sanitizeContent(rawValue, allowBase64Images);
    });

    // Flushes DOM-only content before a destroy (e.g. a config identity change) would otherwise silently drop it.
    editor.hookStatus('beforeDestruct', () => {
      if (hasUnsyncedEdit) {
        onChange?.(sanitizeContent(editor.value, allowBase64Images));
      }
    });
  }, [allowBase64Images, onChange]);

  const isSSR = typeof window === 'undefined';

  return isSSR ? (
    <Skeleton loading={true} />
  ) : (
    <Suspense fallback={<div>Loading editor...</div>}>
      <JoditEditor
        value={sanitizedValue}
        config={mergedConfig}
        {...(id ? { id } : {})}
        editorRef={handleEditorRef}
        onBlur={handleBlur} // preferred to use only this option to update the content for performance reasons
      />
    </Suspense>
  );
};

export default JoditEditorWrapper;
