import React, { FC, useEffect, useRef, useState } from 'react';
import { App, AutoComplete, Button, Modal, Space, Tooltip } from 'antd';
import { AimOutlined } from '@ant-design/icons';

export interface IGoogleMapPickerProps {
  visible: boolean;
  readOnly?: boolean;
  initialLat: number;
  initialLng: number;
  initialAddress?: string;
  defaultZoom?: number;
  mapHeight?: number;
  geocoder: unknown;
  onOk: (address: string, lat: number, lng: number) => void;
  onCancel: () => void;
}

// ─── Minimal Google Maps type contracts ──────────────────────────────────────

interface IGeocoderResult {
  formatted_address: string;
}

interface IGeocoder {
  geocode(
    request: { location: { lat: number; lng: number } } | { address: string },
    callback: (results: IGeocoderResult[], status: string) => void,
  ): void;
}

interface ILatLng {
  lat(): number;
  lng(): number;
}

interface IMapInstance {
  setCenter(pos: { lat: number; lng: number } | ILatLng): void;
  addListener(event: string, handler: (...args: unknown[]) => unknown): void;
}

interface IMarkerInstance {
  setPosition(pos: { lat: number; lng: number } | ILatLng): void;
  getPosition(): ILatLng | null | undefined;
  addListener(event: string, handler: (...args: unknown[]) => unknown): void;
}

interface IMapClickEvent {
  latLng: ILatLng;
}

interface IAutocompletePrediction {
  text?: { toString(): string };
  placeId?: string;
}

interface IAutocompleteSuggestionItem {
  placePrediction?: IAutocompletePrediction;
}

interface INewPlace {
  formattedAddress?: string;
  location?: ILatLng;
  fetchFields(options: { fields: string[] }): Promise<void>;
}

interface IGoogleMapsApi {
  Map: new (container: HTMLElement, options: { center: { lat: number; lng: number }; zoom: number }) => IMapInstance;
  Marker: new (options: { position: { lat: number; lng: number }; map: IMapInstance; draggable: boolean }) => IMarkerInstance;
  places?: {
    AutocompleteSuggestion?: {
      fetchAutocompleteSuggestions(request: { input: string }): Promise<{ suggestions: IAutocompleteSuggestionItem[] }>;
    };
    Place?: new (options: { id: string }) => INewPlace;
  };
}

// ─── Type guards ──────────────────────────────────────────────────────────────

function getGoogleMaps(): IGoogleMapsApi | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as Record<string, unknown>;
  if (typeof win.google !== 'object' || win.google === null) return null;
  const google = win.google as Record<string, unknown>;
  if (typeof google.maps !== 'object' || google.maps === null) return null;
  return google.maps as IGoogleMapsApi;
}

function isGeocoder(value: unknown): value is IGeocoder {
  return (
    typeof value === 'object' &&
    value !== null &&
    'geocode' in value &&
    typeof (value as Record<string, unknown>).geocode === 'function'
  );
}

