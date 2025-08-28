"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Calendar, Award, MessageCircle } from "lucide-react";
import { RefreshCw } from "lucide-react";
import { getBroadcastConfig } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";

export default function TeamUpdates({ announcements }) {
  return (
    <Card className="min-h-[400px] hover:border-primary transition-all duration-300">
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          Team Updates
        </CardTitle>

        <Button
          size="sm"
          variant="menu"
          className="absolute  right-4 group"
          aria-label="Refresh updates"
        >
          <RefreshCw className="size-4 group-hover:rotate-180 transition-all duration-300 text-muted-foreground group-hover:text-primary" />
        </Button>

        <CardDescription>
          The amazing people you work with every day
        </CardDescription>
      </CardHeader>

      <Separator />
      <CardContent className="space-y-3">
        {announcements.map((announcement) => {
          const config = getBroadcastConfig(announcement.type);
          const Icon = config.icon;
          return (
            <div
              key={announcement.id}
              className="p-3 rounded-lg border bg-background"
            >
              <div className="flex items-start gap-2">
                <div className="mt-1">
                  <Icon className={`w-4 h-4 ${config.iconColor}`} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className={`font-medium  ${config.decoration}`}>
                      {announcement.title}
                    </h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {formatDistanceToNow(new Date(announcement.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {announcement.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
