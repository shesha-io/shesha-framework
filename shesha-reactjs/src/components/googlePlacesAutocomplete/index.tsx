import React, { FC, CSSProperties, useRef, useState } from 'react';
import PlacesAutocomplete, { geocodeByAddress, getLatLng, PropTypes } from 'react-places-autocomplete';
import { Input, App } from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { LatLngPolygon, PointPolygon, pointsInPolygon } from '@/utils/googleMaps';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { useStyles } from './styles/styles';
import { IStyleType } from '@/interfaces';

export interface IAddressAndCoords {
  address: string;
  lat?: number;
  lng?: number;
}

const KeyCodes = {
  ArrowDown: 40,
  ArrowUp: 38,
  Enter: 13,
};

interface ISuggestion {
  placeId: string;
  description: string;
}

export interface IGooglePlacesAutocompleteProps {
  disableGoogleEvent?: (value: string) => boolean;
  debounce?: number;
  externalLoader?: boolean;
  isInvalid?: boolean;
  onGeocodeChange?: (payload?: IAddressAndCoords) => void;
  onChange?: (payload?: string) => void;
  value?: string;
  selectedValue?: string;
  help?: string;
  placeholder?: string;
  prefix?: string;
  label?: string;
  disabled?: boolean;
  ignoreText?: string;
  tabIndex?: number;
  biasedCoordinates?: LatLngPolygon | PointPolygon;
  style?: CSSProperties;
  size?: SizeType;
  font?: IStyleType['font'];
  searchOptions?: PropTypes['searchOptions'];
  onFocus?: (payload: any) => void;
  onBlur?: (payload: string) => void;
}