function isMapClickEvent(e: unknown): e is IMapClickEvent {
  return (
    typeof e === 'object' &&
    e !== null &&
    'latLng' in e &&
    typeof (e as { latLng: unknown }).latLng === 'object' &&
    (e as { latLng: unknown }).latLng !== null
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function reverseGeocode(geocoder: IGeocoder, lat: number, lng: number): Promise<string> {
  return new Promise((resolve, reject) => {
    geocoder.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status === 'OK' && results?.[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject(new Error(`Reverse geocode failed: ${status}`));
        }
      },
    );
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ISuggestion {
  value: string;
  label: string;
  placeId: string;
}

const GoogleMapPicker: FC<IGoogleMapPickerProps> = ({
  visible,
  readOnly = false,
  initialLat,
  initialLng,
  initialAddress = '',
  defaultZoom = 15,
  mapHeight = 400,
  geocoder,
  onOk,
  onCancel,
}) => {
  const { message } = App.useApp();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<IMapInstance | null>(null);
  const markerRef = useRef<IMarkerInstance | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [currentAddress, setCurrentAddress] = useState(initialAddress);
  const [searchText, setSearchText] = useState(initialAddress);
  const [suggestions, setSuggestions] = useState<ISuggestion[]>([]);
  const [locating, setLocating] = useState(false);
  const [geolocationAvailable] = useState(
    typeof navigator !== 'undefined' && 'geolocation' in navigator,
  );

  // Re-sync when dialog re-opens with fresh coordinates
  useEffect(() => {
    if (visible) {
      setCurrentLat(initialLat);
      setCurrentLng(initialLng);
      setCurrentAddress(initialAddress);
      setSearchText(initialAddress);
    }
  }, [visible, initialLat, initialLng, initialAddress]);

  // Initialise the map 100 ms after the modal opens so the container has been
  // painted and has non-zero dimensions.
  useEffect(() => {
    if (!visible) return undefined;

    const timer = setTimeout(() => {
      const maps = getGoogleMaps();
      if (!mapContainerRef.current || !maps) return;

      const center = { lat: initialLat, lng: initialLng };
      const mapInstance = new maps.Map(mapContainerRef.current, { center, zoom: defaultZoom });
      const markerInstance = new maps.Marker({ position: center, map: mapInstance, draggable: !readOnly });
      mapRef.current = mapInstance;
      markerRef.current = markerInstance;

      if (!readOnly) {
        // ── Drag marker to a new position ────────────────────────────────────
        markerInstance.addListener('dragend', async () => {
          const pos = markerRef.current?.getPosition();
          if (!pos) return;
          const lat = pos.lat();
          const lng = pos.lng();
          setCurrentLat(lat);
          setCurrentLng(lng);
          if (isGeocoder(geocoder)) {
            try {
              const addr = await reverseGeocode(geocoder, lat, lng);
              setCurrentAddress(addr);
              setSearchText(addr);
            } catch {
              // leave address unchanged if reverse-geocode fails
            }
          }
        });

        // ── Click anywhere on the map to drop the pin ─────────────────────
        mapInstance.addListener('click', async (e: unknown) => {
          if (!isMapClickEvent(e)) return;
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          setCurrentLat(lat);
          setCurrentLng(lng);
          markerRef.current?.setPosition({ lat, lng });
          if (isGeocoder(geocoder)) {
            try {
              const addr = await reverseGeocode(geocoder, lat, lng);
              setCurrentAddress(addr);
              setSearchText(addr);
            } catch {
              // leave address unchanged if reverse-geocode fails
            }
          }
        });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // ── Fetch suggestions (debounced 300 ms) ─────────────────────────────────

  const fetchSuggestions = (text: string): void => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    const autocomplete = getGoogleMaps()?.places?.AutocompleteSuggestion;
    if (!text || !autocomplete) {
      setSuggestions([]);
      return;
    }
    searchTimerRef.current = setTimeout(async () => {
      try {
        const { suggestions: preds } = await autocomplete.fetchAutocompleteSuggestions({ input: text });
        setSuggestions(
          (preds ?? []).map((s) => {
            const pred = s.placePrediction;
            return { value: pred?.text?.toString() ?? '', label: pred?.text?.toString() ?? '', placeId: pred?.placeId ?? '' };
          }),
        );
      } catch {
        setSuggestions([]);
      }
    }, 300);
  };

  // ── Select a suggestion → fetch coords and pan map ────────────────────────

  const handleSelect = async (_address: string, option: ISuggestion): Promise<void> => {
    setSuggestions([]);
    const PlaceClass = getGoogleMaps()?.places?.Place;
    if (!option?.placeId || !PlaceClass) return;
    try {
      const place = new PlaceClass({ id: option.placeId });
      await place.fetchFields({ fields: ['formattedAddress', 'location'] });
      const lat: number = place.location?.lat() ?? currentLat;
      const lng: number = place.location?.lng() ?? currentLng;
      const addr: string = place.formattedAddress || _address;
      setCurrentLat(lat);
      setCurrentLng(lng);
      setCurrentAddress(addr);
      setSearchText(addr);
      mapRef.current?.setCenter({ lat, lng });
      markerRef.current?.setPosition({ lat, lng });
    } catch {
      /* keep current position */
    }
  };

  // ── Get current location ─────────────────────────────────────────────────
  const handleCurrentLocation = (): void => {
    if (!geolocationAvailable) return;

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocating(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCurrentLat(lat);
        setCurrentLng(lng);
        mapRef.current?.setCenter({ lat, lng });
        markerRef.current?.setPosition({ lat, lng });
        if (isGeocoder(geocoder)) {
          try {
            const addr = await reverseGeocode(geocoder, lat, lng);
            setCurrentAddress(addr);
            setSearchText(addr);
          } catch {
            // leave address unchanged
          }
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          message.warning('Location access denied. Enable location sharing in your browser.');
        } else {
          message.error('Unable to retrieve your location.');
        }
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  };

  const handleOk = (): void => {
    onOk(currentAddress, currentLat, currentLng);
    mapRef.current = null;
    markerRef.current = null;
  };

  const handleCancel = (): void => {
    onCancel();
    mapRef.current = null;
    markerRef.current = null;
  };

  return (
    <Modal
      open={visible}
      title={readOnly ? 'View Location' : 'Pick Location'}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={readOnly ? null : undefined}
      destroyOnHidden
      width={600}
    >
      {!readOnly && (
        <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
          <AutoComplete
            style={{ flex: 1, minWidth: 0 }}
            value={searchText}
            options={suggestions}
            onSearch={(text) => {
              setSearchText(text);
              fetchSuggestions(text);
            }}
            onSelect={handleSelect}
            placeholder="Search address on map…"
            allowClear
            onClear={() => {
              setSearchText('');
              setSuggestions([]);
            }}
            getPopupContainer={() => document.body}
          />
          {geolocationAvailable && (
            <Tooltip title="Use my current location">
              <Button
                icon={<AimOutlined />}
                loading={locating}
                onClick={handleCurrentLocation}
                aria-label="Use current location"
              />
            </Tooltip>
          )}
        </Space.Compact>
      )}

      <div ref={mapContainerRef} style={{ width: '100%', height: mapHeight }} />

      <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
        {currentAddress && (
          <span style={{ marginRight: 12 }}>{currentAddress}</span>
        )}
        <span>
          {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
        </span>
      </div>
    </Modal>
  );
};

export default GoogleMapPicker;
