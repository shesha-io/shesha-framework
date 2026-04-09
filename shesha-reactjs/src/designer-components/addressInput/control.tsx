import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { App, AutoComplete, Button, Input, Modal, Space, Tooltip } from 'antd';
import { AimOutlined, CloseCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useFormActions } from '@/providers/form';
import { useFormData } from '@/providers/formContext';
import { getValueByPropertyName, setValueByPropertyName } from '@/utils/object';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IAddressInputControlProps {
  value?: unknown;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  googleMapsApiKey?: string;
  enableMapInterface?: boolean;
  latitudePropertyName?: string;
  longitudePropertyName?: string;
  defaultZoom?: number;
  mapHeight?: number;
}

// ─── Google Maps type contracts ───────────────────────────────────────────────

interface IGeocoderLocation {
  lat(): number;
  lng(): number;
}

interface IGeocoderResult {
  formatted_address: string;
  geometry?: {
    location?: IGeocoderLocation;
  };
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
  Geocoder: new () => IGeocoder;
  importLibrary?(library: string): Promise<unknown>;
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

const toDisplayString = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (
    typeof value === 'object' &&
    '_displayName' in value &&
    typeof (value as Record<string, unknown>)._displayName === 'string'
  ) {
    return (value as Record<string, unknown>)._displayName as string;
  }
  return '';
};

const LAT_LNG_RE = /^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/;

const DEFAULT_LAT = -26.2041;
const DEFAULT_LNG = 28.0473;

// Load the Google Maps JS SDK exactly once per page.
let googleMapsLoadPromise: Promise<void> | null = null;
let googleMapsLoadedApiKey: string | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (googleMapsLoadPromise && googleMapsLoadedApiKey && googleMapsLoadedApiKey !== apiKey) {
    return Promise.reject(
      new Error('Google Maps is already initialised with a different API key'),
    );
  }
  if (googleMapsLoadPromise) return googleMapsLoadPromise;

  if (getGoogleMaps() !== null) {
    googleMapsLoadedApiKey = apiKey;
    googleMapsLoadPromise = Promise.resolve();
    return googleMapsLoadPromise;
  }

  googleMapsLoadedApiKey = apiKey;
  googleMapsLoadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    // Do NOT include libraries=places — that loads the legacy Places library
    // and immediately triggers deprecation warnings. Instead we call
    // importLibrary("places") after load, which gives us the new Places API.
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Load the new Places library (not the legacy one).
      const maps = getGoogleMaps();
      if (maps?.importLibrary) {
        maps.importLibrary('places').then(() => resolve()).catch(reject);
      } else {
        resolve();
      }
    };
    script.onerror = () => {
      googleMapsLoadedApiKey = null;
      googleMapsLoadPromise = null;
      reject(new Error('Failed to load Google Maps script'));
    };
    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
}

function geocodeLatLng(geocoder: IGeocoder, lat: number, lng: number): Promise<string> {
  return new Promise((resolve, reject) => {
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results?.[0]) resolve(results[0].formatted_address);
      else reject(new Error(`Reverse geocode failed: ${status}`));
    });
  });
}

function geocodeAddressString(geocoder: IGeocoder, address: string): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      const loc = status === 'OK' ? results?.[0]?.geometry?.location : undefined;
      if (loc) {
        resolve({ lat: loc.lat(), lng: loc.lng() });
      } else {
        reject(new Error(`Geocode failed: ${status}`));
      }
    });
  });
}

// ─── Map Modal ────────────────────────────────────────────────────────────────

interface IMapModalProps {
  visible: boolean;
  readOnly: boolean;
  initialLat: number;
  initialLng: number;
  initialAddress: string;
  defaultZoom: number;
  mapHeight: number;
  geocoder: unknown;
  onOk: (address: string, lat: number, lng: number) => void;
  onCancel: () => void;
}

