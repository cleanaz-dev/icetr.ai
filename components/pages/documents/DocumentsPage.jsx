"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Folder } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DocumentsTable } from "./DocumentsTable";
import { UploadDialog } from "./UploadDocumentsDialog";

export default function DocumentsPage({ campaigns: initialCampaigns, orgId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState(campaigns[0]?.id);

  const selectedCampaignData = campaigns.find((c) => c.id === selectedCampaign);
  const selectedCampaignName = selectedCampaignData?.name;
  const documents = selectedCampaignData?.documents || [];

  const handleUpload = (newDocument) => {
    setCampaigns((prevCampaigns) =>
      prevCampaigns.map((campaign) => {
        if (campaign.id === selectedCampaign) {
          return {
            ...campaign,
            documents: [newDocument, ...campaign.documents],
          };
        }
        return campaign;
      })
    );
  };

  return (
    <div className="container mx-auto max-w-7xl py-8 space-y-6 px-4">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold mb-2">
          <Folder className="text-primary size-6" /> Document Management
        </h1>
        <p className="text-muted-foreground">
          Manage documents for your campaigns - scripts, training materials,
          compliance docs, and more.
        </p>
      </div>

      {/* Campaign Selection & Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Campaign Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label
                htmlFor="campaign-select"
                className="text-sm font-medium mb-2 block"
              >
                Select Campaign
              </Label>
              <Select
                value={selectedCampaign}
                onValueChange={setSelectedCampaign}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a campaign to manage documents" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Upload Documents */}
            <UploadDialog
              selectedCampaign={selectedCampaign}
              onUpload={handleUpload}
              orgId={orgId}
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents Section */}
      {selectedCampaign && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Documents</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Managing documents for{" "}
                  <span className="font-medium">{selectedCampaignName}</span>
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Badge variant="secondary" className="shrink-0 w-24">
                  {documents.length}{" "}
                  {documents.length === 1 ? "document" : "documents"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>

            

            {/* Documents Table */}
            <DocumentsTable documents={documents} searchTerm={searchTerm} />
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!selectedCampaign && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Select a Campaign</h3>
              <p className="text-muted-foreground mb-6">
                Choose a campaign from the dropdown above to view and manage its
                documents.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
