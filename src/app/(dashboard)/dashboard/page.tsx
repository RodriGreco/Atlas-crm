import { createServerSupabaseClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const ORG_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

  const [contacts, conversations, deals, automations] = await Promise.all([
    supabase.from('contacts').select('id, status, lead_score, source_channel, created_at').eq('organization_id', ORG_ID),
    supabase.from('conversations').select('id, channel, status, unread_count, last_message_at').eq('organization_id', ORG_ID),
    supabase.from('deals').select('id, stage, value, status').eq('organization_id', ORG_ID),
    supabase.from('automations').select('id, name, status, run_count').eq('organization_id', ORG_ID),
  ])

  return (
    <DashboardClient
      contacts={contacts.data ?? []}
      conversations={conversations.data ?? []}
      deals={deals.data ?? []}
      automations={automations.data ?? []}
    />
  )
}
