import React, { FC, Fragment, useEffect } from 'react';

interface IProps {
  externalApiKey?: string;
}

const AddressEffect: FC<IProps> = ({ children, externalApiKey }) => {
  useEffect(() => {
    if (externalApiKey && !window.google) {
      const script = document.createElement('script');

      script.src = `https://maps.googleapis.com/maps/api/js?key=${externalApiKey}&v=3.exp&libraries=geometry,drawing,places`;
      script.async = true;

      document.body.appendChild(script);
    }
  }, [externalApiKey]);

  if (children) {
    return <Fragment>{children}</Fragment>;
  }

  return <Fragment />;
};

export default AddressEffect;
