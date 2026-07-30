import React, { FC, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { getSettings } from './refListItemsSettingsForm';
import { useRefListItemGroupConfigurator } from '../provider';
import { getComponentModel } from '../provider/utils';
import { ConfigurableForm } from '@/components/configurableForm';
import { useFormViaFactory } from '@/form-factory/hooks';
import { OnFormValuesChangeHandler } from '@/components/configurableForm/models';
import { RefListGroupItemProps } from '../provider/models';
import { isNullOrWhiteSpace } from '@/utils/nullables';

export const RefListItemProperties: FC = () => {
  const { selectedItemId, getItem, updateItem, readOnly } = useRefListItemGroupConfigurator();
  const markup = useFormViaFactory(getSettings);

  // The id is passed as an argument rather than captured: use-debounce invokes the latest
  // callback with the queued arguments, so a pending save would otherwise land on whichever
  // item is selected when it fires (#5125).
  const debouncedSave = useDebouncedCallback(
    (id: string, values: RefListGroupItemProps) => {
      updateItem({ id: id, settings: values });
    },
    // delay in ms
    300,
  );

  const handleValuesChange = useCallback<OnFormValuesChangeHandler<RefListGroupItemProps>>(
    (_, values) => {
      if (!isNullOrWhiteSpace(selectedItemId))
        debouncedSave(selectedItemId, values);
    },
    [debouncedSave, selectedItemId],
  );

  useEffect(() => {
    return () => {
      debouncedSave.flush();
    };
  }, [debouncedSave, selectedItemId]);

  // note: we have to memoize the editor to prevent unneeded re-rendering and loosing of the focus
  const editor = useMemo<ReactNode>(() => {
    if (isNullOrWhiteSpace(selectedItemId)) return null;
    const item = getItem(selectedItemId);
    if (!item) return null;

    const componentModel = getComponentModel(item);

    // note: no shared form instance - the keyed remount must start from an empty store, otherwise
    // rc-field-form merges the previously selected item's values over these initialValues (#5125)
    return (
      <ConfigurableForm<RefListGroupItemProps>
        key={selectedItemId}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        mode={readOnly ? 'readonly' : 'edit'}
        markup={markup}
        initialValues={componentModel}
        onValuesChange={handleValuesChange}
      />
    );
  }, [handleValuesChange, getItem, markup, readOnly, selectedItemId]);

  return <>{editor}</>;
};

export default RefListItemProperties;
