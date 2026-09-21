import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useState, useCallback } from 'react';

export default function AppointmentsScreen() {
  const { profile } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [refreshing, setRefreshing] = useState(false);

  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ['appointments', profile?.organization_id],
    queryFn: () => api.getAppointments(profile!.organization_id),
    enabled: !!profile?.organization_id,
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  }, [refetch]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Últimas Citas</Text>
      {!appointments || appointments.length === 0 ? (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <Text style={styles.empty}>No hay citas programadas.</Text>
        </ScrollView>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.timeContainer}>
                <Text style={styles.date}>{item.appointment_date.substring(5, 10)}</Text>
                <Text style={styles.time}>{item.start_time.substring(0,5)}</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.name}>{item.patients?.first_name} {item.patients?.last_name}</Text>
                <Text style={styles.service}>{item.services?.name}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#0f172a' },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 20 },
  card: { flexDirection: 'row', backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  timeContainer: { borderRightWidth: 1, borderRightColor: '#e2e8f0', paddingRight: 12, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  date: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 2 },
  time: { fontSize: 16, fontWeight: 'bold', color: '#0ea5e9' },
  infoContainer: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#334155' },
  service: { fontSize: 14, color: '#64748b', marginTop: 2 },
});
