import { useConfigurationStudio } from '@/configuration-studio/cs/contexts';
import { useActiveDoc } from '@/configuration-studio/cs/hooks';
import React, { FC } from 'react';

export const ItemToolbarHolder: FC = () => {
  const cs = useConfigurationStudio();
  useActiveDoc();
  return (
    <div ref={cs.toolbarRef}>
    </div>
  );
};
