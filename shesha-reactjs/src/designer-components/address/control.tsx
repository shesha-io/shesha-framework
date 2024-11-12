import GooglePlacesAutocomplete, { IAddressAndCoords } from '@/components/googlePlacesAutocomplete';
import moment from 'moment';
import React, { FC, Fragment, useEffect, useState } from 'react';
import ValidationErrors from '@/components/validationErrors';
import { axiosHttp } from '@/utils/fetchers';
import { getAddressValue, getSearchOptions, loadGooglePlaces } from './utils';
import { IAddressCompomentProps } from './models';
import { App } from 'antd';
import { useForm, useGlobalState, useSheshaApplication } from '@/providers';
import { useGet } from '@/hooks';
import { IOpenCageResponse } from '@/components/googlePlacesAutocomplete/models';
import { customAddressEventHandler } from '@/components/formDesigner/components/utils';
import { getFormApi } from '@/providers/form/formApi';

interface IAutoCompletePlacesFieldProps extends IAddressCompomentProps {
  value?: any;
  onChange?: (...args) => void;
}

const AutoCompletePlacesControl: FC<IAutoCompletePlacesFieldProps> = (model) => {
  const { debounce, minCharactersSearch, onChange, openCageApiKey, placeholder, prefix, value, readOnly, googleMapsApiKey } = model;

  const { loading, error, refetch } = useGet<IOpenCageResponse>({
    base: 'https://api.opencagedata.com',
    path: '/geocode/v1/json',
    lazy: true,
  });

  const form = useForm();
  const { globalState, setState: setGlobalState } = useGlobalState();
  const { backendUrl } = useSheshaApplication();
  const [googlePlaceReady, setGooglePlaceReady] = useState(false);
  const { message } = App.useApp();

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

  const disableGoogleEvent = (value: string) =>
    (value?.length || 0) < parseInt((minCharactersSearch as string) || '0', 10) - 1;

  const eventProps = {
    model,
    form: getFormApi(form),
    formData: form.formData,
    globalState,
    http: axiosHttp(backendUrl),
    message,
    moment,
    setGlobalState,
    onChange,
    onSelect,
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
        {...customAddressEventHandler(eventProps)}
      />
    </Fragment>
  );
};

export default AutoCompletePlacesControl;
