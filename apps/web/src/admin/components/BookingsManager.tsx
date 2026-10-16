import React from 'react';
import { AdminBooking } from '../types';
import { Calendar, Clock, Video, User, Mail, Phone, FileText } from 'lucide-react';

interface BookingsManagerProps {
  bookings: AdminBooking[];
}

export const BookingsManager: React.FC<BookingsManagerProps> = ({ bookings }) => {
  return (
    <div className="space-y-6">
      <div className="bg-[#111216] p-4 rounded-xl border border-white/10">
        <h2 className="text-lg font-medium text-white font-display">
          Consultation Bookings ({bookings.length})
        </h2>
        <p className="text-xs text-white/50">
          Scheduled 30-minute creative strategy video calls booked through the Studio Project Scheduler.
        </p>
      </div>

      <div className="space-y-3">
        {bookings.length === 0 ? (
          <div className="text-center py-12 bg-[#111216] rounded-xl border border-white/10 text-white/40 text-xs font-mono">
            No consultations booked yet.
          </div>
        ) : (
          bookings.map((item) => (
            <div
              key={item.id}
              className="bg-[#111216] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                    <Video className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">{item.serviceName}</h3>
                    <div className="flex items-center gap-2 text-xs text-white/50 font-mono mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.date}</span>
                      <span>·</span>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>

                <span className="self-start sm:self-auto text-[10px] font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                  {item.status}
                </span>
              </div>

              {/* Client Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white/[0.02] p-3 rounded-lg border border-white/5">
                <div className="flex items-center gap-2 text-white/80">
                  <User className="w-3.5 h-3.5 text-white/40" />
                  <span>{item.name}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Mail className="w-3.5 h-3.5 text-white/40" />
                  <a href={`mailto:${item.email}`} className="hover:underline">{item.email}</a>
                </div>
                {item.phone && (
                  <div className="flex items-center gap-2 text-white/80">
                    <Phone className="w-3.5 h-3.5 text-white/40" />
                    <span>{item.phone}</span>
                  </div>
                )}
              </div>

              {item.notes && (
                <div className="text-xs text-white/60 bg-white/[0.01] p-3 rounded border border-white/5 flex items-start gap-2">
                  <FileText className="w-3.5 h-3.5 text-white/40 shrink-0 mt-0.5" />
                  <span className="italic">“{item.notes}”</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
