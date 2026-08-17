import GooglePlacesAutocomplete, { GooglePlacesAutocompleteInputProps, IAddressAndCoords } from '@/components/googlePlacesAutocomplete';
import { CSSProperties, FC, Fragment, useEffect, useState } from 'react';
import * as React from 'react';
import ValidationErrors from '@/components/validationErrors';
import { getAddressValue, getSearchOptions, loadGooglePlaces } from './utils';
import { IAddressCompomentBaseProps } from './models';
import { useGet } from '@/hooks';
import { IOpenCageResponse } from '@/components/googlePlacesAutocomplete/models';
import { IStyleValue } from '@/providers/form/models';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { getNumericValue } from '@/utils/string';
import { InputRef } from 'antd';

interface IAutoCompletePlacesFieldProps extends IAddressCompomentBaseProps {
  value?: string;
  onChange?: (value: string) => void;
  /** The Appearance properties, so the suggestion list can share the input's appearance. */
  styleValue?: IStyleValue | undefined;

  readOnly?: boolean | undefined;
  disabled?: boolean | undefined;
  onFocus?: ((event: React.FocusEvent<HTMLInputElement, Element>) => void) | undefined;
  onSelect?: (address: IOpenCageResponse | IAddressAndCoords) => void;
  style?: CSSProperties | undefined;
  className?: string | undefined;
  inputRef?: React.Ref<InputRef> | undefined;
  /** Standard event handlers bound by the component, passed straight to the antd input. */
  inputProps?: GooglePlacesAutocompleteInputProps | undefined;
}

const AutoCompletePlacesControl: FC<IAutoCompletePlacesFieldProps> = (model) => {
  const { debounce, minCharactersSearch, onChange, openCageApiKey, placeholder, prefix, value, readOnly, disabled, googleMapsApiKey, onFocus, onSelect, style, className, inputRef, inputProps } = model;

  const { loading, error, refetch } = useGet<IOpenCageResponse>({
    base: 'https://api.opencagedata.com',
    path: '/geocode/v1/json',
    lazy: true,
  });

  const [googlePlaceReady, setGooglePlaceReady] = useState(false);

  useEffect(() => {
    if (isDefined(googleMapsApiKey) && !isDefined(window.google)) {
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
        // `disabled` and `readOnly` are distinct states: disabled greys the field out and takes it
        // out of the tab order, read-only keeps it looking and reading normally but blocks editing.
        // Read-only additionally suppresses the Places lookup, since there is nothing to select into.
        disabled={disabled === true}
        readOnly={readOnly === true}
        disableGoogleEvent={disableGoogleEvent}
        searchOptions={getSearchOptions(model)}
        style={style}
        className={className}
        inputRef={inputRef}
        inputProps={inputProps}
        styleValue={model.styleValue}

        onChange={onChange}
        onFocus={onFocus}
        onGeocodeChange={handleOnGeocodeChange}
      />
    </Fragment>
  );
};

export default AutoCompletePlacesControl;
