"use client";
import { Trophy } from "lucide-react";
import React, { useState } from "react";
import CampaignStatsCard from "./CampaignStatsCard";
import { toast } from "sonner";
import CampaignsTable from "./CampaignsTable";
import EditCampaignDialog from "./EditCampaignDialogs";
import StartPauseCampaignDialog from "./StartPauseCampaignDialog";
import DeleteCampaignDialog from "./DeleteCampaignDialog";

export default function CampaignsPage({ campaigns = [], revalidate }) {
  const [selectCampaign, setSelectCampaign] = useState(null);
  const [openEdit, setOpenEdit] = useState(null);
  const [openStatus, setOpenStatus] = useState(null);
  const [openDelete, setOpenDelete] = useState(null)
  const [newStatus, setNewStatus] = useState(null);

  // Update campaign status
  const handleUpdateCampaign = (campaign, newStatus) => {
    setSelectCampaign(campaign);
    setOpenStatus(true);
    setNewStatus(newStatus);
  };

  // Delete campaign
  const handleDeleteClick = (campaign) => {
    // Implement your delete logic here
    setSelectCampaign(campaign)
    setOpenDelete(true)
    // You might want to call an API here and then refresh
  };

  const handleEditCampaign = (campaign) => {
    setSelectCampaign(campaign);
    setOpenEdit(true);
  };
  return (
    <div className="px-4 py-6">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center space-x-3">
          <div className="border-2 border-primary p-2 rounded-full">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          {/* <Badge>
            {campaigns.length} active
          </Badge> */}
        </div>
      </header>

      {/* Stats Cards */}
      <CampaignStatsCard campaigns={campaigns} />

      <CampaignsTable
        campaigns={campaigns}
        onEdit={handleEditCampaign}
        onStatus={handleUpdateCampaign}
        onDelete={handleDeleteClick}
      />

      <EditCampaignDialog
        campaign={selectCampaign}
        open={openEdit}
        onOpenChange={setOpenEdit}
        onSuccess={() => toast.success("Updated Campaign Successfully")}
      />

      <DeleteCampaignDialog
        campaign={selectCampaign}
        open={openDelete}
        onOpenChange={setOpenDelete}
        onSuccess={() => {
          // Refresh campaigns list or navigate away
          console.log("Delete Campaign")
          // fetchCampaigns();
        }}
      />

      <StartPauseCampaignDialog
        campaign={selectCampaign}
        open={openStatus}
        onOpenChange={setOpenStatus}
        status={newStatus}
        onSuccess={async () => await revalidate()}
      />
    </div>
  );
}
