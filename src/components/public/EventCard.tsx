import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Ticket, Star } from 'lucide-react';
import type { EventItem } from '../../types/campuslink';

interface EventCardProps {
  event: EventItem;
  onRegisterClick: (event: EventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onRegisterClick }) => {
  const [expanded, setExpanded] = useState(false);
  const capacityPct = Math.round((event.registeredCount / event.maxCapacity) * 100);

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#121620]/90 p-4 sm:p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-indigo-500/10">
      
      {/* Event Header Image */}
      <div className="relative mb-4 h-44 w-full overflow-hidden rounded-xl bg-gray-900">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121620] via-transparent to-black/40" />

        {/* Category Pill */}
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-indigo-600/90 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md shadow-md">
            {event.category}
          </span>
          {event.featured && (
            <span className="rounded-full bg-pink-600/90 px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur-md flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" /> FLAGSHIP
            </span>
          )}
        </div>

        {/* Fee Badge */}
        <div className="absolute right-3 top-3">
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold shadow-md ${
            event.fee === 0 
              ? 'bg-emerald-500/90 text-white' 
              : 'bg-amber-500/90 text-white'
          }`}>
            {event.fee === 0 ? 'FREE ENTRY' : `₹${event.fee}`}
          </span>
        </div>

        {/* Status Indicator */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-gray-200">
          <span className="flex items-center gap-1.5 font-medium backdrop-blur-md bg-black/50 px-2.5 py-1 rounded-md border border-white/10">
            <span className={`h-2 w-2 rounded-full ${
              event.status === 'Filling Fast' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
            }`} />
            {event.status}
          </span>

          <span className="text-[11px] font-mono backdrop-blur-md bg-black/50 px-2 py-0.5 rounded border border-white/10">
            {event.registeredCount}/{event.maxCapacity} Seats
          </span>
        </div>
      </div>

      {/* Title & Short Description */}
      <div className="space-y-2 mb-3">
        <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white group-hover:text-blue-400 transition-colors">
          {event.title}
        </h3>
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
          {expanded ? event.description : event.shortDescription}
        </p>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] text-indigo-400 hover:underline font-semibold cursor-pointer"
        >
          {expanded ? 'Show Less' : 'Read Full Description →'}
        </button>
      </div>

      {/* Event Details Grid */}
      <div className="mt-2 space-y-1.5 rounded-xl bg-white/5 p-3 text-xs text-gray-300 border border-white/5 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
          <span>{event.date}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-pink-400 shrink-0" />
          <span>{event.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{event.venue}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {event.tags?.map((tag: string, idx: number) => (
          <span key={idx} className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-gray-400 border border-white/5">
            #{tag}
          </span>
        ))}
      </div>

      {/* Seat Bar */}
      <div className="mb-4 space-y-1">
        <div className="flex justify-between text-[10px] text-gray-400 font-mono">
          <span>Capacity Filled</span>
          <span>{capacityPct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              capacityPct > 80 ? 'bg-amber-500' : 'bg-emerald-400'
            }`}
            style={{ width: `${capacityPct}%` }}
          />
        </div>
      </div>

      {/* Footer Action Button */}
      <button
        onClick={() => onRegisterClick(event)}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
      >
        <Ticket className="h-4 w-4" />
        <span>Register & Get Pass</span>
      </button>

    </div>
  );
};
