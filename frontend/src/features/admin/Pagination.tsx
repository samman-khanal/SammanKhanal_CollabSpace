interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  onPageChange: (page: number) => void;
}
//* Function for pagination
export default function Pagination({
  page,
  pages,
  total,
  onPageChange
}: PaginationProps) {
  if (pages <= 1) return null;
  //* Function for this task
  return <div className="flex items-center justify-between mt-5 text-sm text-slate-600 dark:text-slate-400">
      <span className="text-[12px] font-medium text-slate-400">{total} total</span>
      <div className="flex items-center gap-2">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="px-4 py-2 rounded-xl border border-slate-200/80 dark:border-slate-600/80 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 hover:border-indigo-200 dark:hover:border-indigo-800/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 text-[13px] font-medium">
          
          Prev
        </button>
        <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[13px] font-semibold min-w-16 text-center">
          {page} / {pages}
        </span>
        <button onClick={() => onPageChange(page + 1)} disabled={page >= pages} className="px-4 py-2 rounded-xl border border-slate-200/80 dark:border-slate-600/80 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 hover:border-indigo-200 dark:hover:border-indigo-800/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 text-[13px] font-medium">
          
          Next
        </button>
      </div>
    </div>;
}