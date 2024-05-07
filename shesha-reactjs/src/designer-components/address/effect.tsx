import React, { FC, Fragment, PropsWithChildren, useEffect, useState } from 'react';
import { loadGooglePlaces } from './utils';

interface IProps {
  externalApiKey?: string;
}

const AddressEffect: FC<PropsWithChildren<IProps>> = ({ children, externalApiKey }) => {


  if (children) {
    return <Fragment>{children}</Fragment>;
  }

  return <Fragment />;
};

export default AddressEffect;
