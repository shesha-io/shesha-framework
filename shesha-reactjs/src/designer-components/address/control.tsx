import GooglePlacesAutocomplete, { IAddressAndCoords } from '@/components/googlePlacesAutocomplete';
import React, { FC, Fragment, useEffect, useState } from 'react';
import ValidationErrors from '@/components/validationErrors';
import { getAddressValue, getSearchOptions, loadGooglePlaces } from './utils';
import { IAddressCompomentProps } from './models';
import { useGet } from '@/hooks';
import { IOpenCageResponse } from '@/components/googlePlacesAutocomplete/models';
import { customAddressEventHandler } from '@/components/formDesigner/components/utils';
import { IStyleType, useAvailableConstantsData } from '@/index';

interface IAutoCompletePlacesFieldProps extends IAddressCompomentProps {
  value?: any;
  onChange?: (...args) => void;
  font?: IStyleType['font'];
}

const AutoCompletePlacesControl: FC<IAutoCompletePlacesFieldProps> = (model) => {
  const { debounce, minCharactersSearch, onChange, openCageApiKey, placeholder, prefix, value, readOnly, googleMapsApiKey, onFocusCustom } = model;

  const { loading, error, refetch } = useGet<IOpenCageResponse>({
    base: 'https://api.opencagedata.com',
    path: '/geocode/v1/json',
    lazy: true,
  });

  const allData = useAvailableConstantsData();
  const [googlePlaceReady, setGooglePlaceReady] = useState(false);

  useEffect(() => {
    if (googleMapsApiKey && !window.google) {
      loadGooglePlaces(googleMapsApiKey, setGooglePlaceReady);
    }
  }, [googleMapsApiKey, googlePlaceReady]);

  const onSelect = (selected: IAddressAndCoords): Promise<IOpenCageResponse | IAddressAndCoords> =>
    new Promise((resolve, reject) => {
      const { lat, lng } = selected;

      try {
        if (openCageApiKey) {
          refetch({ queryParams: { key: openCageApiKey, q: `${lat} ${lng}` } })
            .then((result) => resolve({ ...selected, ...result }))
            .catch(reject);
        } else resolve(selected);
      } catch (error) {
        reject(new Error(error));
      }
    });

  const disableGoogleEvent = (value: string): boolean =>
    (value?.length || 0) < parseInt((minCharactersSearch as string) || '0', 10) - 1;

  return (
    <Fragment>
      <ValidationErrors error={error} />

      <GooglePlacesAutocomplete
        value={getAddressValue(value)}
        debounce={debounce}
        externalLoader={loading}
        placeholder={placeholder}
        prefix={prefix}
        disabled={readOnly}
        disableGoogleEvent={disableGoogleEvent}
        searchOptions={getSearchOptions(model)}
        style={model.allStyles.fullStyle}
        font={model.font}
        {...customAddressEventHandler(model, allData, onChange, onSelect, onFocusCustom)}
      />
    </Fragment>
  );
};

export default AutoCompletePlacesControl;
