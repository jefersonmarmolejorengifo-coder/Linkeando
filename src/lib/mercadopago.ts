import MercadoPagoConfig, { Preference } from 'mercadopago'

// Instancia singleton del cliente MP (solo servidor)
let _client: MercadoPagoConfig | null = null

export function getMPClient(): MercadoPagoConfig {
  if (!_client) {
    const token = process.env.MP_ACCESS_TOKEN
    if (!token) throw new Error('MP_ACCESS_TOKEN no está configurado')
    _client = new MercadoPagoConfig({ accessToken: token })
  }
  return _client
}

export { Preference }
