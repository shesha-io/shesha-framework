import { MetadataProvider, QueryBuilderProvider } from '@/providers';
import { FC } from 'react';
import { JsonLogicTree } from '@react-awesome-query-builder/antd';
import { MetadataContext } from '@/providers/metadata/contexts';
import { isDefined } from '@/utils';
import QueryBuilderField from '@/designer-components/queryBuilder/queryBuilderField';

export interface IFormsFilterProps {
  value: JsonLogicTree | undefined;
  onChange: (value: JsonLogicTree | undefined) => void;
}

export const FormsFilter: FC<IFormsFilterProps> = ({ value, onChange }) => {
  return (
    <MetadataProvider modelType={{ module: "Shesha", name: "FormConfiguration" }}>
      <MetadataContext.Consumer>
        {(metadata) => isDefined(metadata?.metadata)
          ? (
            <QueryBuilderProvider id="QueryBuilderWrapper" metadata={metadata.metadata}>
              <QueryBuilderField
                value={value ?? undefined}
                onChange={(newValue) => {
                  onChange(newValue ?? undefined);
                }}
                jsonExpanded={false}
              />
              {/* <QueryBuilder
                value={value}
                onChange={(newValue) => {
                  onChange(newValue.logic);
                }}
              /> */}
            </QueryBuilderProvider>
          )
          : undefined}
      </MetadataContext.Consumer>
    </MetadataProvider>
  );
};
