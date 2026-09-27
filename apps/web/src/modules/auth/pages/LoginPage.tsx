import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { authService } from '../services/auth.service'

const loginSchema = z.object({
  email: z.string().email('Ingrese un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    }
  })

  const rememberMe = watch('rememberMe')

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      await authService.signInWithEmail(data.email, data.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión. Verifique sus credenciales.')
    }
  }

  const handleGoogleSignIn = async () => {
    console.log("Sign in with Google")
  }

  return (
    <Card className="shadow-2xl border-0 rounded-[20px] overflow-hidden bg-white/95 backdrop-blur-md">
      <div className="p-6 sm:p-8 pb-7">
        <div className="text-center mb-5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-1">¡Bienvenido de nuevo!</h2>
          <p className="text-[13px] text-slate-500 font-medium">Te extrañábamos. Ingresa tus datos.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-[13px] text-destructive font-medium text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[12px] font-bold text-slate-700 ml-1">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="Ej. usuario@medika.com"
              className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-medika-500 px-4 placeholder:text-slate-400 text-[14px]"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-[11px] text-destructive ml-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5 relative">
            <Label htmlFor="password" className="text-[12px] font-bold text-slate-700 ml-1">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-medika-500 pl-4 pr-12 placeholder:text-slate-400 text-[14px]"
                {...register('password')}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-destructive ml-1">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="remember" 
                className="h-3.5 w-3.5 rounded border-slate-300 text-medika-600 focus:ring-medika-600 cursor-pointer" 
                checked={rememberMe} 
                onChange={(e) => setValue('rememberMe', e.target.checked)} 
              />
              <Label htmlFor="remember" className="text-[12px] font-semibold text-slate-500 cursor-pointer select-none">
                Recordarme
              </Label>
            </div>
            <Link
              to="/auth/forgot-password"
              className="text-[12px] font-bold text-medika-600 hover:text-medika-700 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Button 
              type="submit" 
              className="w-full h-11 rounded-xl bg-medika-600 hover:bg-medika-700 text-[14px] font-semibold shadow-md shadow-medika-200 transition-all" 
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Sesión
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGoogleSignIn}
              className="w-full h-11 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[14px] font-semibold transition-all flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Iniciar sesión con Google
            </Button>
          </div>

          <p className="text-center text-[12.5px] text-slate-500 font-medium mt-4">
            ¿No tienes una cuenta?{' '}
            <Link to="/auth/register" className="text-medika-600 font-bold hover:text-medika-700 transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </form>
      </div>
    </Card>
  )
}