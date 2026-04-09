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
  redirect('/')
}

export async function registro(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const email    = formData.get('email') as string
  const password = formData.get('password') as string
  const nombre   = formData.get('nombre') as string
  const telefono = formData.get('telefono') as string
  const tipo     = formData.get('tipo') as 'cliente' | 'profesional'
  const categoria  = formData.get('categoria') as Categoria | null
  const descripcion = formData.get('descripcion') as string | null
  const barrio   = formData.get('barrio') as string | null

  // 1. Crear usuario en Supabase Auth
  const { data, error: authError } = await supabase.auth.signUp({ email, password })

  if (authError || !data.user) {
    redirect(`/auth/registro?error=${encodeURIComponent(authError?.message ?? 'Error al registrar')}`)
  }

  // 2. Insertar perfil en la tabla usuarios
  const { error: dbError } = await supabase.from('usuarios').insert({
    id: data.user.id,
    tipo,
    nombre,
    telefono: telefono || null,
    categoria: tipo === 'profesional' ? categoria : null,
    descripcion: tipo === 'profesional' ? descripcion : null,
    barrio: barrio || null,
  })

  if (dbError) {
    redirect(`/auth/registro?error=${encodeURIComponent(dbError.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/?bienvenida=1')
}

export async function logout() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
