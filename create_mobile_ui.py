import os

base_dir = r"c:\Users\EQC0670\Medika\apps\mobile"

files = {
    "src/services/api.ts": """import { supabase } from '@/lib/supabase';

export const api = {
  async getPatients(organizationId: string) {
    const { data, error } = await supabase.from('patients').select('*').eq('organization_id', organizationId).order('last_name', { ascending: true });
    if (error) throw error;
    return data;
  },
  async getAppointments(organizationId: string, date: string) {
    const { data, error } = await supabase.from('appointments')
      .select('*, patients(first_name, last_name), services(name, duration_minutes)')
      .eq('organization_id', organizationId)
      .gte('start_time', `${date}T00:00:00Z`)
      .lte('start_time', `${date}T23:59:59Z`)
      .order('start_time', { ascending: true });
    if (error) throw error;
    return data;
  }
};
""",
    "app/(tabs)/patients.tsx": """import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function PatientsScreen() {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.organization_id) {
      api.getPatients(profile.organization_id)
        .then(data => setPatients(data || []))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [profile]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Directorio de Pacientes</Text>
      {patients.length === 0 ? (
        <Text style={styles.empty}>No hay pacientes registrados.</Text>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
              <Text style={styles.details}>{item.id_type} {item.id_number} • {item.email || 'Sin correo'}</Text>
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
  card: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  name: { fontSize: 16, fontWeight: '600', color: '#334155' },
  details: { fontSize: 14, color: '#64748b', marginTop: 4 },
});
""",
    "app/(tabs)/appointments.tsx": """import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function AppointmentsScreen() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fecha actual YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (profile?.organization_id) {
      api.getAppointments(profile.organization_id, today)
        .then(data => setAppointments(data || []))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [profile]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agenda del Día</Text>
      <Text style={styles.subtitle}>{today}</Text>
      {appointments.length === 0 ? (
        <Text style={styles.empty}>No tienes citas programadas hoy.</Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const time = new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <View style={styles.card}>
                <View style={styles.timeBox}>
                  <Text style={styles.timeText}>{time}</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.name}>{item.patients?.first_name} {item.patients?.last_name}</Text>
                  <Text style={styles.service}>{item.services?.name}</Text>
                  <Text style={styles.status}>{item.status}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 20 },
  card: { flexDirection: 'row', backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  timeBox: { justifyContent: 'center', alignItems: 'center', paddingRight: 16, borderRightWidth: 1, borderRightColor: '#e2e8f0', marginRight: 16 },
  timeText: { fontSize: 16, fontWeight: 'bold', color: '#0284c7' },
  infoBox: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#334155' },
  service: { fontSize: 14, color: '#64748b', marginTop: 2 },
  status: { fontSize: 12, color: '#0369a1', marginTop: 4, backgroundColor: '#e0f2fe', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
});
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
