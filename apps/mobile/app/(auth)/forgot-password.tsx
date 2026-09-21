import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { MedikaButton } from '@/components/MedikaButton'
import { MedikaInput } from '@/components/MedikaInput'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleReset = async () => {
    if (!email) { setError('Ingrese su correo electrónico'); return }
    try {
      setLoading(true); setError(null)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'medika://reset-password',
      })
      if (error) throw error
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el correo')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Correo enviado</Text>
        <Text style={styles.subtitle}>Si el correo está registrado, recibirá las instrucciones para restablecer su contraseña.</Text>
        <MedikaButton title="Volver al inicio" onPress={() => router.replace('/(auth)/login')} style={{ marginTop: 24 }} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar contraseña</Text>
      <Text style={styles.subtitle}>Ingrese su correo electrónico para recibir las instrucciones</Text>

      {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

      <MedikaInput label="Correo electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="usuario@consultorio.com" />

      <MedikaButton title="Enviar instrucciones" onPress={handleReset} loading={loading} style={{ marginTop: 20 }} />

      <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
        <Text style={styles.backText}>← Volver al inicio de sesión</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f0f9ff', paddingTop: 80 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 24, lineHeight: 20 },
  errorBox: { backgroundColor: '#fef2f2', borderRadius: 8, padding: 12, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#ef4444' },
  errorText: { fontSize: 13, color: '#dc2626' },
  backLink: { marginTop: 20, alignSelf: 'center' },
  backText: { fontSize: 14, color: '#0ea5e9' },
})
