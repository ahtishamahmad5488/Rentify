import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import MapPicker from '../../components/MapPicker';
import { axiosInstance } from '../../utils/axios';
import { showToast } from '../../utils/toastUtils';

const FACILITY_OPTIONS = ['WiFi', 'AC', 'Furniture', 'Parking', 'Laundry', 'Kitchen'];

export default function CreatePgScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [pricePerMonth, setPricePerMonth] = useState('');
  const [roomType, setRoomType] = useState<'Shared' | 'Private'>('Private');
  const [genderType, setGenderType] = useState<'Male' | 'Female' | 'Co-Ed'>('Co-Ed');
  const [totalRooms, setTotalRooms] = useState('1');
  const [availableRooms, setAvailableRooms] = useState('1');
  const [facilities, setFacilities] = useState<string[]>([]);
  const [images, setImages] = useState<Asset[]>([]);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleFacility = (f: string) =>
    setFacilities((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const pickImages = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 5,
      quality: 0.8,
    });
    if (res.assets) setImages(res.assets);
  };

  const submit = async () => {
    if (!name || !description || !city || !area || !fullAddress || !pricePerMonth) {
      Alert.alert('Missing info', 'Please fill all required fields.');
      return;
    }
    if (!coords) {
      Alert.alert('Pick location', 'Please tap on the map to set the property location.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('city', city);
      formData.append('area', area);
      formData.append('fullAddress', fullAddress);
      formData.append('pricePerMonth', pricePerMonth);
      formData.append('roomType', roomType);
      formData.append('genderType', genderType);
      formData.append('totalRooms', totalRooms);
      formData.append('availableRooms', availableRooms);
      formData.append('facilities', JSON.stringify(facilities));
      formData.append('latitude', String(coords.latitude));
      formData.append('longitude', String(coords.longitude));

      images.forEach((img, idx) => {
        formData.append('images', {
          uri: img.uri,
          name: img.fileName || `image-${idx}.jpg`,
          type: img.type || 'image/jpeg',
        } as any);
      });

      await axiosInstance.post('/owner/hostels', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showToast('success', 'Submitted', 'Property submitted for approval.');

      // reset
      setName(''); setDescription(''); setCity(''); setArea(''); setFullAddress('');
      setPricePerMonth(''); setTotalRooms('1'); setAvailableRooms('1');
      setFacilities([]); setImages([]); setCoords(null);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to create property';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>List a Property</Text>

      <Field label="Name" value={name} onChange={setName} />
      <Field label="Description" value={description} onChange={setDescription} multiline />
      <Field label="City" value={city} onChange={setCity} />
      <Field label="Area" value={area} onChange={setArea} />
      <Field label="Full Address" value={fullAddress} onChange={setFullAddress} />
      <Field label="Price / month" value={pricePerMonth} onChange={setPricePerMonth} keyboardType="numeric" />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Field label="Total Rooms" value={totalRooms} onChange={setTotalRooms} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Available" value={availableRooms} onChange={setAvailableRooms} keyboardType="numeric" />
        </View>
      </View>

      <Text style={styles.label}>Room Type</Text>
      <View style={styles.chipRow}>
        {(['Private', 'Shared'] as const).map((t) => (
          <Chip key={t} active={roomType === t} label={t} onPress={() => setRoomType(t)} />
        ))}
      </View>

      <Text style={styles.label}>Gender</Text>
      <View style={styles.chipRow}>
        {(['Male', 'Female', 'Co-Ed'] as const).map((t) => (
          <Chip key={t} active={genderType === t} label={t} onPress={() => setGenderType(t)} />
        ))}
      </View>

      <Text style={styles.label}>Facilities</Text>
      <View style={styles.chipRow}>
        {FACILITY_OPTIONS.map((f) => (
          <Chip key={f} active={facilities.includes(f)} label={f} onPress={() => toggleFacility(f)} />
        ))}
      </View>

      <Text style={styles.label}>Images</Text>
      <TouchableOpacity onPress={pickImages} style={styles.uploadBtn}>
        <Text style={styles.uploadText}>
          {images.length ? `${images.length} image(s) selected` : 'Pick images'}
        </Text>
      </TouchableOpacity>
      <ScrollView horizontal style={{ marginTop: 8 }}>
        {images.map((img, i) => (
          <Image key={i} source={{ uri: img.uri }} style={styles.thumb} />
        ))}
      </ScrollView>

      <Text style={styles.label}>Location (tap on map)</Text>
      <MapPicker onLocationSelected={setCoords} />
      {coords && (
        <Text style={styles.coordText}>
          Selected: {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
        onPress={submit}
        disabled={submitting}
      >
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Property</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Small inline components ────────────────────────────────────────────────

const Field = ({ label, value, onChange, multiline, keyboardType }: any) => (
  <View style={{ marginTop: 12 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
      value={value}
      onChangeText={onChange}
      multiline={multiline}
      keyboardType={keyboardType}
    />
  </View>
);

const Chip = ({ label, active, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, active && styles.chipActive]}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  label: { fontSize: 13, fontWeight: '600', marginTop: 12, marginBottom: 6, color: '#333' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#fafafa',
  },
  row: { flexDirection: 'row' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1, borderColor: '#ccc', marginRight: 6, marginBottom: 6,
  },
  chipActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  chipText: { color: '#333', fontSize: 12 },
  chipTextActive: { color: '#fff' },
  uploadBtn: {
    borderWidth: 1, borderColor: '#4F46E5', borderStyle: 'dashed',
    paddingVertical: 14, borderRadius: 8, alignItems: 'center',
  },
  uploadText: { color: '#4F46E5', fontWeight: '600' },
  thumb: { width: 70, height: 70, marginRight: 8, borderRadius: 6 },
  coordText: { marginTop: 6, color: '#555', fontSize: 12 },
  submitBtn: {
    marginTop: 24, backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 10,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
