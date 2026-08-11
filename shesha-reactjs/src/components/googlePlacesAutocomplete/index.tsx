import { FC, CSSProperties, useRef, useState } from 'react';
import * as React from 'react';
import PlacesAutocomplete, { geocodeByAddress, getLatLng, PropTypes } from 'react-places-autocomplete';
import { Input, App, InputRef } from 'antd';
import { InputProps } from 'antd/lib/input';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { LatLngPolygon, PointPolygon, pointsInPolygon } from '@/utils/googleMaps';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { useStyles } from './styles/styles';
import { IStyleValue } from '@/interfaces';
import { getElement, isNonEmptyArray } from '@/utils/array';
import { throwError } from '@/utils/errors';
import { isDefined } from '@/utils/nullables';

export interface IAddressAndCoords {
  address: string;
  lat?: number;
  lng?: number;
}

export const isIAddressAndCoords = (value: object): value is IAddressAndCoords => 'address' in value;

const Keys = {
  ArrowDown: "ArrowDown",
  ArrowUp: "ArrowUp",
  Enter: "Enter",
};

interface ISuggestion {
  placeId: string;
  description: string;
}

export interface IGooglePlacesAutocompleteProps {
  disableGoogleEvent?: ((value: string) => boolean) | undefined;
  debounce?: number | undefined;
  externalLoader?: boolean | undefined;
  isInvalid?: boolean | undefined;
  onGeocodeChange?: ((payload: IAddressAndCoords) => Promise<void>) | undefined;
  onChange?: ((payload: string) => void) | undefined;
  value?: string | undefined;
  selectedValue?: string | undefined;
  help?: string | undefined;
  placeholder?: string | undefined;
  prefix?: string | undefined;
  label?: string | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  ignoreText?: string | undefined;
  tabIndex?: number | undefined;
  biasedCoordinates?: LatLngPolygon | PointPolygon | undefined;
  style?: CSSProperties | undefined;
  size?: SizeType | undefined;
  font?: IStyleValue['font'] | undefined;
  searchOptions?: PropTypes['searchOptions'] | undefined;
  onFocus?: ((event: React.FocusEvent<HTMLInputElement, Element>) => void) | undefined;
  /** Applied to the antd `Input`, so a caller can style the field itself. */
  className?: string | undefined;
  /** Ref to the antd `Input`, so a caller can focus the field programmatically. */
  inputRef?: React.Ref<InputRef> | undefined;
  /** Extra antd `Input` event handlers (mouse/click), passed through as-is. */
  inputProps?: Omit<InputProps, 'value' | 'onChange' | 'prefix' | 'disabled' | 'placeholder' | 'style' | 'size' | 'className'> | undefined;
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
  readOnly,
  ignoreText,
  tabIndex,
  biasedCoordinates,
  style,
  font,
  size,
  searchOptions,
  onFocus,
  className,
  inputRef,
  inputProps: extraInputProps,
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
          onChange("");
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
        .then((results) => {
          return isNonEmptyArray(results) ? getLatLng(results[0]) : throwError("Failed to get coords");
        })
        .then(({ lat, lng }) => {
          if (biasedCoordinates) {
            if (pointsInPolygon([lat, lng], biasedCoordinates)) {
              void onGeocodeChange?.({
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
            void onGeocodeChange?.({
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
    if (!isNonEmptyArray(suggestionRef.current)) return;

    const suggestions = suggestionRef.current;

    const foundIndex = highlightedPlaceId
      ? suggestions.map(({ placeId }) => placeId).indexOf(highlightedPlaceId)
      : -1;

    const firstIndex = 0;

    const lastIndex = suggestions.length - 1;

    if (event.key === Keys.ArrowUp || event.key === Keys.ArrowDown) {
      let suggestion: ISuggestion | undefined = undefined;

      if (event.key === Keys.ArrowUp) {
        if (!highlightedPlaceId) {
          suggestion = getElement(suggestions, lastIndex); // Return the last one if the highlighted is empty
        } else {
          if (foundIndex === firstIndex) {
            suggestion = getElement(suggestions, lastIndex); // It's the first one, go to the last one
          } else {
            suggestion = getElement(suggestions, foundIndex - 1); // Go to the previous one
          }
        }
      } else if (event.key === Keys.ArrowDown) {
        if (!highlightedPlaceId) {
          suggestion = suggestions[firstIndex]; // Return the first one if the highlighted is empty
        } else {
          if (foundIndex === lastIndex) {
            suggestion = suggestions[firstIndex]; // It's the last element, so select the first one
          } else {
            suggestion = getElement(suggestions, foundIndex + 1); // Go to the next one
          }
        }
      }

      setHighlightedPlaceId(suggestion?.placeId ?? "");
    } else if (event.key === Keys.Enter) {
      if (highlightedPlaceId) {
        const foundDescription = suggestions.find(({ placeId }) => placeId === highlightedPlaceId)?.description;

        if (foundDescription) {
          handleSelect(ignoreText ? foundDescription.replace(ignoreText, '') : foundDescription);
          setShowSuggestionsDropdownContainer(false);
        }
      }
    } else {
      setShowSuggestionsDropdownContainer(true);
    }
  };

  const onBlur = (): void => setShowSuggestionsDropdownContainer(false);

  return (
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

            if (suggestions.length === 0) {
              setHighlightedPlaceId('');
              suggestionRef.current = [];
            } else {
              suggestionRef.current = suggestions.map(({ placeId, description }) => ({ placeId, description }));
            }

            return (
              <Input
                {...extraInputProps}
                ref={inputRef}
                className={className}
                value={displayValue}
                onChange={(e) => {
                  if (isDefined(inputProps.onChange)) {
                    const {
                      target: { value: realValue },
                    } = e;
                    handleChange(realValue);
                    if (!disableGoogleEvent?.(value ?? "")) {
                      inputProps.onChange(e);
                    }
                  }
                }}
                // Clearing is an edit, so the clear button is hidden in both non-editable states.
                allowClear={disabled !== true && readOnly !== true}
                placeholder={placeholder}
                prefix={inputPrefix}
                disabled={disabled ?? false}
                readOnly={readOnly ?? false}
                tabIndex={tabIndex}
                // Arrow-key navigation of the suggestions is pointless when nothing can be
                // selected, so key handling is skipped entirely while read-only.
                onKeyDown={readOnly === true ? undefined : onKeyDown}
                // Closing the suggestions dropdown is this component's own concern, so a
                // caller-supplied onBlur is composed with it rather than replacing it.
                onBlur={(e) => {
                  onBlur();
                  extraInputProps?.onBlur?.(e);
                }}
                // Composed rather than assigned, so a handler supplied through `inputProps`
                // (the standard event set) is not silently dropped by the dedicated prop.
                onFocus={(e) => {
                  onFocus?.(e);
                  extraInputProps?.onFocus?.(e);
                }}
                style={style}
                size={size}
              />
            );
          })()}
          {/* The dropdown stays hidden in both non-editable states — a suggestion list the user
              cannot act on would otherwise cover the surrounding form. */}
          <div
            className={classNames(styles.dropdownContainer, {
              hidden: !showSuggestionsDropdownContainer || disabled === true || readOnly === true,
            })}
          >
            {suggestions.map((suggestion) => {
              const localSuggestion = { ...suggestion };
              localSuggestion.description = ignoreText
                ? suggestion.description.replace(ignoreText, '')
                : suggestion.description;

              return (
                <div
                  {...getSuggestionItemProps(localSuggestion)}
                  className={classNames(styles.suggestionContainer, {
                    highlighted: highlightedPlaceId === localSuggestion.placeId,
                  })}
                  key={localSuggestion.placeId}
                >
                  <div className={styles.suggestion}>{localSuggestion.description}</div>
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
