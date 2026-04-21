import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, MapPressEvent, PROVIDER_GOOGLE } from 'react-native-maps';

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

  const handlePress = (e: MapPressEvent) => {
    if (readonly) return;
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    onLocationSelected({ latitude, longitude });
  };

  return (
    <View style={[styles.wrapper, { height }]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: initialLatitude,
          longitude: initialLongitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
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
    backgroundColor: '#eee',
  },
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
