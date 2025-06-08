"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Logo } from "@/lib/hooks/useLogo";
import { navigation } from "@/lib/constants/frontend";
import { UserButton, useUser } from "@clerk/nextjs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { isLoaded, isSignedIn, user } = useUser();
  const pathname = usePathname();

  if (!user) return null;

  const sidebarWidth = sidebarCollapsed ? "w-16" : "w-60";

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-card border-r transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <Logo />
            </div>
          )}

          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Desktop collapse/expand button */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center ${
                    sidebarCollapsed ? "justify-center px-2" : "space-x-3 px-3"
                  } py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }
                `}
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer with User Button and Notifications */}
        <div className="p-4 border-t">
          {/* Notifications */}
          <div
            className={`mb-3 ${sidebarCollapsed ? "flex justify-center" : ""}`}
          >
            <Button
              variant="ghost"
              size="sm"
              className={`relative ${
                sidebarCollapsed ? "w-8 h-8 p-0" : "w-full justify-start"
              }`}
              title={sidebarCollapsed ? "Notifications" : undefined}
            >
              <Bell className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Notifications</span>}
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                3
              </Badge>
            </Button>
          </div>

          {/* User Button */}
          <div
            className={`flex items-center gap-2 ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
          >
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />

            <AnimatePresence mode="wait">
              {!sidebarCollapsed && user && (
                <motion.span
                  key="username"
                  initial={{ opacity: 0, x: -10, width: 0 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    width: "auto",
                    transition: {
                      opacity: { delay: 0.5, duration: 0.5 },
                      x: { delay: 0.5, duration: 0.5 },
                      width: { delay: 0.5, duration: 0.5 },
                    },
                  }}
                  exit={{
                    opacity: 0,
                    x: -10,
                    width: 0,
                    transition: { duration: 0.1 },
                  }}
                  className="text-sm font-medium overflow-hidden whitespace-nowrap"
                >
                  {user.fullName || user.firstName}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile menu button - only visible on mobile */}
        <div className="lg:hidden bg-card h-12 flex items-center px-4 border-b ">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Main content area */}
        <ScrollArea className="flex-1 overflow-auto bg-background  ">
          {children}
        </ScrollArea>
      </div>
    </div>
  );
}
