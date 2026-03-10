import { Alert, Skeleton } from 'antd';
import React, { FC, lazy } from 'react';
import { useFormData, useGlobalState, useSubForm } from '@/providers';
import { useForm } from '@/providers/form';
import { evaluateString } from '@/providers/form/utils';
import { IMarkdownComponentProps } from './interfaces';
import './styles.module.scss'; // This manually loads github-markdown-css, as per https://raw.githubusercontent.com/sindresorhus/github-markdown-css/gh-pages/github-markdown.css

let SyntaxHighlighter;
let dark;
let remarkGfm;

const ReactMarkdown = lazy(async () => {
  const remarkGfmModule = await import('remark-gfm');
  remarkGfm = remarkGfmModule?.default;

  const syntaxHighlighterModule = await import('react-syntax-highlighter');
  SyntaxHighlighter = syntaxHighlighterModule?.Prism;

  const darkModule = await import('react-syntax-highlighter/dist/esm/styles/prism');
  dark = darkModule?.dark;

  return import('react-markdown');
});

const Markdown: FC<IMarkdownComponentProps> = (model) => {
  const { formMode } = useForm();
  // NOTE: to be replaced with a generic context implementation
  const { value: subFormData } = useSubForm(false) ?? {};
  const { data: formData } = useFormData();
  const { globalState } = useGlobalState();

  const data = subFormData || formData;

  const content = evaluateString(model?.content, { data, globalState });

  if (!content && formMode === 'designer') {
    return <Alert type="warning" message="Please make sure you enter the content to be displayed here!" />;
  }

  const isSSR = typeof window === 'undefined';

  return isSSR ? (
    <Skeleton loading={true} />
  ) : (
    <React.Suspense fallback={<div>Loading editor...</div>}>
      <div className="markdown-body" style={model.style}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]?.filter(Boolean)}
          components={{
            style: model.style as any,
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match && SyntaxHighlighter ? (
                <SyntaxHighlighter
                  style={dark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </React.Suspense>
  );
};

Markdown.displayName = 'Markdown';

export { Markdown };
export default Markdown;
