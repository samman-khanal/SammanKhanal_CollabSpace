import { useEffect, useState, useCallback } from "react";
import adminService from "../../services/admin.service";
import type { ContactMessage } from "../../types/admin.types";
import Pagination from "./Pagination";
import { Mail, MailOpen, Trash2, Reply, X } from "lucide-react";
import { toast } from "sonner";
//* Function for contact inbox page
export default function ContactInboxPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  //* Function for fetch
  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.listContactMessages({
        page,
        isRead: filter || undefined
      });
      setMessages(res.messages);
      setTotal(res.total);
      setPages(res.pages);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);
  //* Function for this task
  useEffect(() => {
    fetch();
  }, [fetch]);
  //* Function for handle mark read
  const handleMarkRead = async (id: string) => {
    await adminService.markContactRead(id);
    fetch();
  };
  //* Function for handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await adminService.deleteContactMessage(id);
    toast.success("Message deleted");
    if (selected?._id === id) setSelected(null);
    fetch();
  };
  //* Function for handle reply
  const handleReply = async () => {
    if (!selected || !replyText.trim()) return;
    setReplying(true);
    try {
      await adminService.replyToContact(selected._id, replyText.trim());
      toast.success("Reply sent");
      setReplyText("");
      setSelected(null);
      fetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send reply");
    } finally {
      setReplying(false);
    }
  };
  //* Function for this task
  return <div className="space-y-6">
      {}
      <div className="flex items-center gap-3">
        <select value={filter} onChange={e => {
        setFilter(e.target.value);
        setPage(1);
      }} className="px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-600/80 bg-white dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/20 transition-all">
          
          <option value="">All Messages</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-lg bg-slate-100/50 dark:bg-slate-700/30">
          {total} total
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 admin-fade-up" style={{
        animationDelay: "100ms"
      }}>
          <div className="px-5 py-4 border-b border-slate-200/60 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/60 to-white dark:from-slate-700/30 dark:to-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">Messages</h2>
          </div>
          {loading ? <div className="flex items-center justify-center h-80">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin w-6 h-6 border-3 border-indigo-200 dark:border-indigo-700/30 border-t-indigo-600 rounded-full" />
                <p className="text-sm text-slate-400">Loading messages...</p>
              </div>
            </div> : <div className="divide-y divide-slate-100/60 dark:divide-slate-700/60 max-h-[calc(100vh-320px)] overflow-y-auto">
              {messages.map((msg, idx) => <div key={msg._id} onClick={() => {
            setSelected(msg);
            if (!msg.isRead) handleMarkRead(msg._id);
          }} className={`px-5 py-4 cursor-pointer transition-all duration-200 border-l-4 ${selected?._id === msg._id ? "bg-indigo-50/80 dark:bg-indigo-900/20 border-l-indigo-500" : "hover:bg-slate-50/60 dark:hover:bg-slate-700/40 border-l-transparent hover:border-l-indigo-300"}`} style={{
            animationDelay: `${idx * 30}ms`
          }}>
              
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="mt-1 shrink-0">
                        {msg.isRead ? <MailOpen className="w-4.5 h-4.5 text-slate-400" /> : <div className="w-4.5 h-4.5 rounded-full bg-indigo-500 flex items-center justify-center">
                            <Mail className="w-2.5 h-2.5 text-white" />
                          </div>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm truncate line-clamp-2 ${msg.isRead ? "text-slate-600 dark:text-slate-400" : "font-semibold text-slate-900 dark:text-white"}`}>
                          {msg.subject}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">{msg.name}</p>
                      </div>
                    </div>
                    <button onClick={e => {
                e.stopPropagation();
                handleDelete(msg._id);
              }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all shrink-0">
                  
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
                  </p>
                </div>)}
              {messages.length === 0 && <div className="px-5 py-12 text-center">
                  <Mail className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">No messages yet</p>
                </div>}
            </div>}
          <div className="px-5 py-3 border-t border-slate-100/60 dark:border-slate-700/50 bg-slate-50/40 dark:bg-slate-800/40">
            <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />
          </div>
        </div>

        {}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 admin-fade-up" style={{
        animationDelay: "200ms"
      }}>
          {selected ? <div className="flex flex-col h-full">
              <div className="px-6 py-5 border-b border-slate-200/60 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/60 to-white dark:from-slate-700/30 dark:to-slate-800 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate flex-1">
                      {selected.subject}
                    </h3>
                    <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all shrink-0">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {selected.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selected.email}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {new Date(selected.createdAt).toLocaleDateString()} at {new Date(selected.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-700/30 dark:to-slate-800/20 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap border border-slate-200/60 dark:border-slate-700/50">
                  {selected.message}
                </div>
              </div>
              
              <div className="px-6 py-5 border-t border-slate-200/60 dark:border-slate-700/50 bg-slate-50/40 dark:bg-slate-800/40 space-y-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-2">
                    <Reply className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Reply via Email
                  </label>
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={4} placeholder="Type your reply…" className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-600/80 bg-white dark:bg-slate-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/20 transition-all placeholder-slate-400 dark:placeholder-slate-500" />
                
                </div>
                <button onClick={handleReply} disabled={!replyText.trim() || replying} className="w-full px-5 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2">
                
                  <Reply className="w-4 h-4" />
                  {replying ? "Sending…" : "Send Reply"}
                </button>
              </div>
            </div> : <div className="flex items-center justify-center h-96">
              <div className="flex flex-col items-center gap-3 text-center">
                <Mail className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Select a message to read</p>
              </div>
            </div>}
        </div>
      </div>
    </div>;
}