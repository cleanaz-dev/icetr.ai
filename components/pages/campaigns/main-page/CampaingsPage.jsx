"use client";
import { Trophy } from "lucide-react";
import React, { useState } from "react";
import CampaignStatsCard from "../CampaignStatsCard";
import { toast } from "sonner";
import CampaignsTable from "../CampaignsTable";
import EditCampaignDialog from "../dialogs/EditCampaignDialogs";
import StartPauseCampaignDialog from "../dialogs/StartPauseCampaignDialog";
import DeleteCampaignDialog from "../DeleteCampaignDialog";
import PageHeader from "@/components/ui/layout/PageHeader";
import { useTeamContext } from "@/context/TeamProvider";
import CreateCampaignDialog from "../dialogs/CreateCampaignDialog";

export default function CampaignsPage() {
  const {
    orgId,
    orgCampaigns: campaigns,
    setOrgCampaigns: setCampaigns,
  } = useTeamContext();
  const [selectCampaign, setSelectCampaign] = useState(null);
  const [openEdit, setOpenEdit] = useState(null);
  const [openStatus, setOpenStatus] = useState(null);
  const [openDelete, setOpenDelete] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  // console.log("campaigns", campaigns);

  // Update campaign status
  const handleUpdateCampaign = (campaign, newStatus) => {
    setSelectCampaign(campaign);
    setOpenStatus(true);
    setNewStatus(newStatus);
  };

  // Delete campaign
  const handleDeleteClick = (campaign) => {
    // Implement your delete logic here
    setSelectCampaign(campaign);
    setOpenDelete(true);
    // You might want to call an API here and then refresh
  };

  const handleEditCampaign = (campaign) => {
    setSelectCampaign(campaign);
    setOpenEdit(true);
  };

  const handleCreateClick = () => {
    setOpenCreateDialog(true);
  };
  return (
    <div className="px-4 py-6">
      {/* Header Section */}
      <PageHeader
        title="Campaigns"
        description="Create, manage and view campaign stats"
        icon="Megaphone"
      />

      {/* Stats Cards */}
      <CampaignStatsCard campaigns={campaigns} />

      <CampaignsTable
        campaigns={campaigns}
        onEdit={handleEditCampaign}
        onStatus={handleUpdateCampaign}
        onDelete={handleDeleteClick}
        onCreate={handleCreateClick}
      />

      <CreateCampaignDialog
        open={openCreateDialog}
        setOpen={setOpenCreateDialog}
        onSuccess={(campaign) => {
          setCampaigns((prev) => [...prev, campaign]);
        }}
      />

      <EditCampaignDialog
        campaign={selectCampaign}
        open={openEdit}
        onOpenChange={setOpenEdit}
        onSuccess={(updatedCampaign) =>
          setCampaigns((prev) =>
            prev.map((c) => (c.id === updatedCampaign.id ? updatedCampaign : c))
          )
        }
        orgId={orgId}
      />

      <DeleteCampaignDialog
        campaign={selectCampaign}
        open={openDelete}
        onOpenChange={setOpenDelete}
        orgId={orgId}
        onSuccess={(campaignId) => {
          setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
        }}
        setCampaigns={setCampaigns}
      />

      <StartPauseCampaignDialog
        campaign={selectCampaign}
        open={openStatus}
        onOpenChange={setOpenStatus}
        status={newStatus}
        orgId={orgId}
         onSuccess={(updatedCampaign) =>
          setCampaigns((prev) =>
            prev.map((c) => (c.id === updatedCampaign.id ? updatedCampaign : c))
          )
        }
      />
    </div>
  );
}
