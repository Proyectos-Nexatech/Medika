import { useEffect, useState } from 'react';
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
    } else {
       setLoading(false);
    }
  }, [profile]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0ea5e9" /></View>;

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
              <Text style={styles.details}>{item.document_type} {item.document_number} • {item.email || 'Sin correo'}</Text>
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
