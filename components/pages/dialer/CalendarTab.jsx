import React from 'react';
import { InlineWidget } from 'react-calendly';
import { Calendar, User } from 'lucide-react';

export default function CalendarTab({lead}) {


if(!lead) {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-gray-50 ">
      <Calendar className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Lead Selected</h3>
      <p className="text-gray-500 text-center">
        Choose a lead from the list to schedule a meeting
      </p>
    </div>
  );
}
  return (
    <div style={{ minWidth: '320px', height: '700px' }}>
      <InlineWidget
        url="https://calendly.com/llmgem-info"
        styles={{
          height: '80%',
          width: '100%',
        }}
        prefill={{
          name: lead.name || "name",  
          email: lead.email || "email", 
          
        }}
      />
    </div>
  );
}