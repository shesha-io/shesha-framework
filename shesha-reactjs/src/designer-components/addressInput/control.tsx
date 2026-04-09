import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { AutoComplete, Button, Input, Space, Tooltip, message } from 'antd';
import { AimOutlined, CloseCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useFormActions } from '@/providers/form';
import { useFormData } from '@/providers/formContext';
import { getValueByPropertyName, setValueByPropertyName } from '@/utils/object';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IAddressInputControlProps {
  value?: any;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toDisplayString = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value._displayName === 'string') return value._displayName;
  return '';
};

const LAT_LNG_RE = /^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/;

const DEFAULT_LAT = -26.2041;
const DEFAULT_LNG = 28.0473;

// Load the Google Maps JS SDK exactly once per page.
let _loadPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (_loadPromise) return _loadPromise;

  if (typeof window !== 'undefined' && (window as any).google?.maps) {
    _loadPromise = Promise.resolve();
    return _loadPromise;
  }

  _loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    // Do NOT include libraries=places — that loads the legacy Places library
    // and immediately triggers deprecation warnings. Instead we call
    // importLibrary("places") after load, which gives us the new Places API.
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Load the new Places library (not the legacy one).
      (window as any).google.maps
        .importLibrary('places')
        .then(() => resolve())
        .catch(reject);
    };
    script.onerror = () => {
      _loadPromise = null;
      reject(new Error('Failed to load Google Maps script'));
    };
    document.head.appendChild(script);
  });

  return _loadPromise;
}

function geocodeLatLng(geocoder: any, lat: number, lng: number): Promise<string> {
  return new Promise((resolve, reject) => {
    geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
      if (status === 'OK' && results?.[0]) resolve(results[0].formatted_address as string);
      else reject(new Error(`Reverse geocode failed: ${status}`));
    });
  });
}

function geocodeAddressString(geocoder: any, address: string): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results: any[], status: string) => {
      if (status === 'OK' && results?.[0]?.geometry?.location) {
        const loc = results[0].geometry.location;
        resolve({ lat: loc.lat(), lng: loc.lng() });
      } else {
        reject(new Error(`Geocode failed: ${status}`));
      }
    });
  });
}

// ─── Map Modal ────────────────────────────────────────────────────────────────

import { Modal } from 'antd';

interface IMapModalProps {
  visible: boolean;
  readOnly: boolean;
  initialLat: number;
  initialLng: number;
  initialAddress: string;
  defaultZoom: number;
  mapHeight: number;
  geocoder: any;
  onOk: (address: string, lat: number, lng: number) => void;
  onCancel: () => void;
}

