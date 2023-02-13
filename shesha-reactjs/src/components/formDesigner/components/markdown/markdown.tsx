import { Alert, Skeleton } from 'antd';
import React, { FC, lazy } from 'react';
import { useGlobalState, useSubForm } from '../../../../providers';
import { useForm } from '../../../../providers/form';
import { evaluateString, getStyle } from '../../../../providers/form/utils';
import { IMarkdownProps } from './interfaces';
import './styles.less'; // This manually loads github-markdown-css, as per https://raw.githubusercontent.com/sindresorhus/github-markdown-css/gh-pages/github-markdown.css

let SyntaxHighlighter;
let dark;
let remarkGfm;

const ReactMarkdown = lazy(async () => {
  import('remark-gfm').then(module => {
    remarkGfm = module?.default;
  });

  import('react-syntax-highlighter').then(module => {
    SyntaxHighlighter = module?.Prism;
  });

  import('react-syntax-highlighter/dist/esm/styles/prism').then(module => {
    dark = module?.dark;
  });

  return import('react-markdown');
});

const Markdown: FC<IMarkdownProps> = model => {
  const { formData, formMode } = useForm();
  const { value } = useSubForm();
  const { globalState } = useGlobalState();

  const data = value || formData;

  const content = evaluateString(model?.content, { data, globalState });

  if (!content && formMode === 'designer') {
    return <Alert type="warning" message="Please make sure you enter the content to be displayed here!" />;
  }

  const isSSR = typeof window === 'undefined';

  return isSSR ? (
    <Skeleton loading={true} />
  ) : (
    <React.Suspense fallback={<div>Loading editor...</div>}>
      <div className="markdown-body" style={getStyle(model?.style, { data, globalState })}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]?.filter(Boolean)}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match && SyntaxHighlighter ? (
                <SyntaxHighlighter
                  children={String(children).replace(/\n$/, '')}
                  style={dark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                />
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
