import { Text, type TextProps, StyleSheet } from 'react-native'

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'subtitle' | 'label' | 'muted'
}

export function ThemedText({ style, type = 'default', ...props }: ThemedTextProps) {
  return (
    <Text
      style={[
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'subtitle' && styles.subtitle,
        type === 'label' && styles.label,
        type === 'muted' && styles.muted,
        style,
      ]}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  default: { fontSize: 16, lineHeight: 24, color: '#111827' },
  title: { fontSize: 24, lineHeight: 32, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 18, lineHeight: 28, fontWeight: '600', color: '#374151' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '500', color: '#374151' },
  muted: { fontSize: 14, lineHeight: 20, color: '#6b7280' },
})
