import { Alert, Skeleton } from 'antd';
import React, { FC, lazy, use } from 'react';
import { useFormData, useGlobalState, useSubFormOrUndefined } from '@/providers';
import { useForm } from '@/providers/form';
import { evaluateString } from '@/providers/form/utils';
import { IMarkdownComponentProps } from './interfaces';
import './styles.module.scss'; // This manually loads github-markdown-css, as per https://raw.githubusercontent.com/sindresorhus/github-markdown-css/gh-pages/github-markdown.css

const remarkGfmPromise = import('remark-gfm').then((mod) => mod.default);
const darkPrismPromise = import('react-syntax-highlighter/dist/esm/styles/prism').then((mod) => mod.dark);

const ReactMarkdown = lazy(() => import('react-markdown'));
const SyntaxHighlighter = lazy(() => import('react-syntax-highlighter').then((mod) => ({ default: mod.Prism })));

type MarkdownWithGfmProps = {
  content: string;
  style?: React.CSSProperties;
};
const MarkdownWithGfm: FC<MarkdownWithGfmProps> = ({ content/* , style*/ }) => {
  const gfm = use(remarkGfmPromise);
  const dark = use(darkPrismPromise);

  return (
    <ReactMarkdown
      remarkPlugins={[gfm]}
      components={{
        // style: style,
        code(/* { node, inline, className, children, ...props }*/props) {
          const { inline, className, children } = props;
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={dark}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {/* {String(children).replace(/\n$/, '')} */}
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
  );
};

const Markdown: FC<IMarkdownComponentProps> = (model) => {
  const { formMode } = useForm();
  // NOTE: to be replaced with a generic context implementation
  const { value: subFormData } = useSubFormOrUndefined() ?? {};
  const { data: formData } = useFormData();
  const { globalState } = useGlobalState();

  const data = subFormData || formData;

  const content = evaluateString(model.content, { data, globalState });

  if (!content && formMode === 'designer') {
    return <Alert type="warning" title="Please make sure you enter the content to be displayed here!" />;
  }

  const isSSR = typeof window === 'undefined';

  return isSSR ? (
    <Skeleton loading={true} />
  ) : (
    <React.Suspense fallback={<div>Loading editor...</div>}>
      <div className="markdown-body" style={model.style}>
        <MarkdownWithGfm content={content} style={model.style} />
      </div>
    </React.Suspense>
  );
};

Markdown.displayName = 'Markdown';

export { Markdown };
export default Markdown;
