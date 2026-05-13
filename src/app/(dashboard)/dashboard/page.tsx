import { createServerSupabaseClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get org_id from org_users table (server-side, not sessionStorage)
  const { data: orgUser } = await supabase
    .from('org_users')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  const orgId = orgUser?.organization_id ?? ''

  const [contacts, conversations, deals, automations] = await Promise.all([
    supabase.from('contacts').select('id, status, lead_score, source_channel, created_at').eq('organization_id', orgId),
    supabase.from('conversations').select('id, channel, status, unread_count, last_message_at').eq('organization_id', orgId),
    supabase.from('deals').select('id, stage, value, status').eq('organization_id', orgId),
    supabase.from('automations').select('id, name, status, run_count').eq('organization_id', orgId),
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
