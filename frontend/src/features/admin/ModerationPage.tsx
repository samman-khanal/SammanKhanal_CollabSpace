import { useEffect, useState, useCallback } from "react";
import adminService from "../../services/admin.service";
import type { AdminMessage, AdminComment, AdminAttachment, AdminChannel } from "../../types/admin.types";
import Pagination from "./Pagination";
import { Trash2, MessageSquare, FileText, Hash, Paperclip } from "lucide-react";
import { toast } from "sonner";
type Tab = "messages" | "comments" | "attachments" | "channels";
//* Function for moderation page
export default function ModerationPage() {
  const [tab, setTab] = useState<Tab>("messages");
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [msgPage, setMsgPage] = useState(1);
  const [msgPages, setMsgPages] = useState(1);
  const [msgTotal, setMsgTotal] = useState(0);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [cmtPage, setCmtPage] = useState(1);
  const [cmtPages, setCmtPages] = useState(1);
  const [cmtTotal, setCmtTotal] = useState(0);
  const [attachments, setAttachments] = useState<AdminAttachment[]>([]);
  const [attPage, setAttPage] = useState(1);
  const [attPages, setAttPages] = useState(1);
  const [attTotal, setAttTotal] = useState(0);
  const [channels, setChannels] = useState<AdminChannel[]>([]);
  const [chPage, setChPage] = useState(1);
  const [chPages, setChPages] = useState(1);
  const [chTotal, setChTotal] = useState(0);
  //* Function for fetch messages
  const fetchMessages = useCallback(async () => {
    const res = await adminService.listMessages({
      page: msgPage
    });
    setMessages(res.messages);
    setMsgPages(res.pages);
    setMsgTotal(res.total);
  }, [msgPage]);
  //* Function for fetch comments
  const fetchComments = useCallback(async () => {
    const res = await adminService.listComments({
      page: cmtPage
    });
    setComments(res.comments);
    setCmtPages(res.pages);
    setCmtTotal(res.total);
  }, [cmtPage]);
  //* Function for fetch attachments
  const fetchAttachments = useCallback(async () => {
    const res = await adminService.listAttachments({
      page: attPage
    });
    setAttachments(res.attachments);
    setAttPages(res.pages);
    setAttTotal(res.total);
  }, [attPage]);
  //* Function for fetch channels
  const fetchChannels = useCallback(async () => {
    const res = await adminService.listChannels({
      page: chPage
    });
    setChannels(res.channels);
    setChPages(res.pages);
    setChTotal(res.total);
  }, [chPage]);
  //* Function for this task
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);
  //* Function for this task
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);
  //* Function for this task
  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);
  //* Function for this task
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);
  //* Function for handle delete message
  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Remove this message?")) return;
    await adminService.deleteMessage(id);
    toast.success("Message removed");
    fetchMessages();
  };
  //* Function for handle delete comment
  const handleDeleteComment = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    await adminService.deleteComment(id);
    toast.success("Comment deleted");
    fetchComments();
  };
  //* Function for handle delete channel
  const handleDeleteChannel = async (id: string) => {
    if (!confirm("Delete this channel and all its messages?")) return;
    await adminService.deleteChannel(id);
    toast.success("Channel deleted");
    fetchChannels();
  };
  const tabs: {
    key: Tab;
    label: string;
    icon: typeof MessageSquare;
  }[] = [{
    key: "messages",
    label: "Messages",
    icon: MessageSquare
  }, {
    key: "comments",
    label: "Comments",
    icon: FileText
  }, {
    key: "attachments",
    label: "Attachments",
    icon: Paperclip
  }, {
    key: "channels",
    label: "Channels",
    icon: Hash
  }];
  //* Function for this task
  return <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm admin-fade-up">
        {}
        <div className="flex border-b border-slate-200/60 dark:border-slate-700/60">
          {tabs.map(({
          key,
          label,
          icon: Icon
        }) => <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all duration-200 ${tab === key ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/10" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/20"}`}>
            
              <Icon className="w-4 h-4" />
              {label}
            </button>)}
        </div>

        {}
        {tab === "messages" && <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-linear-to-r from-slate-50 to-slate-100/80 dark:from-slate-700/60 dark:to-slate-700/30 text-left">
                  <tr>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Sender</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Content</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Channel</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Date</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 dark:divide-slate-700/60">
                  {messages.map((m, idx) => <tr key={m._id} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors duration-200 admin-row-in" style={{
                animationDelay: `${idx * 30}ms`
              }}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 dark:text-white">{m.sender?.fullName}</p>
                        <p className="text-xs text-slate-500">{m.sender?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-75 truncate">
                        {m.content || <span className="italic text-slate-400">[attachment only]</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{m.channel?.name || "DM"}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDeleteMessage(m._id)} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-all duration-200" title="Remove message">
                      
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>)}
                  {messages.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No messages</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-3">
              <Pagination page={msgPage} pages={msgPages} total={msgTotal} onPageChange={setMsgPage} />
            </div>
          </>}

        {}
        {tab === "comments" && <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-linear-to-r from-slate-50 to-slate-100/80 dark:from-slate-700/60 dark:to-slate-700/30 text-left">
                  <tr>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Author</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Comment</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Task</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Date</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 dark:divide-slate-700/60">
                  {comments.map((c, idx) => <tr key={c._id} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors duration-200 admin-row-in" style={{
                animationDelay: `${idx * 30}ms`
              }}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 dark:text-white">{c.author?.fullName}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-75 truncate">{c.text}</td>
                      <td className="px-4 py-3 text-slate-500">{c.task?.title || "—"}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDeleteComment(c._id)} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-all duration-200">
                      
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>)}
                  {comments.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No comments</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-3">
              <Pagination page={cmtPage} pages={cmtPages} total={cmtTotal} onPageChange={setCmtPage} />
            </div>
          </>}

        {}
        {tab === "attachments" && <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-linear-to-r from-slate-50 to-slate-100/80 dark:from-slate-700/60 dark:to-slate-700/30 text-left">
                  <tr>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">File</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Uploader</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Task</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Size</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 dark:divide-slate-700/60">
                  {attachments.map((a, idx) => <tr key={a._id} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors duration-200 admin-row-in" style={{
                animationDelay: `${idx * 30}ms`
              }}>
                      <td className="px-4 py-3">
                        <a href={a.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-medium">
                          {a.fileName}
                        </a>
                        <p className="text-xs text-slate-400">{a.mimeType}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{a.uploadedBy?.fullName}</td>
                      <td className="px-4 py-3 text-slate-500">{a.task?.title || "—"}</td>
                      <td className="px-4 py-3 text-slate-500">{(a.size / 1024).toFixed(1)} KB</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                    </tr>)}
                  {attachments.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No attachments</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-3">
              <Pagination page={attPage} pages={attPages} total={attTotal} onPageChange={setAttPage} />
            </div>
          </>}

        {}
        {tab === "channels" && <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-linear-to-r from-slate-50 to-slate-100/80 dark:from-slate-700/60 dark:to-slate-700/30 text-left">
                  <tr>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Channel</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Workspace</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Type</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Created By</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Date</th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500/80">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 dark:divide-slate-700/60">
                  {channels.map((ch, idx) => <tr key={ch._id} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors duration-200 admin-row-in" style={{
                animationDelay: `${idx * 30}ms`
              }}>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">#{ch.name}</td>
                      <td className="px-4 py-3 text-slate-500">{ch.workspace?.name || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ch.type === "private" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
                          {ch.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{ch.createdBy?.fullName}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(ch.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDeleteChannel(ch._id)} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-all duration-200">
                      
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>)}
                  {channels.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No channels</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-3">
              <Pagination page={chPage} pages={chPages} total={chTotal} onPageChange={setChPage} />
            </div>
          </>}
      </div>
    </div>;
}