import React, { useState } from 'react';
import { AdminInquiry } from '../types';
import { adminApi } from '../services/adminApi';
import { Mail, CheckCircle2, Clock } from 'lucide-react';

interface InquiriesInboxProps {
  inquiries: AdminInquiry[];
  onRefresh: () => void;
}

export const InquiriesInbox: React.FC<InquiriesInboxProps> = ({ inquiries, onRefresh }) => {
  const [filter, setFilter] = useState<'all' | 'new' | 'reviewed'>('all');

  const handleStatusChange = async (id: string, status: 'new' | 'reviewed' | 'archived') => {
    try {
      await adminApi.updateInquiryStatus(id, status);
      onRefresh();
    } catch (error) {
      window.alert((error as Error).message);
    }
  };

  const filtered = filter === 'all' ? inquiries : inquiries.filter((i) => i.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111216] p-4 rounded-xl border border-white/10">
        <div>
          <h2 className="text-lg font-medium text-white font-display">
            Inquiries & Contact Inbox ({inquiries.length})
          </h2>
          <p className="text-xs text-white/50">
            Client messages submitted via the Connect With Us public contact dialog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'new', 'reviewed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-colors cursor-pointer ${
                filter === tab
                  ? 'bg-white text-black font-semibold'
                  : 'bg-white/5 text-white/50 hover:text-white border border-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-[#111216] rounded-xl border border-white/10 text-white/40 text-xs font-mono">
            No inquiries match the current filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#111216] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-mono">
                    {item.name[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">{item.name}</h3>
                    <a
                      href={`mailto:${item.email}`}
                      className="text-xs text-white/50 hover:text-white font-mono transition-colors"
                    >
                      {item.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${
                      item.status === 'new'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-[10px] text-white/30 font-mono">
                    {new Date(item.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-white/80 leading-relaxed font-light pl-11">
                “{item.message}”
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                {item.status === 'new' ? (
                  <button
                    onClick={() => handleStatusChange(item.id, 'reviewed')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Reviewed</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(item.id, 'new')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Mark as New</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
