// components/layout/RoleBasedDashboardLayout.js
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { Logo } from "@/lib/hooks/useLogo";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import NotificationsDialog from "./NotificationsDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePermissionContext } from "@/context/PermissionProvider";
import { getPermissionBasedNavigation } from "@/lib/config/navigation";
import SignOutButton from "./SignOutButton";

export default function RoleBasedDashboardLayout({
  children,
  imageUrl,
  notifications,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();

  const { role, permissions } = usePermissionContext();


  // Handle client-side mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get filtered navigation based on user role
  const filteredNavigation = getPermissionBasedNavigation(permissions);
  const sidebarWidth = sidebarCollapsed ? "w-16" : "w-60";

  // Show loading state while Clerk is loading or component hasn't mounted
  if (!mounted || !isLoaded || !role) {
    return null;
  }

  // If user is not signed in, this shouldn't happen due to layout auth check
  // but keeping as safety net
  if (!isSignedIn) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p>Authentication required</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background relative">
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
    fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-card transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col border-r border-muted/50
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
    shadow-lg shadow-black/10
  `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 ">
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
        <nav className="p-4 space-y-2 flex-shrink-0">
          {filteredNavigation.map((item) => {
            const isDialer = item.href === "/dialer";
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
          flex items-center ${
            sidebarCollapsed ? "justify-center px-2" : "space-x-3 px-3"
          } py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${
            isActive && !isDialer
              ? "bg-primary text-primary-foreground shadow-sm"
              : !isActive
              ? "text-muted-foreground hover:text-foreground hover:bg-muted"
              : ""
          }
          ${
            isDialer && isActive
              ? "bg-gradient-to-br from-primary/80 via-primary/50 to-primary/40 text-primary-foreground shadow-sm"
              : ""
          }
          ${
            isDialer && !isActive
              ? "bg-gradient-to-br from-muted/50 via-muted/30 to-transparent border-blue-200/50 text-blue-700"
              : ""
          }
          ${
            isDialer
              ? "relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
              : ""
          }
        `}
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={`h-4 w-4 flex-shrink-0 ${
                    isDialer ? "text-primary" : ""
                  } ${isDialer && isActive ? "text-primary-foreground" : ""}`}
                />
                {!sidebarCollapsed && (
                  <span className={isDialer ? "font-semibold" : ""}>
                    {item.name}
                  </span>
                )}
                {isDialer && !sidebarCollapsed && (
                  <div className="ml-auto">
                    <div
                      className={`w-2 h-2 rounded-full animate-pulse ${
                        isActive ? "bg-primary-foreground" : "bg-primary"
                      }`}
                    ></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
        {/* Spacer pushes the footer to the bottom */}
        <div className="flex-1" />

        {/* Sidebar Footer with User Button and Notifications */}
        <div className="flex flex-col gap-4 p-4 border-t border-muted ">
          {/* Notifications */}
          <NotificationsDialog
            sidebarCollapsed={sidebarCollapsed}
            notifications={notifications}
          />

          {/* User Button */}
          <div
            className={`flex items-center gap-2 ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="relative w-8 h-8">
              <Avatar className="w-8 h-8 absolute z-10">
                <AvatarImage src={imageUrl} alt="User Avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>

              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "opacity-0 w-8 h-8 absolute z-20", // Hide default avatar
                  },
                }}
              />
            </div>

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

          <SignOutButton
            isHovering={isHovering}
            setIsHovering={setIsHovering}
            showDialog={showDialog}
            setShowDialog={setShowDialog}
            sidebarCollapsed={sidebarCollapsed}
            signOut={signOut}
            useRef={useRef}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile menu button - only visible on mobile */}
        <div className="lg:hidden bg-card h-12 flex items-center px-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 overflow-auto">{children}</ScrollArea>
        </div>
      </div>
      {showDialog && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40 pointer-events-none" />
      )}
    </div>
  );
}
