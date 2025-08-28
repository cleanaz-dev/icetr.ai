"use client";

import React, { useState } from "react";
import { Save, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import BookingSchedule from "./BookingSchedule";

const HapioInterface = () => {
  const [activeTab, setActiveTab] = useState("info");
  const [bookingInfo, setBookingInfo] = useState({
    resourceName: "AI Sales Agent",
    service: "Consultation Call",
    location: "Zoom Meeting",
    duration: 30,
  });

  const [schedule, setSchedule] = useState({
    timezone: "America/New_York",
    days: {
      monday: { enabled: true, slots: ["09:00-17:00"] },
      tuesday: { enabled: true, slots: ["09:00-17:00"] },
      wednesday: { enabled: true, slots: ["09:00-17:00"] },
      thursday: { enabled: true, slots: ["09:00-17:00"] },
      friday: { enabled: true, slots: ["09:00-17:00"] },
      saturday: { enabled: false, slots: [] },
      sunday: { enabled: false, slots: [] },
    },
  });

  const updateBookingInfo = (field, value) => {
    setBookingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDay = (day) => {
    setSchedule((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day],
          enabled: !prev.days[day].enabled,
        },
      },
    }));
  };

  const updateDaySlots = (day, slots) => {
    setSchedule((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day],
          slots: slots.split(",").map((slot) => slot.trim()),
        },
      },
    }));
  };

  const saveConfiguration = () => {
    console.log("Saving configuration:", { bookingInfo, schedule });
    // TODO: Save to API
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="info">Booking Info</TabsTrigger>
          <TabsTrigger value="schedule">Booking Schedule</TabsTrigger>
        </TabsList>

        {/* Booking Info Tab */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
              <CardDescription>
                Configure your basic booking settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="resource-name">Resource Name</Label>
                  <Input
                    id="resource-name"
                    value={bookingInfo.resourceName}
                    onChange={(e) =>
                      updateBookingInfo("resourceName", e.target.value)
                    }
                    placeholder="e.g., AI Sales Agent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service">Service Type</Label>
                  <Input
                    id="service"
                    value={bookingInfo.service}
                    onChange={(e) =>
                      updateBookingInfo("service", e.target.value)
                    }
                    placeholder="e.g., Consultation Call"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={bookingInfo.location}
                    onChange={(e) =>
                      updateBookingInfo("location", e.target.value)
                    }
                    placeholder="e.g., Zoom Meeting"
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={bookingInfo.duration}
                    onChange={(e) =>
                      updateBookingInfo("duration", parseInt(e.target.value))
                    }
                    placeholder="30"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Schedule Tab */}
        <TabsContent value="schedule">
          <BookingSchedule onScheduleChange={setSchedule} />
        </TabsContent>
      </Tabs>

      <Button onClick={saveConfiguration} className="w-full">
        <Save className="w-4 h-4 mr-2" />
        Save Configuration
      </Button>
    </div>
  );
};

export default HapioInterface;
