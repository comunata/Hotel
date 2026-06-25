import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { generateReservationCode, calculateNights, getExtrasPrice } from '@/lib/utils'

const PRICE_PER_NIGHT = 450
const DEFAULT_PROPERTY_ID = null // Will be set after seeding

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      checkIn, checkOut, guestsCount,
      guestName, guestEmail, guestPhone,
      extras = [], notes, totalPrice: clientTotal,
    } = body

    if (!checkIn || !checkOut || !guestName || !guestPhone) {
      return NextResponse.json({ error: 'Câmpuri obligatorii lipsă' }, { status: 400 })
    }

    const supabase = getSupabaseServer()
    const code = generateReservationCode('PS')

    const nights = calculateNights(checkIn, checkOut)
    const totalPrice = clientTotal ?? (nights * PRICE_PER_NIGHT + getExtrasPrice(extras))

    // Upsert guest into CRM
    let guestId: string | null = null
    if (guestEmail || guestPhone) {
      const query = guestEmail
        ? supabase.from('h_guests').select('id, visits_count').eq('email', guestEmail).single()
        : supabase.from('h_guests').select('id, visits_count').eq('phone', guestPhone).single()

      const { data: existingGuest } = await query

      if (existingGuest) {
        await supabase
          .from('h_guests')
          .update({
            last_visit: checkIn,
            visits_count: (existingGuest.visits_count || 0) + 1,
          })
          .eq('id', existingGuest.id)
        guestId = existingGuest.id
      } else {
        const { data: newGuest } = await supabase
          .from('h_guests')
          .insert({
            name: guestName,
            email: guestEmail || null,
            phone: guestPhone || null,
            first_visit: checkIn,
            last_visit: checkIn,
            visits_count: 1,
            preferences: extras.length > 0 ? { preferred_extras: extras } : {},
          })
          .select('id')
          .single()
        guestId = newGuest?.id || null
      }
    }

    // Create reservation
    const { data: reservation, error } = await supabase
      .from('h_reservations')
      .insert({
        code,
        property_id: DEFAULT_PROPERTY_ID,
        guest_id: guestId,
        guest_name: guestName,
        guest_email: guestEmail || null,
        guest_phone: guestPhone,
        check_in: checkIn,
        check_out: checkOut,
        guests_count: guestsCount || 2,
        extras,
        total_price: totalPrice,
        status: 'pending',
        notes: notes || null,
        source: 'website',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Eroare la salvarea rezervării' }, { status: 500 })
    }

    // Auto system message
    await supabase.from('h_messages').insert({
      reservation_id: reservation.id,
      sender: 'system',
      content: `Rezervare nouă înregistrată. Cod: ${code}. Check-in: ${checkIn}. Total: ${totalPrice} RON.`,
    })

    return NextResponse.json({
      code: reservation.code,
      id: reservation.id,
      totalPrice: reservation.total_price,
    })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Eroare internă' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Cod lipsă' }, { status: 400 })
  }

  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from('h_reservations')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Rezervarea nu a fost găsită' }, { status: 404 })
  }

  return NextResponse.json(data)
}
