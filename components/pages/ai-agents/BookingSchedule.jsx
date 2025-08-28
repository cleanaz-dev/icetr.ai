'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function BookingSchedule({ onScheduleChange }) {
  const [schedule, setSchedule] = useState({
    timezone: 'America/New_York',
    days: {
      monday: { enabled: true, slots: ['09:00-17:00'] },
      tuesday: { enabled: true, slots: ['09:00-17:00'] },
      wednesday: { enabled: true, slots: ['09:00-17:00'] },
      thursday: { enabled: true, slots: ['09:00-17:00'] },
      friday: { enabled: true, slots: ['09:00-17:00'] },
      saturday: { enabled: false, slots: [] },
      sunday: { enabled: false, slots: [] }
    }
  });

  const toggleDay = (day) => {
    setSchedule(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day],
          enabled: !prev.days[day].enabled
        }
      }
    }));
  };

  const updateDaySlots = (day, slots) => {
    setSchedule(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day],
          slots: slots.split(',').map(slot => slot.trim())
        }
      }
    }));
  };

  const handleTimezoneChange = (e) => {
    setSchedule(prev => ({ ...prev, timezone: e.target.value }));
  };

  // Call the parent component's function to update the schedule
  const handleSaveSchedule = () => {
    onScheduleChange(schedule);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Schedule</CardTitle>
        <CardDescription>Set your availability for bookings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            value={schedule.timezone}
            onChange={handleTimezoneChange}
            placeholder="America/New_York"
          />
        </div>

        <div className="space-y-4">
          <Label>Weekly Availability</Label>
          {Object.entries(schedule.days).map(([day, config]) => (
            <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Switch
                  checked={config.enabled}
                  onCheckedChange={() => toggleDay(day)}
                />
                <span className="capitalize font-medium">{day}</span>
              </div>
              
              {config.enabled && (
                <div className="flex-1 max-w-md">
                  <Input
                    value={config.slots.join(', ')}
                    onChange={(e) => updateDaySlots(day, e.target.value)}
                    placeholder="09:00-12:00, 13:00-17:00"
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Comma-separated time blocks (e.g., 09:00-12:00, 13:00-17:00)
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}