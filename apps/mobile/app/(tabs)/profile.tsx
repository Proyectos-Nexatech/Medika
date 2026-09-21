import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'expo-router'

export default function ProfileScreen() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Está seguro que desea cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: async () => { await signOut(); router.replace('/(auth)/login') } },
      ]
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarBox}>
        <Ionicons name="person" size={32} color="#0ea5e9" />
      </View>
      <Text style={styles.email}>{user?.email ?? 'Usuario'}</Text>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={20} color="#374151" />
          <Text style={styles.menuLabel}>Mi perfil</Text>
          <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={20} color="#374151" />
          <Text style={styles.menuLabel}>Notificaciones</Text>
          <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="shield-outline" size={20} color="#374151" />
          <Text style={styles.menuLabel}>Privacidad y seguridad</Text>
          <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, styles.menuItemDanger]} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={[styles.menuLabel, { color: '#ef4444' }]}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Medika v1.0.0</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 24, alignItems: 'center' },
  avatarBox: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 12 },
  email: { fontSize: 16, color: '#374151', marginBottom: 32 },
  menu: { width: '100%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  menuItemDanger: { borderBottomWidth: 0 },
  menuLabel: { flex: 1, fontSize: 15, color: '#374151' },
  version: { marginTop: 'auto', fontSize: 12, color: '#d1d5db', paddingBottom: 16 },
})