const GooglePlacesAutocomplete: FC<IGooglePlacesAutocompleteProps> = ({
  disableGoogleEvent,
  debounce,
  externalLoader,
  onChange,
  value,
  selectedValue,
  placeholder = 'Search places',
  prefix,
  onGeocodeChange,
  disabled,
  ignoreText,
  tabIndex,
  biasedCoordinates,
  style,
  font,
  size,
  searchOptions,
  onFocus,
}) => {
  const { styles } = useStyles({ fontFamily: font?.type, fontWeight: font?.weight, textAlign: font?.align, color: font?.color, fontSize: font?.size });
  const [highlightedPlaceId, setHighlightedPlaceId] = useState('');
  const [showSuggestionsDropdownContainer, setShowSuggestionsDropdownContainer] = useState(true);
  const suggestionRef = useRef<ISuggestion[]>([]);
  const { notification } = App.useApp();

  if (typeof window === 'undefined' || !(typeof window.google === 'object' && typeof window.google.maps === 'object'))
    return null;

  const handleChange = (localAddress: string): void => {
    try {
      if (onChange) {
        if (localAddress) {
          onChange(localAddress);
        } else {
          onChange(null);
        }
      }
    } catch {
      console.error('PlacesAutocomplete.handleChange error address: ', localAddress);
    }
  };

  const handleSelect = (localAddress: string): void => {
    try {
      if (onChange) {
        onChange(localAddress);
      }
      geocodeByAddress(localAddress)
        .then((results) => getLatLng(results[0]))
        .then(({ lat, lng }) => {
          if (biasedCoordinates) {
            if (pointsInPolygon([lat, lng], biasedCoordinates)) {
              onGeocodeChange({
                address: localAddress,
                lat,
                lng,
              });
            } else {
              handleChange('');
              notification.warning({
                message: 'Address out of bounds',
                description: 'Please make sure that you select an address that is within the region!',
              });
            }
          } else {
            onGeocodeChange({
              address: localAddress,
              lat,
              lng,
            });
          }
        })
        .catch((error) => {
          console.error('Error no coords', error);
        });
    } catch {
      console.error('PlacesAutocomplete.handleSelect error address: ', value);
    }
  };

  const displayValue = selectedValue || value;
  const inputPrefix = externalLoader ? <LoadingOutlined /> : <SearchOutlined />;

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (!suggestionRef.current || suggestionRef?.current?.length === 0) return;

    const suggestions = suggestionRef.current;

    const foundIndex = highlightedPlaceId
      ? suggestions?.map(({ placeId }) => placeId)?.indexOf(highlightedPlaceId)
      : -1;

    const firstIndex = 0;

    const lastIndex = suggestions?.length - 1;

    if (event.keyCode === KeyCodes.ArrowUp || event.keyCode === KeyCodes.ArrowDown) {
      let suggestion: ISuggestion;

      if (event.keyCode === KeyCodes.ArrowUp) {
        if (!highlightedPlaceId) {
          suggestion = suggestions[lastIndex]; // Return the last one if the highlighted is empty
        } else {
          if (foundIndex === firstIndex) {
            suggestion = suggestions[lastIndex]; // It's the first one, go to the last one
          } else {
            suggestion = suggestions[foundIndex - 1]; // Go to the previous one
          }
        }
      } else if (event.keyCode === KeyCodes.ArrowDown) {
        if (!highlightedPlaceId) {
          suggestion = suggestions[firstIndex]; // Return the first one if the highlighted is empty
        } else {
          if (foundIndex === lastIndex) {
            suggestion = suggestions[firstIndex]; // It's the last element, so select the first one
          } else {
            suggestion = suggestions[foundIndex + 1]; // Go to the next one
          }
        }
      }

      setHighlightedPlaceId(suggestion.placeId);
    } else if (event.keyCode === KeyCodes.Enter) {
      if (highlightedPlaceId) {
        const foundDescription = suggestions?.find(({ placeId }) => placeId === highlightedPlaceId)?.description;

        if (foundDescription) {
          handleSelect(ignoreText ? foundDescription?.replace(ignoreText, '') : foundDescription);
          setShowSuggestionsDropdownContainer(false);
        }
      }
    } else {
      setShowSuggestionsDropdownContainer(true);
    }
  };

  const onBlur = (): void => setShowSuggestionsDropdownContainer(false);

  const handleFocus = (event): void => onFocus(event);
  return (
    // @ts-ignore
    <PlacesAutocomplete
      value={(prefix ? `${prefix} ${displayValue}` : displayValue) ?? ''}
      onChange={handleChange}
      onSelect={handleSelect}
      debounce={debounce}
      searchOptions={searchOptions}
    >
      {({ getInputProps, suggestions, getSuggestionItemProps }) => (
        <div className={styles.locationSearchInputWrapper}>
          {(() => {
            const inputProps = getInputProps({ placeholder });

            if (suggestions?.length === 0) {
              setHighlightedPlaceId('');
              suggestionRef.current = [];
            } else {
              suggestionRef.current = suggestions.map(({ placeId, description }) => ({ placeId, description }));
            }

            return (
              <Input
                value={displayValue}
                onChange={(e) => {
                  if (inputProps.onChange) {
                    const {
                      target: { value: realValue },
                    } = e;
                    handleChange(realValue);
                    if (!disableGoogleEvent?.(value)) {
                      inputProps.onChange(e);
                    }
                  }
                }}
                allowClear
                placeholder={placeholder}
                prefix={inputPrefix}
                disabled={disabled}
                tabIndex={tabIndex}
                onKeyDown={onKeyDown}
                onBlur={onBlur}
                onFocus={handleFocus}
                style={style}
                size={size}
              />
            );
          })()}
          <div
            className={classNames(styles.dropdownContainer, {
              hidden: !showSuggestionsDropdownContainer,
            })}
          >
            {suggestions.map((suggestion) => {
              const localSuggestion = { ...suggestion };
              localSuggestion.description = ignoreText
                ? suggestion.description?.replace(ignoreText, '')
                : suggestion.description;

              return (
                <div
                  {...getSuggestionItemProps(localSuggestion)}
                  className={classNames(styles.suggestionContainer, {
                    highlighted: highlightedPlaceId === localSuggestion?.placeId,
                  })}
                  key={localSuggestion?.placeId}
                >
                  <div className={styles.suggestion}>{localSuggestion?.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PlacesAutocomplete>
  );
};

export default GooglePlacesAutocomplete;
