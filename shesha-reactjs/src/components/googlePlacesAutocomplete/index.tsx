import React, { FC, useRef, useState } from 'react';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { Input, notification } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { LatLngPolygon, PointPolygon, pointsInPolygon } from '../../utils/googleMaps';
import { CSSProperties } from 'react';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

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
  isInvalid?: boolean;
  onGeocodeChange?: (payload?: IAddressAndCoords) => void;
  onChange?: (payload?: string) => void;
  value?: string;
  selectedValue?: string;
  help?: string;
  placeholder?: string;
  prefixText?: string;
  label?: string;
  disabled?: boolean;
  ignoreText?: string;
  tabIndex?: number;
  biasedCoordinates?: LatLngPolygon | PointPolygon;
  style?: CSSProperties;
  size?: SizeType;
}

const GooglePlacesAutocomplete: FC<IGooglePlacesAutocompleteProps> = ({
  onChange,
  value,
  selectedValue,
  placeholder = 'Search places',
  prefixText,
  onGeocodeChange,
  disabled,
  ignoreText,
  tabIndex,
  biasedCoordinates,
  style,
  size,
}) => {
  const [highlightedPlaceId, setHighlightedPlaceId] = useState('');
  const [showSuggestionsDropdownContainer, setShowSuggestionsDropdownContainer] = useState(true);
  const suggestionRef = useRef<ISuggestion[]>([]);

  if (typeof window === 'undefined' || !(typeof window.google === 'object' && typeof window.google.maps === 'object'))
    return null;

  const handleChange = (localAddress: string) => {
    try {
      if (onChange) {
        if (localAddress) {
          onChange(localAddress);
        } else {
          onChange(null);
        }
      }
    } catch (error) {
      console.log('PlacesAutocomplete._this.handleChange error address: ', localAddress);
    }
  };

  const handleSelect = (localAddress: string) => {
    try {
      if (onChange) {
        onChange(localAddress);
      }
      geocodeByAddress(localAddress)
        .then(results => getLatLng(results[0]))
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
        .catch(error => {
          console.error('Error no coords', error);
        });
    } catch (error) {
      console.log('PlacesAutocomplete._this.handleSelect error address: ', value);
    }
  };

  const displayValue = selectedValue || value;

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestionRef.current || suggestionRef?.current?.length === 0) return;

    const _suggestions = suggestionRef.current;

    const foundIndex = highlightedPlaceId
      ? _suggestions?.map(({ placeId }) => placeId)?.indexOf(highlightedPlaceId)
      : -1;

    const firstIndex = 0;

    const lastIndex = _suggestions?.length - 1;

    if (event.keyCode === KeyCodes.ArrowUp || event.keyCode === KeyCodes.ArrowDown) {
      let suggestion: ISuggestion;

      if (event.keyCode === KeyCodes.ArrowUp) {
        if (!highlightedPlaceId) {
          suggestion = _suggestions[lastIndex]; // Return the last one if the highlighted is empty
        } else {
          if (foundIndex === firstIndex) {
            suggestion = _suggestions[lastIndex]; // It's the first one, go to the last one
          } else {
            suggestion = _suggestions[foundIndex - 1]; // Go to the previous one
          }
        }
      } else if (event.keyCode === KeyCodes.ArrowDown) {
        if (!highlightedPlaceId) {
          suggestion = _suggestions[firstIndex]; // Return the first one if the highlighted is empty
        } else {
          if (foundIndex === lastIndex) {
            suggestion = _suggestions[firstIndex]; // It's the last element, so select the first one
          } else {
            suggestion = _suggestions[foundIndex + 1]; // Go to the next one
          }
        }
      }

      setHighlightedPlaceId(suggestion.placeId);
    } else if (event.keyCode === KeyCodes.Enter) {
      if (highlightedPlaceId) {
        const foundDescription = _suggestions?.find(({ placeId }) => placeId === highlightedPlaceId)?.description;

        if (foundDescription) {
          handleSelect(ignoreText ? foundDescription?.replace(ignoreText, '') : foundDescription);
          setShowSuggestionsDropdownContainer(false);
        }
      }
    } else {
      setShowSuggestionsDropdownContainer(true);
    }
  };

  const onBlur = () => setShowSuggestionsDropdownContainer(false);

  return (
    // @ts-ignore
    <PlacesAutocomplete
      value={(prefixText ? `${prefixText} ${displayValue}` : displayValue) ?? ''}
      onChange={handleChange}
      onSelect={handleSelect}

      // className="location-search-input"
    >
      {({ getInputProps, suggestions, getSuggestionItemProps }) => (
        <div className="location-search-input-wrapper">
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
                onChange={e => {
                  if (inputProps.onChange) {
                    const {
                      target: { value: realValue },
                    } = e;
                    handleChange(realValue);
                    inputProps.onChange(e);
                  }
                }}
                allowClear
                prefix={<SearchOutlined />}
                disabled={disabled}
                tabIndex={tabIndex}
                onKeyDown={onKeyDown}
                onBlur={onBlur}
                style={style}
                size={size}
              />
            );
          })()}
          <div
            className={classNames('dropdown-container', {
              hidden: !showSuggestionsDropdownContainer,
            })}
          >
            {suggestions.map(suggestion => {
              const localSuggestion = { ...suggestion };
              localSuggestion.description = ignoreText
                ? suggestion.description?.replace(ignoreText, '')
                : suggestion.description;

              return (
                <div
                  {...getSuggestionItemProps(localSuggestion)}
                  className={classNames('suggestion-container', {
                    highlighted: highlightedPlaceId === localSuggestion?.placeId,
                  })}
                  key={localSuggestion?.placeId}
                >
                  <div className="suggestion">{localSuggestion?.description}</div>
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
