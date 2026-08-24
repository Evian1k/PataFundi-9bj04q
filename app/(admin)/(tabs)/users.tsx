import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/theme';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { fundiService } from '@/services/fundiService';
import { Fundi } from '@/types';

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const [fundis, setFundis] = useState<Fundi[]>([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'customers' | 'fundis'>('fundis');

  useEffect(() => {
    fundiService.getAllFundis().then(res => { if (res.success && res.data) setFundis(res.data); });
  }, []);

  const filtered = fundis.filter(f =>
    `${f.firstName} ${f.lastName} ${f.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Users Management</Text>
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color={Colors.text.secondary} />
        <TextInput value={search} onChangeText={setSearch} placeholder="Search users..." placeholderTextColor={Colors.text.muted} style={styles.searchInput} />
      </View>
      <View style={styles.tabBar}>
        {(['customers', 'fundis'] as const).map(t => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tabBtn, tab === t && styles.tabBtnActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Avatar name={`${item.firstName} ${item.lastName}`} size={44} isOnline={item.isOnline} isVerified={item.verificationStatus === 'verified'} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
              <Text style={styles.userStats}>{item.totalJobs} jobs · ⭐ {item.rating}</Text>
            </View>
            <View style={styles.userActions}>
              <Badge label={item.verificationStatus} variant={item.verificationStatus === 'verified' ? 'success' : 'warning'} size="sm" />
              <Pressable style={styles.actionBtn}>
                <MaterialIcons name="more-vert" size={18} color={Colors.text.secondary} />
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text.primary, paddingHorizontal: 20, paddingVertical: 14, includeFontPadding: false },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.glass.medium, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.glass.border, paddingHorizontal: 16, height: 48, gap: 10, marginHorizontal: 20, marginBottom: 16 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text.primary, includeFontPadding: false },
  tabBar: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: Radius.full, backgroundColor: Colors.glass.light, borderWidth: 1, borderColor: Colors.glass.border },
  tabBtnActive: { backgroundColor: 'rgba(139,92,246,0.2)', borderColor: Colors.role.admin },
  tabText: { fontSize: 13, fontWeight: '500', color: Colors.text.secondary, includeFontPadding: false },
  tabTextActive: { color: Colors.role.admin },
  list: { paddingHorizontal: 20, paddingBottom: 120 },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.glass.borderLight },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '600', color: Colors.text.primary, includeFontPadding: false },
  userEmail: { fontSize: 12, color: Colors.text.secondary, marginTop: 2, includeFontPadding: false },
  userStats: { fontSize: 12, color: Colors.text.muted, marginTop: 2, includeFontPadding: false },
  userActions: { alignItems: 'flex-end', gap: 6 },
  actionBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
});
