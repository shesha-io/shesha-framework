import React, { FC } from 'react';
import { ReferenceListItemDto } from '../../../../../apis/referenceList';

interface IToolTipProps {
  currentStatus: ReferenceListItemDto;
  showReflistName: boolean;
}

const ToolTipTittle: FC<IToolTipProps> = ({ currentStatus, showReflistName }) => {

  const hasDescription = !!currentStatus?.description;
  return (
    <>
      {hasDescription && showReflistName ? (
        !!currentStatus?.description ? <span>Description: {currentStatus?.description}</span> : null
      ) : (
        <>
          {!!currentStatus?.item ? <span>DisplayName: {currentStatus?.item}</span> : null}
          <br />
          {hasDescription ? <span>Description: {currentStatus?.description}</span> : null}
        </>
      )}
    </>
  );
};


export default ToolTipTittle;
