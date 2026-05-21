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

const FACILITY_OPTIONS = [
  'WiFi',
  'AC',
  'Furniture',
  'Parking',
  'Laundry',
  'Kitchen',
  'Security',
  'Electricity Backup',
];
const PROPERTY_TYPES = [
  'Private',
  'Shared',
  'Apartment',
  'House',
  'Room',
] as const;
const GENDER_TYPES = ['Male', 'Female', 'Co-Ed', 'Any'] as const;

const CNIC_REGEX = /^\d{13}$|^\d{5}-\d{7}-\d{1}$/;
const PHONE_REGEX = /^(\+92|0)[0-9]{10}$/;

export default function CreatePgScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [propertyType, setPropertyType] =
    useState<(typeof PROPERTY_TYPES)[number]>('Private');
  const [genderType, setGenderType] =
    useState<(typeof GENDER_TYPES)[number]>('Co-Ed');
  const [totalRooms, setTotalRooms] = useState('1');
  const [availableRooms, setAvailableRooms] = useState('1');
  const [facilities, setFacilities] = useState<string[]>([]);
  const [images, setImages] = useState<Asset[]>([]);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerCnic, setOwnerCnic] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleFacility = (f: string) =>
    setFacilities(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f],
    );

  const pickImages = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 5,
      quality: 0.8,
    });
    if (res.assets) setImages(res.assets);
  };

  const submit = async () => {
    if (!title || !description || !city || !address || !price) {
      Alert.alert(
        'Missing info',
        'Please fill all required fields (Title, Description, City, Address, Price).',
      );
      return;
    }
    if (!ownerPhone.trim()) {
      Alert.alert('Missing info', 'Phone number is required.');
      return;
    }
    if (!PHONE_REGEX.test(ownerPhone.trim())) {
      Alert.alert(
        'Invalid phone',
        'Enter a valid Pakistan phone number (e.g. 03001234567 or +923001234567).',
      );
      return;
    }
    if (!ownerCnic.trim()) {
      Alert.alert('Missing info', 'CNIC is required.');
      return;
    }
    if (!CNIC_REGEX.test(ownerCnic.trim())) {
      Alert.alert(
        'Invalid CNIC',
        'Enter 13 digits (e.g. 3520112345671) or in format XXXXX-XXXXXXX-X.',
      );
      return;
    }
    if (!coords) {
      Alert.alert(
        'Pick location',
        'Please tap on the map to set the property location.',
      );
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('city', city);
      formData.append('area', area);
      formData.append('address', address);
      formData.append('price', price);
      formData.append('propertyType', propertyType);
      formData.append('genderType', genderType);
      formData.append('totalRooms', totalRooms);
      formData.append('availableRooms', availableRooms);
      formData.append('facilities', JSON.stringify(facilities));
      formData.append('latitude', String(coords.latitude));
      formData.append('longitude', String(coords.longitude));
      formData.append('ownerPhone', ownerPhone.trim());
      formData.append('ownerCnic', ownerCnic.trim());

      images.forEach((img, idx) => {
        formData.append('images', {
          uri: img.uri,
          name: img.fileName || `image-${idx}.jpg`,
          type: img.type || 'image/jpeg',
        } as any);
      });

      await axiosInstance.post('/landlord/properties', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showToast(
        'success',
        'Submitted',
        'Property submitted for admin approval.',
      );

      setTitle('');
      setDescription('');
      setCity('');
      setArea('');
      setAddress('');
      setPrice('');
      setTotalRooms('1');
      setAvailableRooms('1');
      setOwnerPhone('');
      setOwnerCnic('');
      setFacilities([]);
      setImages([]);
      setCoords(null);
    } catch (e: any) {
      console.log('CREATE PROPERTY ERROR STATUS:', e?.response?.status);
      console.log(
        'CREATE PROPERTY ERROR DATA:',
        JSON.stringify(e?.response?.data, null, 2),
      );
      console.log('CREATE PROPERTY ERROR MESSAGE:', e?.message);

      const raw = e?.response?.data;
      const msg = Array.isArray(raw?.data)
        ? raw.data.map((e: any) => e.message).join('\n')
        : raw?.message || 'Failed to submit property.';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.title}>List a Property</Text>

      {/* Property Info */}
      <Field label="Title *" value={title} onChange={setTitle} />
      <Field
        label="Description *"
        value={description}
        onChange={setDescription}
        multiline
      />
      <Field label="City *" value={city} onChange={setCity} />
      <Field label="Area" value={area} onChange={setArea} />
      <Field label="Full Address *" value={address} onChange={setAddress} />
      <Field
        label="Price / month (PKR) *"
        value={price}
        onChange={setPrice}
        keyboardType="numeric"
      />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Field
            label="Total Rooms"
            value={totalRooms}
            onChange={setTotalRooms}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label="Available"
            value={availableRooms}
            onChange={setAvailableRooms}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text style={styles.label}>Property Type</Text>
      <View style={styles.chipRow}>
        {PROPERTY_TYPES.map(t => (
          <Chip
            key={t}
            active={propertyType === t}
            label={t}
            onPress={() => setPropertyType(t)}
          />
        ))}
      </View>

      <Text style={styles.label}>Gender</Text>
      <View style={styles.chipRow}>
        {GENDER_TYPES.map(t => (
          <Chip
            key={t}
            active={genderType === t}
            label={t}
            onPress={() => setGenderType(t)}
          />
        ))}
      </View>

      <Text style={styles.label}>Facilities</Text>
      <View style={styles.chipRow}>
        {FACILITY_OPTIONS.map(f => (
          <Chip
            key={f}
            active={facilities.includes(f)}
            label={f}
            onPress={() => toggleFacility(f)}
          />
        ))}
      </View>

      {/* Owner Contact */}
      <View style={styles.sectionDivider} />
      <Text style={styles.sectionHeading}>Owner Contact Info</Text>

      <Field
        label="Phone Number *"
        value={ownerPhone}
        onChange={setOwnerPhone}
        placeholder="03001234567 or +923001234567"
        keyboardType="phone-pad"
      />
      <Field
        label="CNIC *"
        value={ownerCnic}
        onChange={setOwnerCnic}
        placeholder="3520112345671 or 35201-1234567-1"
        keyboardType="numeric"
      />

      {/* Images */}
      <Text style={[styles.label, { marginTop: 16 }]}>Images</Text>
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

      {/* Map */}
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
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Submit Property</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const Field = ({
  label,
  value,
  onChange,
  multiline,
  keyboardType,
  placeholder,
}: any) => (
  <View style={{ marginTop: 12 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        multiline && { height: 80, textAlignVertical: 'top' },
      ]}
      value={value}
      onChangeText={onChange}
      multiline={multiline}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor="#bbb"
    />
  </View>
);

const Chip = ({ label, active, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, active && styles.chipActive]}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  sectionDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginTop: 20,
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B5FFF',
    marginTop: 8,
    marginBottom: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
  },
  row: { flexDirection: 'row' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 6,
    marginBottom: 6,
  },
  chipActive: { backgroundColor: '#0B5FFF', borderColor: '#0B5FFF' },
  chipText: { color: '#333', fontSize: 12 },
  chipTextActive: { color: '#fff' },
  uploadBtn: {
    borderWidth: 1,
    borderColor: '#0B5FFF',
    borderStyle: 'dashed',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadText: { color: '#0B5FFF', fontWeight: '600' },
  thumb: { width: 70, height: 70, marginRight: 8, borderRadius: 6 },
  coordText: { marginTop: 6, color: '#555', fontSize: 12 },
  submitBtn: {
    marginTop: 24,
    backgroundColor: '#0B5FFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
