import React, { FC, useEffect, useRef, useState } from 'react';
import { Button, Input, Modal, Space, Tooltip, message } from 'antd';
import { AimOutlined } from '@ant-design/icons';

export interface IGoogleMapPickerProps {
  visible: boolean;
  readOnly?: boolean;
  initialLat: number;
  initialLng: number;
  initialAddress?: string;
  defaultZoom?: number;
  mapHeight?: number;
  geocoder: any;
  onOk: (address: string, lat: number, lng: number) => void;
  onCancel: () => void;
}

// Promisify Geocoder callback
function reverseGeocode(geocoder: any, lat: number, lng: number): Promise<string> {
  return new Promise((resolve, reject) => {
    geocoder.geocode(
      { location: { lat, lng } },
      (results: any[], status: string) => {
        if (status === 'OK' && results?.[0]) {
          resolve(results[0].formatted_address as string);
        } else {
          reject(new Error(`Reverse geocode failed: ${status}`));
        }
      }
    );
  });
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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [currentAddress, setCurrentAddress] = useState(initialAddress);
  const [locating, setLocating] = useState(false);
  const [geolocationAvailable] = useState(
    typeof navigator !== 'undefined' && 'geolocation' in navigator
  );

  // Re-sync when dialog re-opens with fresh coordinates
  useEffect(() => {
    if (visible) {
      setCurrentLat(initialLat);
      setCurrentLng(initialLng);
      setCurrentAddress(initialAddress);
    }
  }, [visible, initialLat, initialLng, initialAddress]);

  // Helper: move both the map view and the marker to a new position, then
  // reverse-geocode the address.
  const moveToPosition = async (lat: number, lng: number) => {
    setCurrentLat(lat);
    setCurrentLng(lng);

    const pos = { lat, lng };
    mapRef.current?.setCenter(pos);
    markerRef.current?.setPosition(pos);

    if (geocoder) {
      try {
        const addr = await reverseGeocode(geocoder, lat, lng);
        setCurrentAddress(addr);
      } catch {
        // leave address unchanged if reverse-geocode fails
      }
    }
  };

  // Initialise the map 100 ms after the modal opens so the container has been
  // painted and has non-zero dimensions.
  useEffect(() => {
    if (!visible) return undefined;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current || !(window as any).google?.maps) return;

      const google = (window as any).google;
      const center = { lat: initialLat, lng: initialLng };

      mapRef.current = new google.maps.Map(mapContainerRef.current, {
        center,
        zoom: defaultZoom,
      });

      markerRef.current = new google.maps.Marker({
        position: center,
        map: mapRef.current,
        draggable: !readOnly,
      });

      if (!readOnly) {
        // ── Drag marker to a new position ────────────────────────────────────
        markerRef.current.addListener('dragend', async () => {
          const pos = markerRef.current?.getPosition();
          if (!pos) return;
          await moveToPosition(pos.lat(), pos.lng());
        });

        // ── Click anywhere on the map to drop the pin ─────────────────────
        mapRef.current.addListener('click', async (e: any) => {
          const lat: number = e.latLng.lat();
          const lng: number = e.latLng.lng();
          await moveToPosition(lat, lng);
        });

        // ── SearchBox inside the modal ────────────────────────────────────
        const searchInput = document.getElementById(
          'gmp-search-input'
        ) as HTMLInputElement;
        if (searchInput) {
          const searchBox = new google.maps.places.SearchBox(searchInput);
          searchBox.addListener('places_changed', () => {
            const places = searchBox.getPlaces();
            if (!places?.length) return;
            const place = places[0];
            const location = place.geometry?.location;
            if (!location) return;
            const lat: number = location.lat();
            const lng: number = location.lng();
            setCurrentLat(lat);
            setCurrentLng(lng);
            setCurrentAddress(place.formatted_address || place.name || '');
            mapRef.current?.setCenter(location);
            markerRef.current?.setPosition(location);
          });
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // ── Get current location ─────────────────────────────────────────────────
  const handleCurrentLocation = () => {
    if (!geolocationAvailable) return;

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocating(false);
        const { latitude: lat, longitude: lng } = position.coords;
        await moveToPosition(lat, lng);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          message.warning('Location access denied. Enable location sharing in your browser.');
        } else {
          message.error('Unable to retrieve your location.');
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
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
          <Input
            id="gmp-search-input"
            placeholder="Search address on map…"
            allowClear
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
