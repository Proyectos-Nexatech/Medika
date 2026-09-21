import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { MedikaButton } from '@/components/MedikaButton'
import { MedikaInput } from '@/components/MedikaInput'

export default function RegisterScreen() {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const update = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleRegister = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Por favor complete todos los campos')
      return
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { first_name: form.firstName, last_name: form.lastName },
        },
      })
      if (error) throw error
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.successTitle}>¡Cuenta creada!</Text>
        <Text style={styles.successText}>Revise su correo electrónico para verificar su cuenta.</Text>
        <MedikaButton title="Ir al inicio de sesión" onPress={() => router.replace('/(auth)/login')} style={{ marginTop: 24, width: '100%' }} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Registre su consultorio en Medika</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.row}>
          <MedikaInput label="Nombre" value={form.firstName} onChangeText={update('firstName')} placeholder="Juan" containerStyle={{ flex: 1 }} />
          <MedikaInput label="Apellido" value={form.lastName} onChangeText={update('lastName')} placeholder="Pérez" containerStyle={{ flex: 1 }} />
        </View>
        <MedikaInput label="Correo electrónico" value={form.email} onChangeText={update('email')} keyboardType="email-address" autoCapitalize="none" placeholder="admin@consultorio.com" containerStyle={{ marginTop: 12 }} />
        <MedikaInput label="Contraseña" value={form.password} onChangeText={update('password')} secureTextEntry placeholder="Mínimo 8 caracteres" containerStyle={{ marginTop: 12 }} />

        <MedikaButton title="Crear cuenta" onPress={handleRegister} loading={loading} style={{ marginTop: 24 }} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tiene cuenta? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.footerLink}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#f0f9ff', paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 24 },
  row: { flexDirection: 'row', gap: 12 },
  errorBox: { backgroundColor: '#fef2f2', borderRadius: 8, padding: 12, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#ef4444' },
  errorText: { fontSize: 13, color: '#dc2626' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: '#6b7280' },
  footerLink: { fontSize: 14, color: '#0ea5e9', fontWeight: '600' },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#f0f9ff' },
  successIcon: { fontSize: 48, color: '#22c55e', marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  successText: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 8 },
})
