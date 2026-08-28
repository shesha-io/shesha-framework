import { PropTypes } from 'react-places-autocomplete';
import { IEntityReferenceDto, IStyleValue } from '@/interfaces';
import { IAddressCompomentBaseProps } from './models';
import { COUNTRY_CODES } from '@/shesha-constants/country-codes';
import { isDefined, isNotNullOrWhiteSpace } from '@/utils/nullables';
import { getDisplayNameOrUndefined } from '@/utils/object';

/** Google's Places API accepts at most 5 entries in `componentRestrictions.country`. */
const MAX_COUNTRY_RESTRICTIONS = 5;

export const getAddressValue = (value: string | IEntityReferenceDto | null | undefined): string => {
  if (!isDefined(value)) return '';

  return typeof value === "string"
    ? value
    : getDisplayNameOrUndefined(value) ?? "";
};

export const getSearchOptions = (model: IAddressCompomentBaseProps): PropTypes['searchOptions'] => {
  const {
    countryRestriction,
    latPriority: lat,
    lngPriority: lng,
    radiusPriority: radius,
    showPriorityBounds,
  } = model;
  let result: PropTypes['searchOptions'] = {};

  const countries = (Array.isArray(countryRestriction)
    ? countryRestriction
    : [countryRestriction]
  ).filter(isNotNullOrWhiteSpace);

  if (countries.length > 0) {
    const countryCodes = countries
      .map((country) => {
        const byLabel = COUNTRY_CODES.find((item) => item.value === country);
        if (isDefined(byLabel)) return byLabel.code;
        const code = country.trim().toLowerCase();
        return COUNTRY_CODES.some((item) => item.code === code) ? code : undefined;
      })
      .filter(isDefined)
      // Google allows at most 5 countries in componentRestrictions and rejects the request
      // outright past that limit, so the list is capped rather than sent in full.
      .slice(0, MAX_COUNTRY_RESTRICTIONS);

    if (countryCodes.length > 0)
      result = { componentRestrictions: { country: countryCodes } };
  }

  try {
    // Latitude and longitude are checked with `isDefined` rather than for truthiness: 0 is a
    // valid coordinate (the equator / the prime meridian) and must not disable the bounds.
    // A radius of 0 is meaningless, so it is required to be positive.
    if (showPriorityBounds === true && isDefined(lat) && isDefined(lng) && isDefined(radius) && radius > 0) {
      result = { ...result, location: new google.maps.LatLng(lat, lng), radius };
    }
  } catch { /* nop */ }

  return result;
};

export const loadGooglePlaces = (googleMapsApiKey: string, callback: ((args: boolean) => void) | undefined): void => {
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


export const defaultStyles = (): IStyleValue => {
  return {
    // The full background set (not just type/color) so every Background input has a value to
    // inherit from — an inheritance popover only renders for properties present in the defaults.
    background: {
      type: 'color',
      color: '#fff',
      repeat: 'no-repeat',
      size: 'cover',
      position: 'center',
      gradient: { direction: 'to right', colors: [] },
      url: '',
    },
    font: { weight: '400', size: 14, color: '#000', type: 'Segoe UI', align: 'left' },
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
    shadow: { spreadRadius: 0, blurRadius: 0, color: '#000', offsetX: 0, offsetY: 0 },
    stylingBoxJson: {
      _type: 'styleBox',
      marginBottom: "0",
      marginLeft: "0",
      marginRight: "0",
      marginTop: "0",
      paddingBottom: "4",
      paddingLeft: "11",
      paddingRight: "11",
      paddingTop: "4",
    },
  };
};
