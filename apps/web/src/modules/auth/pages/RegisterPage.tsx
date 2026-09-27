import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { authService } from '../services/auth.service'

const registerSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  organizationName: z.string().min(3, 'El nombre del consultorio debe tener al menos 3 caracteres'),
  email: z.string().email('Ingrese un correo electrónico válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

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
      await authService.registerWithOrganization({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        organizationName: data.organizationName
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse. Intente de nuevo.')
    }
  }

  return (
    <Card className="shadow-2xl border-0 rounded-[24px] overflow-hidden bg-white/95 backdrop-blur-md">
      <div className="p-8 md:p-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Crear nueva cuenta</h2>
          <p className="text-sm text-slate-500 font-medium">Registra tu consultorio para comenzar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive font-medium text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-[13px] font-bold text-slate-700 ml-1">Nombre</Label>
              <Input id="firstName" placeholder="Juan" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-medika-500 px-4" {...register('firstName')} />
              {errors.firstName && <p className="text-xs text-destructive ml-1">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-[13px] font-bold text-slate-700 ml-1">Apellido</Label>
              <Input id="lastName" placeholder="Pérez" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-medika-500 px-4" {...register('lastName')} />
              {errors.lastName && <p className="text-xs text-destructive ml-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="organizationName" className="text-[13px] font-bold text-slate-700 ml-1">Nombre del Consultorio</Label>
            <Input id="organizationName" placeholder="Consultorio Médico San Juan" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-medika-500 px-4" {...register('organizationName')} />
            {errors.organizationName && <p className="text-xs text-destructive ml-1">{errors.organizationName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[13px] font-bold text-slate-700 ml-1">Correo electrónico</Label>
            <Input id="email" type="email" placeholder="admin@consultorio.com" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-medika-500 px-4" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive ml-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[13px] font-bold text-slate-700 ml-1">Contraseña</Label>
            <Input id="password" type="password" placeholder="Mínimo 8 caracteres" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-medika-500 px-4" {...register('password')} />
            {errors.password && <p className="text-xs text-destructive ml-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-[13px] font-bold text-slate-700 ml-1">Confirmar contraseña</Label>
            <Input id="confirmPassword" type="password" placeholder="Confirma tu contraseña" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-medika-500 px-4" {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-xs text-destructive ml-1">{errors.confirmPassword.message}</p>}
          </div>

          <div className="pt-3">
            <Button type="submit" className="w-full h-12 rounded-xl bg-medika-600 hover:bg-medika-700 text-[15px] font-semibold shadow-md transition-all" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Crear cuenta
            </Button>
          </div>

          <p className="text-center text-[13.5px] text-slate-500 font-medium mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/auth/login" className="text-medika-600 hover:text-medika-700 font-bold transition-colors">Iniciar sesión</Link>
          </p>
        </form>
      </div>
    </Card>
  )
}