const MapModal: FC<IMapModalProps> = ({
  visible, readOnly, initialLat, initialLng, initialAddress,
  defaultZoom, mapHeight, geocoder, onOk, onCancel,
}) => {
  const { message } = App.useApp();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<IMapInstance | null>(null);
  const markerRef = useRef<IMarkerInstance | null>(null);

  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [currentAddress, setCurrentAddress] = useState(initialAddress);
  const [locating, setLocating] = useState(false);
  const [modalSearchText, setModalSearchText] = useState(initialAddress);
  const [modalSuggestions, setModalSuggestions] = useState<Array<{ value: string; label: string; placeId: string }>>([]);
  const modalSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const geolocationAvailable = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  useEffect(() => {
    if (visible) {
      setCurrentLat(initialLat);
      setCurrentLng(initialLng);
      setCurrentAddress(initialAddress);
      setModalSearchText(initialAddress);
    }
  }, [visible, initialLat, initialLng, initialAddress]);

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
        markerInstance.addListener('dragend', async () => {
          const pos = markerRef.current?.getPosition();
          if (!pos) return;
          const lat = pos.lat();
          const lng = pos.lng();
          setCurrentLat(lat);
          setCurrentLng(lng);
          if (isGeocoder(geocoder)) {
            try {
              setCurrentAddress(await geocodeLatLng(geocoder, lat, lng));
            } catch {
              /* keep address */
            }
          }
        });

        mapInstance.addListener('click', async (e: unknown) => {
          if (!isMapClickEvent(e)) return;
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          setCurrentLat(lat);
          setCurrentLng(lng);
          markerRef.current?.setPosition({ lat, lng });
          if (isGeocoder(geocoder)) {
            try {
              setCurrentAddress(await geocodeLatLng(geocoder, lat, lng));
            } catch {
              /* keep address */
            }
          }
        });
      }
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleCurrentLocation = (): void => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setLocating(false);
        const lat = coords.latitude;
        const lng = coords.longitude;
        setCurrentLat(lat);
        setCurrentLng(lng);
        mapRef.current?.setCenter({ lat, lng });
        markerRef.current?.setPosition({ lat, lng });
        if (isGeocoder(geocoder)) {
          try {
            setCurrentAddress(await geocodeLatLng(geocoder, lat, lng));
          } catch {
            /* keep address */
          }
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED)
          message.warning('Location access denied. Enable location sharing in your browser.');
        else
          message.error('Unable to retrieve your location.');
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  };

  // ── Suggestions for modal search (debounced 300 ms) ─────────────────────

  const fetchModalSuggestions = (text: string): void => {
    if (modalSearchTimerRef.current) clearTimeout(modalSearchTimerRef.current);
    const autocomplete = getGoogleMaps()?.places?.AutocompleteSuggestion;
    if (!text || !autocomplete) {
      setModalSuggestions([]);
      return;
    }
    modalSearchTimerRef.current = setTimeout(async () => {
      try {
        const { suggestions: preds } = await autocomplete.fetchAutocompleteSuggestions({ input: text });
        setModalSuggestions(
          (preds ?? []).map((s) => {
            const pred = s.placePrediction;
            return { value: pred?.text?.toString() ?? '', label: pred?.text?.toString() ?? '', placeId: pred?.placeId ?? '' };
          }),
        );
      } catch {
        setModalSuggestions([]);
      }
    }, 300);
  };

  // ── Select a suggestion → fetch coords and pan map ────────────────────────

  const handleModalSelect = async (_address: string, option: { placeId: string }): Promise<void> => {
    setModalSuggestions([]);
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
      setModalSearchText(addr);
      mapRef.current?.setCenter({ lat, lng });
      markerRef.current?.setPosition({ lat, lng });
    } catch {
      /* keep current position */
    }
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
            value={modalSearchText}
            options={modalSuggestions}
            onSearch={(text) => {
              setModalSearchText(text);
              fetchModalSuggestions(text);
            }}
            onSelect={handleModalSelect}
            placeholder="Search address on map…"
            allowClear
            onClear={() => {
              setModalSearchText('');
              setModalSuggestions([]);
            }}
            getPopupContainer={() => document.body}
          />
          {geolocationAvailable && (
            <Tooltip title="Use my current location">
              <Button icon={<AimOutlined />} loading={locating} onClick={handleCurrentLocation} />
            </Tooltip>
          )}
        </Space.Compact>
      )}
      <div ref={mapContainerRef} style={{ width: '100%', height: mapHeight }} />
      <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
        {currentAddress && <div style={{ marginBottom: 2 }}>{currentAddress}</div>}
        <span>{currentLat.toFixed(6)}, {currentLng.toFixed(6)}</span>
      </div>
    </Modal>
  );
};

// ─── Main Control ─────────────────────────────────────────────────────────────

interface ISuggestion {
  value: string;
  label: string;
  placeId: string;
}

