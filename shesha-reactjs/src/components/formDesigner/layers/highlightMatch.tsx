import { ReactNode } from 'react';

/** Wraps the first case-insensitive match of the query in <mark> */
export const highlightMatch = (text: string, query: string, className: string): ReactNode => {
  const needle = query.trim().toLowerCase();
  if (needle === '')
    return text;
  const start = text.toLowerCase().indexOf(needle);
  if (start < 0)
    return text;
  return (
    <>
      {text.slice(0, start)}
      <mark className={className}>{text.slice(start, start + needle.length)}</mark>
      {text.slice(start + needle.length)}
    </>
  );
};
