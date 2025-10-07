import { PropTypes } from 'react-places-autocomplete';
import { IEntityReferenceDto, IStyleType } from '@/interfaces';
import { IAddressCompomentProps } from './models';
import { COUNTRY_CODES } from '@/shesha-constants/country-codes';

export const EXPOSED_VARIABLES = [
  {
    id: 'd430d31c-9360-4b57-96cc-3c322de31e59',
    name: 'data',
    description: 'Selected form values',
    type: 'object',
  },
  {
    id: 'c96aff24-3717-49f0-836f-bd6a9f2f4944',
    name: 'event',
    description: 'Event callback when user input',
    type: 'object',
  },
  {
    id: '6597be4e-0364-4cd5-9dde-9338bb0cd30d',
    name: 'form',
    description: 'Form instance',
    type: 'FormInstance',
  },
  {
    id: 'ffc4dec1-a53c-4106-8102-1985b9a1b69b',
    name: 'formMode',
    description: 'The form mode',
    type: "'readonly' | 'edit' | 'designer'",
  },
  {
    id: '5a367dfe-70e4-4521-96ba-bdee1336592a',
    name: 'globalState',
    description: 'The global state of the application',
    type: 'object',
  },
  {
    id: '73d980c8-bec1-4c77-b44a-3b769f085fc2',
    name: 'http',
    description: 'axios instance used to make http requests',
    type: 'object',
  },
  {
    id: '07143298-04c3-4cbc-8c80-208a79e77c14',
    name: 'message',
    description:
      'This is the Ant API for displaying toast messages. See: https://ant.design/components/message/#header',
    type: 'object',
  },
  {
    id: 'd4e035cc-e1f8-4186-95fa-a444c0f9bb29',
    name: 'moment',
    description: 'The moment.js object',
    type: 'object',
  },
  {
    id: 'b13ac5c2-e944-4b22-a41f-9af577df0388',
    name: 'setFormData',
    description: 'A function used to update the form data',
    type: '({ values: object, mergeValues: boolean}) => void',
  },
  {
    id: 'cb94503f-49d1-4f58-a24b-7ef6b5d4d4a7',
    name: 'setGlobalState',
    description: 'Setting the global state of the application',
    type: '(payload: { key: string, data: any } ) => void',
  },
];

export const getAddressValue = (value: string | IEntityReferenceDto): string => {
  if (!value) return '';

  if (typeof value !== 'string' && value?.id) return value?._displayName;

  return value as string;
};

export const getSearchOptions = (model: IAddressCompomentProps): PropTypes['searchOptions'] => {
  const {
    countryRestriction: country,
    latPriority: lat,
    lngPriority: lng,
    radiusPriority: radius,
    showPriorityBounds,
  } = model;
  let result = {} as PropTypes['searchOptions'];

  if (country?.length) {
    const countryCodes = country.map((countryLabel) => {
      const foundCountry = COUNTRY_CODES.find((item) => item.value === countryLabel);
      return foundCountry ? foundCountry.code : countryLabel;
    });
    result = { componentRestrictions: { country: countryCodes } };
  }

  try {
    if (showPriorityBounds && lat && lng && radius) {
      result = { ...result, location: new google.maps.LatLng(lat, lng), radius };
    }
  } catch { /* nop */ }

  return result;
};

export const loadGooglePlaces = (googleMapsApiKey: string, callback: Function): void => {
  const existingScript = document.getElementById("googlePlacesScript");
  if (!existingScript) {
    const script = document.createElement("script");
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.id = "googleMaps";
    document.body.appendChild(script);
    script.onload = () => {
      if (callback) callback(true);
    };
  }
  if (existingScript && callback) callback(true);
};


export const defaultStyles = (): IStyleType => {
  return {
    background: { type: 'color', color: '#fff' },
    font: { weight: '400', size: 14, color: '#000', type: 'Segoe UI' },
    border: {
      border: {
        all: { width: '1px', style: 'solid', color: '#d9d9d9' },
        top: { width: '1px', style: 'solid', color: '#d9d9d9' },
        bottom: { width: '1px', style: 'solid', color: '#d9d9d9' },
        left: { width: '1px', style: 'solid', color: '#d9d9d9' },
        right: { width: '1px', style: 'solid', color: '#d9d9d9' },
      },
      radius: { all: 8, topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
      borderType: 'all',
      radiusType: 'all',
    },
    dimensions: { width: '100%', height: '32px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
  };
};
