import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/inicio'

  if (code) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Verificar si el usuario ya tiene perfil en `usuarios`
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: existing } = await supabase
          .from('usuarios')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        if (!existing) {
          // Primer login con Google: crear perfil básico como cliente
          const meta = user.user_metadata ?? {}
          await supabase.from('usuarios').insert({
            id: user.id,
            nombre: meta.full_name ?? meta.name ?? 'Usuario',
            tipo: 'cliente',
            telefono: meta.phone ?? null,
          })
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Si algo falla, redirigir al login con error
  return NextResponse.redirect(
    `${origin}/auth/login?error=${encodeURIComponent('No se pudo completar la autenticación. Intenta de nuevo.')}`,
  )
}