const AddressInputControl: FC<IAddressInputControlProps> = ({
  value,
  onChange,
  placeholder = 'Search address…',
  readOnly = false,
  googleMapsApiKey,
  enableMapInterface = false,
  latitudePropertyName,
  longitudePropertyName,
  defaultZoom = 15,
  mapHeight = 400,
}) => {
  const { message } = App.useApp();
  const [googlePlaceReady, setGooglePlaceReady] = useState(
    () => getGoogleMaps() !== null,
  );

  const [searchText, setSearchText] = useState(toDisplayString(value));
  const lastExternalValueRef = useRef(toDisplayString(value));

  const [suggestions, setSuggestions] = useState<ISuggestion[]>([]);

  const [mapVisible, setMapVisible] = useState(false);
  const [mapLat, setMapLat] = useState(DEFAULT_LAT);
  const [mapLng, setMapLng] = useState(DEFAULT_LNG);
  const [mapAddress, setMapAddress] = useState('');

  const geocoderRef = useRef<IGeocoder | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { setFormData } = useFormActions() ?? {};
  const { data: formData } = useFormData() ?? {};

  // ── Load / detect Google Maps ──────────────────────────────────────────────

  useEffect(() => {
    const maps = getGoogleMaps();
    if (maps) {
      if (!geocoderRef.current)
        geocoderRef.current = new maps.Geocoder();
      // Ensure the new places library is loaded (importLibrary is a no-op if
      // already loaded, so this is safe to call multiple times).
      maps.importLibrary?.('places').catch(() => { /* ignore */ });
      if (!googlePlaceReady) setGooglePlaceReady(true);
      return;
    }

    if (!googleMapsApiKey) return;

    loadGoogleMapsScript(googleMapsApiKey)
      .then(() => {
        const loadedMaps = getGoogleMaps();
        if (loadedMaps) geocoderRef.current = new loadedMaps.Geocoder();
        setGooglePlaceReady(true);
      })
      .catch(() => {
        message.error('Failed to load Google Maps. Check your API key.');
      });
  }, [googleMapsApiKey]);

  // ── Sync external value (form reset / programmatic update) ────────────────

  useEffect(() => {
    const display = toDisplayString(value);
    if (display !== lastExternalValueRef.current) {
      lastExternalValueRef.current = display;
      setSearchText(display);
    }
  }, [value]);

  // ── Write lat/lng into parent form ────────────────────────────────────────

  const writeLatLng = useCallback(
    (lat: number | null, lng: number | null) => {
      if (!setFormData) return;
      let values: Record<string, unknown> = {};
      if (latitudePropertyName)
        values = setValueByPropertyName(values, latitudePropertyName, lat, true);
      if (longitudePropertyName)
        values = setValueByPropertyName(values, longitudePropertyName, lng, true);
      if (Object.keys(values).length > 0)
        setFormData({ values, mergeValues: true });
    },
    [setFormData, latitudePropertyName, longitudePropertyName],
  );

  // ── Fetch suggestions via AutocompleteService (debounced 300 ms) ──────────

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
            return {
              value: pred?.text?.toString() ?? '',
              label: pred?.text?.toString() ?? '',
              placeId: pred?.placeId ?? '',
            };
          }),
        );
      } catch {
        setSuggestions([]);
      }
    }, 300);
  };

  // ── Handle typing in the AutoComplete input ───────────────────────────────

  const handleSearch = (text: string): void => {
    setSearchText(text);
    fetchSuggestions(text);
  };

  // ── Handle selecting a suggestion ────────────────────────────────────────

  const handleSelect = async (_address: string, option: ISuggestion): Promise<void> => {
    setSuggestions([]);
    const PlaceClass = getGoogleMaps()?.places?.Place;
    if (!option?.placeId || !PlaceClass) {
      lastExternalValueRef.current = _address;
      setSearchText(_address);
      onChange?.(_address);
      writeLatLng(null, null);
      return;
    }

    try {
      // New Places API — no deprecated PlacesService needed
      const place = new PlaceClass({ id: option.placeId });
      await place.fetchFields({ fields: ['formattedAddress', 'location'] });
      const finalAddress: string = place.formattedAddress || _address;
      const lat: number = place.location?.lat() ?? DEFAULT_LAT;
      const lng: number = place.location?.lng() ?? DEFAULT_LNG;
      lastExternalValueRef.current = finalAddress;
      setSearchText(finalAddress);
      onChange?.(finalAddress);
      writeLatLng(lat, lng);
    } catch {
      lastExternalValueRef.current = _address;
      setSearchText(_address);
      onChange?.(_address);
      writeLatLng(null, null);
    }
  };

  // ── Direct lat/lng coordinate input on Enter ──────────────────────────────

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>): Promise<void> => {
    if (e.key !== 'Enter') return;
    const currentText = (e.target as HTMLInputElement).value;
    const match = currentText.match(LAT_LNG_RE);
    if (!match || !geocoderRef.current) return;

    e.preventDefault();
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);

    try {
      const addr = await geocodeLatLng(geocoderRef.current, lat, lng);
      lastExternalValueRef.current = addr;
      setSearchText(addr);
      onChange?.(addr);
      writeLatLng(lat, lng);
    } catch {
      onChange?.(currentText);
      writeLatLng(lat, lng);
    }
  };

  // ── Open map modal ────────────────────────────────────────────────────────

  const openMap = async (): Promise<void> => {
    let lat = DEFAULT_LAT;
    let lng = DEFAULT_LNG;

    if (formData) {
      const storedLat = latitudePropertyName ? getValueByPropertyName(formData, latitudePropertyName) : null;
      const storedLng = longitudePropertyName ? getValueByPropertyName(formData, longitudePropertyName) : null;
      if (typeof storedLat === 'number' && typeof storedLng === 'number') {
        lat = storedLat;
        lng = storedLng;
      }
    }

    if (lat === DEFAULT_LAT && lng === DEFAULT_LNG && searchText && geocoderRef.current) {
      try {
        const coords = await geocodeAddressString(geocoderRef.current, searchText);
        lat = coords.lat;
        lng = coords.lng;
      } catch {
        /* keep defaults */
      }
    }

    setMapLat(lat);
    setMapLng(lng);
    setMapAddress(searchText);
    setMapVisible(true);
  };

  const handleMapOk = (address: string, lat: number, lng: number): void => {
    lastExternalValueRef.current = address;
    setSearchText(address);
    onChange?.(address);
    writeLatLng(lat, lng);
    setMapVisible(false);
  };

  const handleMapCancel = (): void => setMapVisible(false);

  const showMapButton = enableMapInterface && !!googleMapsApiKey && googlePlaceReady;
  const displayText = toDisplayString(value);

  // ── Read-only ──────────────────────────────────────────────────────────────

  if (readOnly) {
    return (
      <>
        {enableMapInterface && displayText
          ? <a onClick={openMap} style={{ cursor: 'pointer' }}>{displayText}</a>
          : <span>{displayText}</span>}
        {mapVisible && (
          <MapModal
            visible={mapVisible}
            readOnly
            initialLat={mapLat}
            initialLng={mapLng}
            initialAddress={mapAddress}
            defaultZoom={defaultZoom}
            mapHeight={mapHeight}
            geocoder={geocoderRef.current}
            onOk={handleMapOk}
            onCancel={handleMapCancel}
          />
        )}
      </>
    );
  }

  // ── Edit mode ──────────────────────────────────────────────────────────────

  // Always render a non-null suffix so AntD keeps the affix-wrapper
  // DOM structure stable (swapping null ↔ element remounts <input>).
  const suffixIcon = searchText ? (
    <CloseCircleOutlined
      style={{ color: '#bbb', cursor: 'pointer' }}
      onClick={() => {
        lastExternalValueRef.current = '';
        setSearchText('');
        onChange?.('');
        setSuggestions([]);
        writeLatLng(null, null);
      }}
    />
  ) : (
    <span style={{ display: 'inline-block', width: 14 }} />
  );

  return (
    <>
      <Space.Compact style={{ width: '100%' }}>
        <AutoComplete
          style={{ flex: 1, minWidth: 0 }}
          value={searchText}
          options={suggestions}
          onSearch={handleSearch}
          onSelect={handleSelect}
          onBlur={() => {
            // Persist free-text entry when the user tabs/clicks away without
            // selecting a suggestion.
            if (searchText !== toDisplayString(value)) {
              lastExternalValueRef.current = searchText;
              onChange?.(searchText);
              writeLatLng(null, null);
            }
            setSuggestions([]);
          }}
        >
          <Input
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            suffix={suffixIcon}
          />
        </AutoComplete>
        {showMapButton && (
          <Button icon={<EnvironmentOutlined />} onClick={openMap} title="Pick on map" />
        )}
      </Space.Compact>

      {mapVisible && (
        <MapModal
          visible={mapVisible}
          readOnly={false}
          initialLat={mapLat}
          initialLng={mapLng}
          initialAddress={mapAddress}
          defaultZoom={defaultZoom}
          mapHeight={mapHeight}
          geocoder={geocoderRef.current}
          onOk={handleMapOk}
          onCancel={handleMapCancel}
        />
      )}
    </>
  );
};

export default AddressInputControl;
