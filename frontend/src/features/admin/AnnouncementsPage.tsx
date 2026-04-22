import { useState } from "react";
import adminService from "../../services/admin.service";
import { Send, Bell, Users } from "lucide-react";
import { toast } from "sonner";
//* Function for announcements page
export default function AnnouncementsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<{
    title: string;
    message: string;
    sentAt: string;
  }[]>([]);
  //* Function for handle send
  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    setSending(true);
    try {
      const res = await adminService.broadcastNotification(title.trim(), message.trim());
      toast.success(`Notification sent to ${res.recipientCount} users`);
      //* Function for handle send
      setHistory(prev => [{
        title: title.trim(),
        message: message.trim(),
        sentAt: new Date().toISOString()
      }, ...prev]);
      setTitle("");
      setMessage("");
    } catch {
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };
  //* Function for this task
  return <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden admin-fade-up">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Compose Announcement</p>
              <p className="text-[11px] text-slate-400">Broadcast to all platform users</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Scheduled Maintenance" className="w-full rounded-xl border border-slate-200/80 dark:border-slate-600/80 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent outline-none transition-all" />
              
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={6} placeholder="Write your announcement message here..." className="w-full rounded-xl border border-slate-200/80 dark:border-slate-600/80 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent outline-none resize-none transition-all" />
              
            </div>

            <button onClick={handleSend} disabled={sending || !title.trim() || !message.trim()} className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors">
              
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : "Send to All Users"}
            </button>
          </div>
        </div>

        {}
        <div className="space-y-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/15 rounded-2xl border border-indigo-200 dark:border-indigo-800/40 p-5 admin-fade-up" style={{
          animationDelay: "100ms"
        }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 dark:bg-indigo-800/30 dark:border-indigo-700/40 flex items-center justify-center">
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-indigo-800 dark:text-indigo-300">How it works</h4>
            </div>
            <ul className="text-sm text-indigo-700 dark:text-indigo-400 space-y-2.5">
              <li>• Sent to <strong>all registered users</strong></li>
              <li>• Delivered in real-time via push notification</li>
              <li>• Also stored in each user's notification inbox</li>
              <li>• Users receive a "system_announcement" notification type</li>
            </ul>
          </div>
        </div>
      </div>

      {}
      {history.length > 0 && <div className="mt-8">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Sent this session</h3>
          <div className="space-y-3">
            {history.map((h, i) => <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 p-4 shadow-sm admin-fade-up" style={{
          animationDelay: `${i * 60}ms`
        }}>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-slate-900 dark:text-white">{h.title}</h4>
                  <span className="text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-full">{new Date(h.sentAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{h.message}</p>
              </div>)}
          </div>
        </div>}
    </div>;
}