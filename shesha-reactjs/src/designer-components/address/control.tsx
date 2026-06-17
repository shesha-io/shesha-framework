import GooglePlacesAutocomplete, { IAddressAndCoords } from '@/components/googlePlacesAutocomplete';
import React, { CSSProperties, FC, Fragment, useEffect, useState } from 'react';
import ValidationErrors from '@/components/validationErrors';
import { getAddressValue, getSearchOptions, loadGooglePlaces } from './utils';
import { IAddressCompomentBaseProps } from './models';
import { useGet } from '@/hooks';
import { IOpenCageResponse } from '@/components/googlePlacesAutocomplete/models';
import { IStyleType } from '@/providers/form/models';
import { getNumericValue } from '@/utils/string';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

interface IAutoCompletePlacesFieldProps extends IAddressCompomentBaseProps /* UnwrapCodeEvaluators<IAddressCompomentProps>*/ {
  value?: string;
  onChange?: (value: string) => void;
  font?: IStyleType['font'];

  readOnly?: boolean | undefined;
  onFocus?: ((event: React.FocusEvent<HTMLInputElement, Element>) => void) | undefined;
  onSelect?: (address: IOpenCageResponse | IAddressAndCoords) => void;
  style?: CSSProperties | undefined;
}

const AutoCompletePlacesControl: FC<IAutoCompletePlacesFieldProps> = (model) => {
  const { debounce, minCharactersSearch, onChange, openCageApiKey, placeholder, prefix, value, readOnly, googleMapsApiKey, onFocus, onSelect, style } = model;

  const { loading, error, refetch } = useGet<IOpenCageResponse>({
    base: 'https://api.opencagedata.com',
    path: '/geocode/v1/json',
    lazy: true,
  });

  const [googlePlaceReady, setGooglePlaceReady] = useState(false);

  useEffect(() => {
    if (googleMapsApiKey && !isDefined(window.google)) {
      loadGooglePlaces(googleMapsApiKey, setGooglePlaceReady);
    }
  }, [googleMapsApiKey, googlePlaceReady]);

  const fetchAddressDetails = async (selected: IAddressAndCoords): Promise<IOpenCageResponse | IAddressAndCoords> => {
    if (isNullOrWhiteSpace(openCageApiKey))
      return selected;

    const { lat, lng } = selected;

    const details = await refetch({ queryParams: { key: openCageApiKey, q: `${lat} ${lng}` } });
    return { ...selected, ...details };
  };

  const disableGoogleEvent = (value: string): boolean =>
    isNullOrWhiteSpace(value) || value.length < getNumericValue(minCharactersSearch) - 1;

  const handleOnGeocodeChange = async (event: IAddressAndCoords): Promise<void> => {
    if (!isDefined(onSelect))
      return;

    const details = await fetchAddressDetails(event);
    onSelect(details);
    /*
      const expression = model.onSelectCustom;
      if (Boolean(expression)) {
        // Ensure lat/lng are preserved from event in case they were lost
        const addressData = {
          ...payload,
          ...event,
        };
        return !isNullOrWhiteSpace(expression)
          ? executeScriptSync(expression, addContextData(context, { event: addressData }))
          : Promise.resolve();
      }
        */
  };

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
        style={style}
        font={model.font}

        onChange={onChange}
        onFocus={onFocus}
        onGeocodeChange={handleOnGeocodeChange}
      />
    </Fragment>
  );
};

export default AutoCompletePlacesControl;
