import React, { useState } from 'react';
import { useCampusLink } from '../../context/CampusLinkContext';
import { Users, UserPlus, CheckCircle2, Mail } from 'lucide-react';

export const TeamTab: React.FC = () => {
  const { activeCommittee } = useCampusLink();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor'>('admin');
  const [invited, setInvited] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInvited(true);
    setTimeout(() => {
      setInvited(false);
      setInviteEmail('');
    }, 2500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold font-heading text-slate-100">Team Management</h2>
        <p className="text-xs text-slate-400">Invite committee co-organizers and manage role permissions (Owner, Admin, Editor).</p>
      </div>

      {/* Invite Co-Organizer Box */}
      <form onSubmit={handleInvite} className="p-6 bg-neutral-900 border border-white/10 rounded-3xl space-y-4 shadow-xl">
        <h3 className="text-sm font-bold font-heading text-slate-200 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-zinc-300" /> Invite Team Member
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Student Email Address</label>
            <input
              type="email"
              required
              placeholder="co-organizer@campus.edu"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs text-slate-100 focus:border-zinc-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Role Permission</label>
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs text-slate-200"
            >
              <option value="admin">Admin (Full Access)</option>
              <option value="editor">Editor (Content Only)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-[inset_0_2px_0_0_rgba(255,255,255,1)] transition-all active:scale-95 cursor-pointer"
          >
            {invited ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Mail className="w-4 h-4 text-neutral-950" />}
            {invited ? 'Invitation Sent!' : 'Send Team Invite'}
          </button>
        </div>
      </form>

      {/* Member List */}
      <div className="p-6 bg-neutral-900 border border-white/10 rounded-3xl space-y-4 shadow-xl">
        <h3 className="text-base font-bold font-heading text-slate-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-zinc-300" /> Active Committee Members ({activeCommittee.members.length})
        </h3>

        <div className="space-y-3">
          {activeCommittee.members.map(member => (
            <div key={member.id} className="p-4 bg-neutral-950 border border-white/10 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-neutral-800 text-white font-bold flex items-center justify-center text-xs border border-white/10">
                    {member.name ? member.name[0] : 'U'}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{member.name || 'Invited Member'}</h4>
                  <p className="text-xs font-mono text-slate-400">{member.email}</p>
                </div>
              </div>

              <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${
                member.role === 'owner'
                  ? 'bg-zinc-100 text-neutral-950 border-white/20'
                  : member.role === 'admin'
                  ? 'bg-white/10 text-white border-white/15'
                  : 'bg-neutral-800 text-slate-400 border-white/10'
              }`}>
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
