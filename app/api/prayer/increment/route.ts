import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RequestBody {
  prayerTypeId: string
  userId: string
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()
    const { prayerTypeId, userId } = body

    // Validation
    if (!prayerTypeId || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded 
      ? forwarded.split(',')[0].trim() 
      : request.headers.get('x-real-ip') || '0.0.0.0'

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // Create Supabase client
    const supabase = await createClient()

    // Call the submit_prayer_action function
    const { data, error } = await supabase.rpc('submit_prayer_action', {
      p_prayer_type_id: prayerTypeId,
      p_user_identifier: userId,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
    })

    if (error) {
      console.error('Supabase RPC error:', error)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to record prayer. Please try again.' 
        },
        { status: 500 }
      )
    }

    // Extract result
    const result = Array.isArray(data) ? data[0] : data

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: result.message,
          secondsToWait: result.seconds_to_wait 
        },
        { status: result.seconds_to_wait > 0 ? 429 : 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      newTotal: result.new_total,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}

// Disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0
