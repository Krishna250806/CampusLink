import React, { useState } from 'react';
import { Clock, MapPin, Ticket, ChevronRight, Award } from 'lucide-react';
import type { EventItem } from '../../types/campuslink';

interface ScheduleTimelineProps {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
}

export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({ events, onSelectEvent }) => {
  const [selectedDay, setSelectedDay] = useState<'Day 1' | 'Day 2' | 'Day 3'>('Day 1');

  const days = [
    { id: 'Day 1', label: 'Day 1 (Sept 12)', subtitle: 'Hackathon Kickoff & Coding' },
    { id: 'Day 2', label: 'Day 2 (Sept 13)', subtitle: 'RoboWars & AI Workshops' },
    { id: 'Day 3', label: 'Day 3 (Sept 14)', subtitle: 'Valorant Finals & Closing Ceremony' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Day Selector Tabs */}
      <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
        {days.map((day) => (
          <button
            key={day.id}
            onClick={() => setSelectedDay(day.id as any)}
            className={`flex-1 rounded-lg py-3 px-3 text-center transition-all cursor-pointer ${
              selectedDay === day.id
                ? 'bg-indigo-600 text-white font-bold shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="text-sm font-['Space_Grotesk']">{day.label}</div>
            <div className="text-[10px] opacity-80 hidden sm:block font-normal mt-0.5">{day.subtitle}</div>
          </button>
        ))}
      </div>

      {/* Timeline Items */}
      <div className="relative border-l-2 border-indigo-500/30 ml-4 pl-6 space-y-6">
        {events.map((evt) => (
          <div key={evt.id} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-indigo-500 bg-[#0a0c10] group-hover:bg-indigo-500 group-hover:scale-125 transition-all" />

            {/* Event Block */}
            <div className="rounded-xl border border-white/10 bg-[#121620] p-4 sm:p-5 shadow-lg hover:border-indigo-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{evt.time}</span>
                  <span>•</span>
                  <span className="text-gray-400">{evt.category}</span>
                </div>

                <h4 className="text-base font-bold text-white font-['Space_Grotesk'] group-hover:text-indigo-300 transition-colors">
                  {evt.title}
                </h4>

                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-pink-400" />
                    {evt.venue}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <Award className="h-3 w-3" />
                    {evt.fee === 0 ? 'Free' : `₹${evt.fee}`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onSelectEvent(evt)}
                className="self-start md:self-center flex items-center gap-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 px-3.5 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all shrink-0"
              >
                <Ticket className="h-3.5 w-3.5" />
                <span>Get Ticket</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
