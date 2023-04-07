import { message } from 'antd';
import moment from 'moment';
import React, { FC, Fragment } from 'react';
import { useGet } from 'restful-react';
import { useForm, useGlobalState, useSheshaApplication } from '../../../..';
import { axiosHttp } from '../../../../utils/fetchers';
import GooglePlacesAutocomplete, { IAddressAndCoords } from '../../../googlePlacesAutocomplete';
import { IOpenCageResponse } from '../../../googlePlacesAutocomplete/models';
import ValidationErrors from '../../../validationErrors';
import { customAddressEventHandler } from '../utils';
import { IAddressCompomentProps } from './models';
import { getAddressValue, getSearchOptions } from './utils';

interface IAutoCompletePlacesFieldProps extends IAddressCompomentProps {
  value?: any;
  onChange?: Function;
}

const AutoCompletePlacesControl: FC<IAutoCompletePlacesFieldProps> = model => {
  const { debounce, minCharactersSearch, onChange, openCageApiKey, placeholder, prefix, value } = model;

  const { loading, error, refetch } = useGet<IOpenCageResponse>({
    base: 'https://api.opencagedata.com',
    path: '/geocode/v1/json',
    lazy: true,
  });

  const { form, formMode, formData, setFormDataAndInstance } = useForm();
  const { globalState, setState: setGlobalState } = useGlobalState();
  const { backendUrl } = useSheshaApplication();

  const onSelect = (selected: IAddressAndCoords): Promise<IOpenCageResponse | IAddressAndCoords> =>
    new Promise((resolve, reject) => {
      const { lat, lng } = selected;

      try {
        if (openCageApiKey) {
          refetch({ queryParams: { key: openCageApiKey, q: `${lat} ${lng}` } })
            .then(result => resolve({ ...selected, ...result }))
            .catch(reject);
        } else resolve(selected);
      } catch (error) {
        reject(error);
      }
    });

  const disableGoogleEvent = (value: string) =>
    (value?.length || 0) < parseInt((minCharactersSearch as string) || '0', 10) - 1;

  const eventProps = {
    model,
    form,
    formData,
    formMode,
    globalState,
    http: axiosHttp(backendUrl),
    message,
    moment,
    setFormData: setFormDataAndInstance,
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
        disableGoogleEvent={disableGoogleEvent}
        searchOptions={getSearchOptions(model)}
        {...customAddressEventHandler(eventProps)}
      />
    </Fragment>
  );
};

export default AutoCompletePlacesControl;