const MapModal: FC<IMapModalProps> = ({
  visible, readOnly, initialLat, initialLng, initialAddress,
  defaultZoom, mapHeight, geocoder, onOk, onCancel,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

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
      if (!mapContainerRef.current || !(window as any).google?.maps) return;

      const google = (window as any).google;
      const center = { lat: initialLat, lng: initialLng };

      mapRef.current = new google.maps.Map(mapContainerRef.current, { center, zoom: defaultZoom });
      markerRef.current = new google.maps.Marker({ position: center, map: mapRef.current, draggable: !readOnly });

      if (!readOnly) {
        markerRef.current.addListener('dragend', async () => {
          const pos = markerRef.current?.getPosition();
          if (!pos) return;
          const lat: number = pos.lat();
          const lng: number = pos.lng();
          setCurrentLat(lat);
          setCurrentLng(lng);
          if (geocoder) {
            try { setCurrentAddress(await geocodeLatLng(geocoder, lat, lng)); } catch { /* keep address */ }
          }
        });

        mapRef.current.addListener('click', async (e: any) => {
          const lat: number = e.latLng.lat();
          const lng: number = e.latLng.lng();
          setCurrentLat(lat);
          setCurrentLng(lng);
          markerRef.current?.setPosition({ lat, lng });
          if (geocoder) {
            try { setCurrentAddress(await geocodeLatLng(geocoder, lat, lng)); } catch { /* keep address */ }
          }
        });

      }
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleCurrentLocation = () => {
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
        if (geocoder) {
          try { setCurrentAddress(await geocodeLatLng(geocoder, lat, lng)); } catch { /* keep address */ }
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED)
          message.warning('Location access denied. Enable location sharing in your browser.');
        else
          message.error('Unable to retrieve your location.');
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  // ── Suggestions for modal search (debounced 300 ms) ─────────────────────

  const fetchModalSuggestions = (text: string) => {
    if (modalSearchTimerRef.current) clearTimeout(modalSearchTimerRef.current);
    if (!text || !(window as any).google?.maps?.places?.AutocompleteSuggestion) {
      setModalSuggestions([]);
      return;
    }
    modalSearchTimerRef.current = setTimeout(async () => {
      try {
        const { AutocompleteSuggestion } = (window as any).google.maps.places;
        const { suggestions: preds } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({ input: text });
        setModalSuggestions(
          (preds ?? []).map((s: any) => {
            const pred = s.placePrediction;
            return { value: pred?.text?.toString() ?? '', label: pred?.text?.toString() ?? '', placeId: pred?.placeId ?? '' };
          })
        );
      } catch {
        setModalSuggestions([]);
      }
    }, 300);
  };

  // ── Select a suggestion → fetch coords and pan map ────────────────────────

  const handleModalSelect = async (_address: string, option: { placeId: string }) => {
    setModalSuggestions([]);
    const google = (window as any).google;
    if (!option?.placeId || !google?.maps?.places?.Place) return;
    try {
      const place = new google.maps.places.Place({ id: option.placeId });
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
    } catch { /* keep current position */ }
  };

  const handleOk = () => {
    onOk(currentAddress, currentLat, currentLng);
    mapRef.current = null;
    markerRef.current = null;
  };

  const handleCancel = () => {
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
      destroyOnClose
      width={600}
    >
      {!readOnly && (
        <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
          <AutoComplete
            style={{ flex: 1, minWidth: 0 }}
            value={modalSearchText}
            options={modalSuggestions}
            onSearch={(text) => { setModalSearchText(text); fetchModalSuggestions(text); }}
            onSelect={handleModalSelect}
            placeholder="Search address on map…"
            allowClear
            onClear={() => { setModalSearchText(''); setModalSuggestions([]); }}
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
  const [googlePlaceReady, setGooglePlaceReady] = useState(
    () => typeof window !== 'undefined' && !!(window as any).google?.maps
  );

  const [searchText, setSearchText] = useState(toDisplayString(value));
  const lastExternalValueRef = useRef(toDisplayString(value));

  const [suggestions, setSuggestions] = useState<ISuggestion[]>([]);

  const [mapVisible, setMapVisible] = useState(false);
  const [mapLat, setMapLat] = useState(DEFAULT_LAT);
  const [mapLng, setMapLng] = useState(DEFAULT_LNG);
  const [mapAddress, setMapAddress] = useState('');

  const geocoderRef = useRef<any>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { setFormData } = useFormActions(false) ?? {};
  const { data: formData } = useFormData() ?? {};

  // ── Load / detect Google Maps ──────────────────────────────────────────────

  useEffect(() => {
    if ((window as any).google?.maps) {
      if (!geocoderRef.current)
        geocoderRef.current = new (window as any).google.maps.Geocoder();
      // Ensure the new places library is loaded (importLibrary is a no-op if
      // already loaded, so this is safe to call multiple times).
      (window as any).google.maps.importLibrary?.('places').catch(() => {/* ignore */});
      if (!googlePlaceReady) setGooglePlaceReady(true);
      return;
    }

    if (!googleMapsApiKey) return;

    loadGoogleMapsScript(googleMapsApiKey)
      .then(() => {
        geocoderRef.current = new (window as any).google.maps.Geocoder();
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
    (lat: number, lng: number) => {
      if (!setFormData) return;
      let values: Record<string, any> = {};
      if (latitudePropertyName)
        values = setValueByPropertyName(values, latitudePropertyName, lat, true);
      if (longitudePropertyName)
        values = setValueByPropertyName(values, longitudePropertyName, lng, true);
      if (Object.keys(values).length > 0)
        setFormData({ values, mergeValues: true });
    },
    [setFormData, latitudePropertyName, longitudePropertyName]
  );

  // ── Fetch suggestions via AutocompleteService (debounced 300 ms) ──────────

  const fetchSuggestions = (text: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!text || !(window as any).google?.maps?.places?.AutocompleteSuggestion) {
      setSuggestions([]);
      return;
    }
    searchTimerRef.current = setTimeout(async () => {
      try {
        const { AutocompleteSuggestion } = (window as any).google.maps.places;
        const { suggestions: preds } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({ input: text });
        setSuggestions(
          (preds ?? []).map((s: any) => {
            const pred = s.placePrediction;
            return {
              value: pred?.text?.toString() ?? '',
              label: pred?.text?.toString() ?? '',
              placeId: pred?.placeId ?? '',
            };
          })
        );
      } catch {
        setSuggestions([]);
      }
    }, 300);
  };

  // ── Handle typing in the AutoComplete input ───────────────────────────────

  const handleSearch = (text: string) => {
    setSearchText(text);
    fetchSuggestions(text);
  };

  // ── Handle selecting a suggestion ────────────────────────────────────────

  const handleSelect = async (_address: string, option: ISuggestion) => {
    setSuggestions([]);
    const google = (window as any).google;
    if (!option?.placeId || !google?.maps?.places?.Place) {
      lastExternalValueRef.current = _address;
      setSearchText(_address);
      onChange?.(_address);
      return;
    }

    try {
      // New Places API — no deprecated PlacesService needed
      const place = new google.maps.places.Place({ id: option.placeId });
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
    }
  };

  // ── Direct lat/lng coordinate input on Enter ──────────────────────────────

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const openMap = async () => {
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
      } catch { /* keep defaults */ }
    }

    setMapLat(lat);
    setMapLng(lng);
    setMapAddress(searchText);
    setMapVisible(true);
  };

  const handleMapOk = (address: string, lat: number, lng: number) => {
    lastExternalValueRef.current = address;
    setSearchText(address);
    onChange?.(address);
    writeLatLng(lat, lng);
    setMapVisible(false);
  };

  const handleMapCancel = () => setMapVisible(false);

  const showMapButton = enableMapInterface && !!googleMapsApiKey && googlePlaceReady;
  const displayText = toDisplayString(value);

  // ── Read-only ──────────────────────────────────────────────────────────────

  if (readOnly) {
    return (
      <>
        {enableMapInterface && displayText
          ? <a onClick={openMap} style={{ cursor: 'pointer' }}>{displayText}</a>
          : <span>{displayText}</span>
        }
        {mapVisible && (
          <MapModal
            visible={mapVisible} readOnly
            initialLat={mapLat} initialLng={mapLng} initialAddress={mapAddress}
            defaultZoom={defaultZoom} mapHeight={mapHeight} geocoder={geocoderRef.current}
            onOk={handleMapOk} onCancel={handleMapCancel}
          />
        )}
      </>
    );
  }

  // ── Edit mode ──────────────────────────────────────────────────────────────

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
            }
            setSuggestions([]);
          }}
        >
          <Input
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            suffix={
              // Always render a non-null suffix so AntD keeps the affix-wrapper
              // DOM structure stable (swapping null ↔ element remounts <input>).
              searchText ? (
                <CloseCircleOutlined
                  style={{ color: '#bbb', cursor: 'pointer' }}
                  onClick={() => {
                    lastExternalValueRef.current = '';
                    setSearchText('');
                    onChange?.('');
                    setSuggestions([]);
                  }}
                />
              ) : (
                <span style={{ display: 'inline-block', width: 14 }} />
              )
            }
          />
        </AutoComplete>
        {showMapButton && (
          <Button icon={<EnvironmentOutlined />} onClick={openMap} title="Pick on map" />
        )}
      </Space.Compact>

      {mapVisible && (
        <MapModal
          visible={mapVisible} readOnly={false}
          initialLat={mapLat} initialLng={mapLng} initialAddress={mapAddress}
          defaultZoom={defaultZoom} mapHeight={mapHeight} geocoder={geocoderRef.current}
          onOk={handleMapOk} onCancel={handleMapCancel}
        />
      )}
    </>
  );
};

export default AddressInputControl;
