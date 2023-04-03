import React, { FC } from 'react';
import { ReferenceListItemDto } from '../../../../../apis/referenceList';

interface IToolTipProps {
  currentStatus: ReferenceListItemDto;
  showReflistName: boolean;
}

const ToolTipTittle: FC<IToolTipProps> = ({ currentStatus, showReflistName }) => {
  return (
    <>
      {showReflistName ? (
        <span>Description: {currentStatus?.description}</span>
      ) : (
        <>
          <span>DisplayName: {currentStatus?.item}</span>
          <br />
          <span>Description: {currentStatus?.description}</span>
        </>
      )}
    </>
  );
};

export default ToolTipTittle;
