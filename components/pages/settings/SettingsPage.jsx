import { Building, Users, Settings, Cog, Settings2 } from "lucide-react";
import OrgTab from "./OrgTab";
import AccountTab from "./AccountTab";
import UsersTab from "./UsersTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SimpleIntegrationsTab from "./SimpleIntegrationsTab";

export default function SettingsPage({ settings }) {

  return (
    <div className=" max-w-7xl px-4 py-6">
      <header className="flex justify-between items-center px-4 mb-6">
        <div className="flex items-center space-x-3">
          <Cog className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
      </header>

      <Tabs defaultValue="organization" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            <span className="cursor-pointer">Organization</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="cursor-pointer">My Account</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            <span className="cursor-pointer">Intregrations</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="cursor-pointer">Users</span>
          </TabsTrigger>
        </TabsList>

        {/* Organization Settings */}
        <OrgTab organization={settings.organization} />

        {/* User Account Settings */}
        <AccountTab settings={settings} />

        {/* Org Integrations Page */}
        <SimpleIntegrationsTab
          orgId={settings.organization.id}
          integrationData={settings.organization.orgIntegrations}
        />

        {/* Users Management */}
        <UsersTab settings={settings} />
      </Tabs>
    </div>
  );
}
