import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';

import Card from '@/components/card';
import api from '@/utils/crud-api';
import type { StudentPhone } from '@/utils/types';

export default function Index() {
  const [data, setData] = useState<StudentPhone[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const getData = useCallback(async () => {
    try {
      setError('');
      const response = await api.get<StudentPhone[]>('phones');
      setData(response.data);
    } catch {
      setError('Cannot connect to API. Start JSON Server with npm run api.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void getData(); }, [getData]));

  const phones = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return data;
    return data.filter((phone) => `${phone.name} ${phone.sect} ${phone.tel}`.toLowerCase().includes(term));
  }, [data, query]);

  const onRefresh = () => {
    setRefreshing(true);
    void getData();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <FlatList
        data={phones}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Card phone={item} refresh={getData} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.hero}>
              <Text style={styles.eyebrow}>CONTACT DIRECTORY</Text>
              <Text style={styles.title}>Student Phones</Text>
              <Text style={styles.subtitle}>Keep every classmate’s contact in one tidy place.</Text>
              <Pressable onPress={() => router.push('/addPhone')} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
                <Text style={styles.addButtonText}>+  Add student phone</Text>
              </Pressable>
            </View>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search name, section, or phone"
              placeholderTextColor="#98A2B3"
              style={styles.search}
              returnKeyType="search"
            />
            <View style={styles.listHeading}>
              <Text style={styles.listTitle}>Students</Text>
              <Text style={styles.count}>{phones.length} record{phones.length === 1 ? '' : 's'}</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.empty}><ActivityIndicator color="#2563EB" /><Text style={styles.emptyText}>Loading contacts…</Text></View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>{error ? 'API is not available' : 'No student phones yet'}</Text>
              <Text style={styles.emptyText}>{error || 'Tap “Add student phone” to create the first record.'}</Text>
              {error ? <Pressable onPress={() => void getData()}><Text style={styles.retry}>Try again</Text></Pressable> : null}
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F5F7FB', flex: 1 },
  content: { flexGrow: 1, padding: 20, paddingBottom: 32 },
  hero: { backgroundColor: '#EAF1FF', borderRadius: 22, marginBottom: 16, padding: 22 },
  eyebrow: { color: '#2563EB', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 7 },
  title: { color: '#172554', fontSize: 30, fontWeight: '800' },
  subtitle: { color: '#475467', fontSize: 14, lineHeight: 20, marginTop: 7 },
  addButton: { alignSelf: 'flex-start', backgroundColor: '#2563EB', borderRadius: 10, marginTop: 18, paddingHorizontal: 16, paddingVertical: 11 },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  search: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 12, borderWidth: 1, color: '#182230', fontSize: 15, paddingHorizontal: 15, paddingVertical: 12 },
  listHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, marginTop: 22 },
  listTitle: { color: '#182230', fontSize: 18, fontWeight: '800' },
  count: { color: '#667085', fontSize: 13 },
  empty: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#E6EAF0', borderRadius: 16, borderWidth: 1, gap: 8, marginTop: 2, padding: 28 },
  emptyTitle: { color: '#344054', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  emptyText: { color: '#667085', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  retry: { color: '#2563EB', fontSize: 14, fontWeight: '800', marginTop: 6 },
  pressed: { opacity: 0.72 },
});
