import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useState, useCallback } from 'react'

interface QuickActionProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  color: string
  onPress: () => void
}

function QuickAction({ icon, label, color, onPress }: QuickActionProps) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  )
}

export default function HomeScreen() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const { data: appointments, isLoading: loadingApps, refetch: refetchApps } = useQuery({
    queryKey: ['appointments', profile?.organization_id],
    queryFn: () => api.getAppointments(profile!.organization_id),
    enabled: !!profile?.organization_id,
  })

  const { data: patients, isLoading: loadingPats, refetch: refetchPats } = useQuery({
    queryKey: ['patients', profile?.organization_id],
    queryFn: () => api.getPatients(profile!.organization_id),
    enabled: !!profile?.organization_id,
  })

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    Promise.all([refetchApps(), refetchPats()]).then(() => setRefreshing(false))
  }, [refetchApps, refetchPats])

  const upcomingApps = appointments ? appointments.slice(0, 3) : []
  const todayApps = appointments ? appointments.filter((a: any) => a.appointment_date === today) : []
  const pendingApps = todayApps.filter((a: any) => a.status === 'pending').length
  const attendedApps = todayApps.filter((a: any) => a.status === 'attended').length

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Greeting */}
      <View style={styles.header}>
        <Text style={styles.greeting}>¡Hola, {profile?.first_name || 'Doctor'}! 👋</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
          <Text style={styles.statValue}>{loadingApps ? '-' : todayApps.length}</Text>
          <Text style={styles.statLabel}>Citas hoy</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
          <Text style={styles.statValue}>{loadingApps ? '-' : attendedApps}</Text>
          <Text style={styles.statLabel}>Atendidos (Hoy)</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#fefce8' }]}>
          <Text style={styles.statValue}>{loadingApps ? '-' : pendingApps}</Text>
          <Text style={styles.statLabel}>Pendientes (Hoy)</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#fdf2f8' }]}>
          <Text style={styles.statValue}>{loadingPats ? '-' : patients?.length || 0}</Text>
          <Text style={styles.statLabel}>Pacientes</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Acciones rápidas</Text>
      <View style={styles.quickActions}>
        <QuickAction icon="calendar" label="Ver Agenda" color="#0ea5e9" onPress={() => router.push('/(tabs)/appointments')} />
        <QuickAction icon="people" label="Ver Pacientes" color="#22c55e" onPress={() => router.push('/(tabs)/patients')} />
        <QuickAction icon="add-circle" label="Agendar Cita" color="#8b5cf6" onPress={() => alert('Para agendar, ingresa desde la plataforma Web por ahora.')} />
        <QuickAction icon="document-text" label="Documentos" color="#f59e0b" onPress={() => alert('Abre la versión Web para imprimir documentos.')} />
      </View>

      {/* Próximas citas */}
      <Text style={styles.sectionTitle}>Próximas citas</Text>
      <View style={{ gap: 12 }}>
        {loadingApps ? (
           <ActivityIndicator size="small" color="#0ea5e9" style={{ marginTop: 20 }}/>
        ) : upcomingApps.length === 0 ? (
          <View style={styles.placeholder}>
            <Ionicons name="calendar-outline" size={32} color="#d1d5db" />
            <Text style={styles.placeholderText}>No hay citas próximas</Text>
          </View>
        ) : (
          upcomingApps.map((item: any) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.timeContainer}>
                <Text style={styles.dateBadge}>{item.appointment_date.substring(5, 10)}</Text>
                <Text style={styles.time}>{item.start_time.substring(0,5)}</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.name}>{item.patients?.first_name} {item.patients?.last_name}</Text>
                <Text style={styles.service}>{item.services?.name}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#111827' },
  date: { fontSize: 14, color: '#6b7280', marginTop: 2, textTransform: 'capitalize' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: { fontSize: 28, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  quickAction: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  quickActionIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { fontSize: 13, fontWeight: '500', color: '#374151', textAlign: 'center' },
  placeholder: { backgroundColor: '#fff', borderRadius: 12, padding: 32, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#f3f4f6', borderStyle: 'dashed' },
  placeholderText: { fontSize: 14, color: '#9ca3af' },
  card: { flexDirection: 'row', backgroundColor: 'white', padding: 16, borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  timeContainer: { borderRightWidth: 1, borderRightColor: '#e2e8f0', paddingRight: 12, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  dateBadge: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 2 },
  time: { fontSize: 16, fontWeight: 'bold', color: '#0ea5e9' },
  infoContainer: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#334155' },
  service: { fontSize: 14, color: '#64748b', marginTop: 2 },
})
