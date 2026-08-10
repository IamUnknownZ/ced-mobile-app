import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RadioButton } from 'react-native-paper';
import { router } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';

import api from '@/utils/crud-api';
import type { StudentPhone } from '@/utils/types';

export default function AddPhone() {
  const [name, setName] = useState('');
  const [sect, setSect] = useState('');
  const [tel, setTel] = useState('');
  const [saving, setSaving] = useState(false);

  const addPhone = async () => {
    if (!name.trim() || !sect || !tel.trim()) {
      Alert.alert('Missing information', 'Please enter name, section, and phone number.');
      return;
    }

    const phone: StudentPhone = { id: uuidv4(), name: name.trim(), sect, tel: tel.trim() };
    try {
      setSaving(true);
      await api.post('phones', phone);
      router.replace('/');
    } catch {
      Alert.alert('Save failed', 'Please make sure JSON Server is running, then try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()}><Text style={styles.back}>‹  Back to students</Text></Pressable>
          <Text style={styles.title}>Add new phone</Text>
          <Text style={styles.subtitle}>Create a contact record for a student.</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Student name</Text>
            <TextInput value={name} onChangeText={setName} placeholder="e.g. Steve Davis" placeholderTextColor="#98A2B3" style={styles.input} autoCapitalize="words" />

            <Text style={styles.label}>Section</Text>
            <RadioButton.Group value={sect} onValueChange={setSect}>
              <View style={styles.sections}>
                <Pressable onPress={() => setSect('CED')} style={[styles.sectionOption, sect === 'CED' && styles.sectionSelected]}>
                  <RadioButton value="CED" color="#2563EB" /><Text style={styles.sectionText}>CED</Text>
                </Pressable>
                <Pressable onPress={() => setSect('TCT')} style={[styles.sectionOption, sect === 'TCT' && styles.sectionSelected]}>
                  <RadioButton value="TCT" color="#2563EB" /><Text style={styles.sectionText}>TCT</Text>
                </Pressable>
              </View>
            </RadioButton.Group>

            <Text style={styles.label}>Phone number</Text>
            <TextInput value={tel} onChangeText={setTel} placeholder="e.g. 088-886-9845" placeholderTextColor="#98A2B3" style={styles.input} keyboardType="phone-pad" />
          </View>

          <View style={styles.actions}>
            <Pressable onPress={() => router.back()} disabled={saving} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}><Text style={styles.cancelText}>Cancel</Text></Pressable>
            <Pressable onPress={() => void addPhone()} disabled={saving} style={({ pressed }) => [styles.saveButton, (pressed || saving) && styles.pressed]}><Text style={styles.saveText}>{saving ? 'Saving…' : 'Add phone'}</Text></Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F5F7FB', flex: 1 }, flex: { flex: 1 }, content: { padding: 20, paddingBottom: 36 },
  back: { color: '#2563EB', fontSize: 15, fontWeight: '700', marginBottom: 24 },
  title: { color: '#182230', fontSize: 29, fontWeight: '800' }, subtitle: { color: '#667085', fontSize: 15, marginBottom: 24, marginTop: 7 },
  card: { backgroundColor: '#FFFFFF', borderColor: '#E6EAF0', borderRadius: 18, borderWidth: 1, padding: 18 },
  label: { color: '#344054', fontSize: 14, fontWeight: '800', marginBottom: 8, marginTop: 6 },
  input: { backgroundColor: '#FFFFFF', borderColor: '#D0D5DD', borderRadius: 10, borderWidth: 1, color: '#182230', fontSize: 16, marginBottom: 20, paddingHorizontal: 13, paddingVertical: 12 },
  sections: { flexDirection: 'row', gap: 10, marginBottom: 20 }, sectionOption: { alignItems: 'center', borderColor: '#D0D5DD', borderRadius: 10, borderWidth: 1, flexDirection: 'row', paddingRight: 15 }, sectionSelected: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' }, sectionText: { color: '#344054', fontSize: 14, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end', marginTop: 22 }, cancelButton: { borderColor: '#D0D5DD', borderRadius: 10, borderWidth: 1, paddingHorizontal: 18, paddingVertical: 12 }, cancelText: { color: '#344054', fontWeight: '800' }, saveButton: { backgroundColor: '#2563EB', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 12 }, saveText: { color: '#FFFFFF', fontWeight: '800' }, pressed: { opacity: 0.6 },
});
