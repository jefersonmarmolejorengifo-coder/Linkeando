'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import type { Categoria } from '@/types'

export async function login(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/inicio')
}

export async function registro(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const email    = formData.get('email') as string
  const password = formData.get('password') as string
  const nombre   = `${formData.get('nombre') ?? ''} ${formData.get('apellido') ?? ''}`.trim()
  const telefono = formData.get('telefono') as string
  const tipo     = formData.get('tipo') as 'cliente' | 'profesional'
  const categoria  = formData.get('categoria') as Categoria | null
  const barrio   = formData.get('barrio') as string | null

  // 1. Crear usuario en Supabase Auth con metadatos — el trigger los usa para crear el perfil
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        tipo,
        nombre,
        telefono: telefono || '',
        categoria: tipo === 'profesional' ? (categoria ?? '') : '',
        barrio: barrio || '',
      },
    },
  })

  if (authError || !data.user) {
    redirect(`/auth/registro?error=${encodeURIComponent(authError?.message ?? 'Error al registrar')}`)
  }

  // 2. Intentar insertar perfil directamente como respaldo (por si el trigger aún no corrió)
  await supabase.from('usuarios').upsert({
    id: data.user.id,
    tipo,
    nombre,
    telefono: telefono || null,
    categoria: tipo === 'profesional' ? categoria : null,
    barrio: barrio || null,
  }, { onConflict: 'id', ignoreDuplicates: true })

  revalidatePath('/', 'layout')
  redirect('/inicio')
}

export async function recuperarPassword(_: unknown, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const email = formData.get('email') as string
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/nueva-password`,
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function logout() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
