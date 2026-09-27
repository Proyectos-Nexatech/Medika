import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { authService } from '../services/auth.service'

const registerSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  organizationName: z.string().min(3, 'El nombre del consultorio debe tener al menos 3 caracteres'),
  email: z.string().email('Ingrese un correo electrÃ³nico vÃ¡lido'),
  password: z.string().min(8, 'La contraseÃ±a debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseÃ±as no coinciden',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null)
      await authService.signUpWithEmail(data.email, data.password, {
        first_name: data.firstName,
        last_name: data.lastName,
        organization_name: data.organizationName,
      })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta.')
    }
  }

  if (success) {
    return (
      <Card className="shadow-2xl border-0 rounded-[24px] overflow-hidden bg-white/95 backdrop-blur-md">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">Â¡Cuenta creada exitosamente!</h2>
          <p className="text-sm text-muted-foreground">
            Hemos enviado un correo de verificaciÃ³n a su email. Por favor revise su bandeja de entrada.
          </p>
          <Button asChild className="w-full h-12 rounded-xl bg-medika-600 hover:bg-medika-700 text-[15px] font-semibold shadow-md shadow-medika-200 transition-all">
            <Link to="/auth/login">Ir al inicio de sesiÃ³n</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-2xl border-0 rounded-[24px] overflow-hidden bg-white/95 backdrop-blur-md">
      <div className="p-8 md:p-10 pb-0"><CardHeader className="px-0 pt-0 text-center">
        <CardTitle className="text-xl">Crear cuenta</CardTitle>
        <CardDescription>Registre su consultorio en Medika</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5 px-0">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input id="firstName" placeholder="Juan" {...register('firstName')} />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input id="lastName" placeholder="PÃ©rez" {...register('lastName')} />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="organizationName">Nombre del consultorio</Label>
            <Input id="organizationName" placeholder="Consultorio San Juan" {...register('organizationName')} />
            {errors.organizationName && <p className="text-xs text-destructive">{errors.organizationName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrÃ³nico</Label>
            <Input id="email" type="email" placeholder="admin@consultorio.com" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">ContraseÃ±a</Label>
            <Input id="password" type="password" placeholder="MÃ­nimo 8 caracteres" {...register('password')} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseÃ±a</Label>
            <Input id="confirmPassword" type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 px-0 pt-4 pb-0"></div>
          <Button type="submit" className="w-full h-12 rounded-xl bg-medika-600 hover:bg-medika-700 text-[15px] font-semibold shadow-md shadow-medika-200 transition-all" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear cuenta
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Â¿Ya tiene cuenta?{' '}
            <Link to="/auth/login" className="text-medika-600 hover:underline font-medium">Iniciar sesiÃ³n</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
