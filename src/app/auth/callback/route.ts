import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/inicio'

  if (!code) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent('No se pudo completar la autenticación. Intenta de nuevo.')}`,
    )
  }

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent('No se pudo completar la autenticación. Intenta de nuevo.')}`,
    )
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}${next}`)
  }

  const { data: existing } = await supabase
    .from('usuarios')
    .select('id, onboarded, tipo')
    .eq('id', user.id)
    .maybeSingle()

  if (!existing) {
    const meta = user.user_metadata ?? {}
    await supabase.from('usuarios').insert({
      id: user.id,
      nombre: meta.full_name ?? meta.name ?? 'Usuario',
      tipo: 'cliente',
      telefono: meta.phone ?? null,
      onboarded: false,
    })
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  if (existing.onboarded === false) {
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
