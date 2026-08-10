import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import api, { API_BASE_URL } from '@/utils/crud-api';
import type { StudentPhone } from '@/utils/types';

type CardProps = {
  phone: StudentPhone;
  refresh: () => Promise<void>;
};

export default function Card({ phone, refresh }: CardProps) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const delPhone = async () => {
    try {
      setDeleting(true);
      setDeleteError('');
      await api.delete(`phones/${phone.id}`);
      setConfirming(false);
      await refresh();
    } catch {
      setDeleteError(`Could not reach ${API_BASE_URL}. Make sure JSON Server is running with npm run api.`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{phone.name.slice(0, 1).toUpperCase()}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={1}>{phone.name}</Text>
          <Text style={styles.meta}>{phone.sect}  ·  {phone.tel}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push({
              pathname: '/editPhone',
              params: { id: phone.id, name: phone.name, sect: phone.sect, tel: phone.tel },
            })}
            style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
          >
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
          <Pressable onPress={() => { setConfirming(true); setDeleteError(''); }} style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>
      </View>
      {confirming ? (
        <View style={styles.confirmBox}>
          <Text style={styles.confirmTitle}>Delete {phone.name}?</Text>
          <Text style={styles.confirmText}>This phone record will be removed permanently.</Text>
          {deleteError ? <Text style={styles.errorText}>{deleteError}</Text> : null}
          <View style={styles.confirmActions}>
            <Pressable onPress={() => setConfirming(false)} disabled={deleting} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={() => void delPhone()} disabled={deleting} style={({ pressed }) => [styles.confirmDeleteButton, (pressed || deleting) && styles.pressed]}>
              <Text style={styles.confirmDeleteText}>{deleting ? 'Deleting…' : 'Yes, delete'}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  container: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E6EAF0',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 14,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    marginRight: 12,
    width: 44,
  },
  avatarText: { color: '#1D4ED8', fontSize: 18, fontWeight: '800' },
  details: { flex: 1, marginRight: 8 },
  name: { color: '#182230', fontSize: 16, fontWeight: '700', marginBottom: 3 },
  meta: { color: '#667085', fontSize: 13 },
  actions: { alignItems: 'stretch', gap: 8 },
  editButton: { alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 8, minWidth: 72, paddingHorizontal: 12, paddingVertical: 8 },
  editText: { color: '#1D4ED8', fontSize: 12, fontWeight: '700' },
  deleteButton: { alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 8, minWidth: 72, paddingHorizontal: 12, paddingVertical: 8 },
  deleteText: { color: '#DC2626', fontSize: 12, fontWeight: '700' },
  confirmBox: { backgroundColor: '#FFF7F7', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, borderColor: '#FECACA', borderWidth: 1, borderTopWidth: 0, padding: 14 },
  confirmTitle: { color: '#991B1B', fontSize: 14, fontWeight: '800' },
  confirmText: { color: '#7F1D1D', fontSize: 13, marginTop: 4 },
  errorText: { color: '#B42318', fontSize: 12, lineHeight: 17, marginTop: 9 },
  confirmActions: { flexDirection: 'row', gap: 9, justifyContent: 'flex-end', marginTop: 13 },
  cancelButton: { borderColor: '#D0D5DD', borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  cancelText: { color: '#344054', fontSize: 12, fontWeight: '800' },
  confirmDeleteButton: { backgroundColor: '#DC2626', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  confirmDeleteText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  pressed: { opacity: 0.65 },
});
