import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, MapPressEvent, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapPin } from 'lucide-react-native';

interface Props {
  initialLatitude?: number;
  initialLongitude?: number;
  // Called whenever the user taps a new location on the map.
  onLocationSelected: (coords: { latitude: number; longitude: number }) => void;
  height?: number;
  readonly?: boolean;
}

/**
 * Reusable map component.
 * - In edit mode (default): user taps to drop/move the marker.
 * - In readonly mode: shows a single marker at the given coords.
 */
export default function MapPicker({
  initialLatitude = 33.6844, // Islamabad fallback
  initialLongitude = 73.0479,
  onLocationSelected,
  height = 280,
  readonly = false,
}: Props) {
  const [marker, setMarker] = useState<{ latitude: number; longitude: number }>({
    latitude: initialLatitude,
    longitude: initialLongitude,
  });
  const [mapReady, setMapReady] = useState(false);

  const handlePress = (e: MapPressEvent) => {
    if (readonly) return;
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    onLocationSelected({ latitude, longitude });
  };

  return (
    <View style={[styles.wrapper, { height }]}>
      {/* Fallback shown when map tiles fail to load (e.g. missing API key) */}
      {!mapReady && (
        <View style={styles.fallback}>
          <MapPin size={28} color="#9CA3AF" />
          <Text style={styles.fallbackTitle}>Loading map…</Text>
          <Text style={styles.fallbackCoords}>
            {`${initialLatitude.toFixed(5)}, ${initialLongitude.toFixed(5)}`}
          </Text>
          <Text style={styles.fallbackHint}>
            Map requires Google Maps API key in AndroidManifest.xml
          </Text>
        </View>
      )}

      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: initialLatitude,
          longitude: initialLongitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onMapReady={() => setMapReady(true)}
        onPress={handlePress}
      >
        <Marker
          coordinate={marker}
          draggable={!readonly}
          onDragEnd={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setMarker({ latitude, longitude });
            onLocationSelected({ latitude, longitude });
          }}
        />
      </MapView>

      {/* Coordinate bar — always visible, provides location context */}
      <View style={[styles.coordBar, !readonly && { bottom: 52 }]}>
        <MapPin size={10} color="rgba(255,255,255,0.9)" />
        <Text style={styles.coordText}>
          {`${marker.latitude.toFixed(5)}, ${marker.longitude.toFixed(5)}`}
        </Text>
      </View>

      {!readonly && (
        <View style={styles.hintBar}>
          <Text style={styles.hintText}>
            Tap on the map to set property location
          </Text>
          <TouchableOpacity
            onPress={() => onLocationSelected(marker)}
            style={styles.confirmBtn}
          >
            <Text style={styles.confirmText}>Use this point</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    gap: 6,
  },
  fallbackTitle: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  fallbackCoords: { fontSize: 12, color: '#9CA3AF', fontFamily: 'monospace' },
  fallbackHint: {
    fontSize: 11,
    color: '#D1D5DB',
    textAlign: 'center',
    marginTop: 4,
  },
  coordBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  coordText: { color: 'rgba(255,255,255,0.9)', fontSize: 11 },
  hintBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hintText: { color: '#fff', fontSize: 12, flex: 1 },
  confirmBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  confirmText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
