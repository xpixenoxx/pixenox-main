import { createClient } from '@/lib/supabase/server'
import { Layers, Briefcase, MessageSquare, BellRing } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: servicesCount },
    { count: caseStudiesCount },
    { count: testimonialsCount },
    { count: unreadSubmissionsCount }
  ] = await Promise.all([
    supabase.from('services_cards').select('*', { count: 'exact', head: true }),
    supabase.from('case_studies').select('*', { count: 'exact', head: true }),
    supabase.from('testimonials').select('*', { count: 'exact', head: true }),
    supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('is_read', false),
  ])

  const { data: recentSubmissions } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('submitted_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: 'Total Services', value: servicesCount ?? 0, icon: Layers, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Case Studies', value: caseStudiesCount ?? 0, icon: Briefcase, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Testimonials', value: testimonialsCount ?? 0, icon: MessageSquare, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { label: 'Unread Messages', value: unreadSubmissionsCount ?? 0, icon: BellRing, color: 'text-amber-400', bg: 'bg-amber-400/10' }
  ]

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="glass-card relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
               <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${stat.bg.replace('/10', '')}`} />
               <div className="flex items-center justify-between mb-4">
                 <div className={`p-3 rounded-xl ${stat.bg}`}>
                   <Icon className={`w-6 h-6 ${stat.color}`} />
                 </div>
               </div>
               <div>
                 <h3 className="text-3xl font-black text-white tracking-tight">{stat.value}</h3>
                 <p className="text-sm font-medium text-white/50 mt-1">{stat.label}</p>
               </div>
            </div>
          )
        })}
      </div>

      <div className="glass-card mt-4 p-0 overflow-hidden">
        <h3 className="text-xl font-bold mb-4">Recent Submissions</h3>
        {recentSubmissions && recentSubmissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white border-opacity-10 opacity-70 text-sm">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map(sub => (
                   <tr key={sub.id} className="border-b border-white border-opacity-5">
                     <td className="py-3 font-medium">{sub.name}</td>
                     <td className="py-3">{sub.email}</td>
                     <td className="py-3 opacity-70 text-sm">{sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'N/A'}</td>
                     <td className="py-3">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${sub.is_read ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                           {sub.is_read ? 'Read' : 'New'}
                        </span>
                     </td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="opacity-50">No submissions found.</p>
        )}
      </div>
    </div>
  )
}
