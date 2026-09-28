import React from 'react';
import { Segmented } from 'antd';
import type { Severity } from './issueModel';
import { FieldValidationError } from '@/interfaces';

export type SeverityFilterValue = 'all' | Severity;

type UseSeverityFilterResponse = {
  value: SeverityFilterValue;
  setValue: (v: SeverityFilterValue) => void;
  counts: { all: number; error: number; warn: number };
  filtered: FieldValidationError[];
};

export const useSeverityFilter = (issues: FieldValidationError[], initial: SeverityFilterValue = 'all'): UseSeverityFilterResponse => {
  const [value, setValue] = React.useState<SeverityFilterValue>(initial);

  const counts = React.useMemo(() => {
    const error = issues.filter((i) => i.severity === 'error').length;
    return { error, warn: issues.length - error, all: issues.length };
  }, [issues]);

  const filtered = React.useMemo(
    () => (value === 'all' ? issues : issues.filter((i) => i.severity === value)),
    [issues, value],
  );

  return { value, setValue, counts, filtered };
};

export const SeverityFilter: React.FC<{
  value: SeverityFilterValue;
  onChange: (v: SeverityFilterValue) => void;
  counts: { all: number; error: number; warn: number };
}> = ({ value, onChange, counts }) => (
  <Segmented
    size="small"
    value={value}
    onChange={(v) => onChange(v as SeverityFilterValue)}
    options={[
      { label: `All (${counts.all})`, value: 'all' },
      { label: `Errors (${counts.error})`, value: 'error' },
      { label: `Warnings (${counts.warn})`, value: 'warn' },
    ]}
  />
);
