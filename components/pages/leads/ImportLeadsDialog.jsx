"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, FileText, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Region } from "@/lib/constants/frontend";
import { Info } from "lucide-react";

export default function ImportLeadsDialog({
  campaigns,
  onImportComplete,
  orgId,
  importLeads,
}) {
  console.log("campaigns", campaigns);
  const [file, setFile] = useState(null);
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("canada");
  const [region, setRegion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const selectedCampaignObj = campaigns?.find((c) => c.id === selectedCampaign);
  const regionOptions =
    Region[0][country === "canada" ? "provinces" : "states"] || [];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
    } else {
      toast.error("Please select a valid CSV file");
      e.target.value = ""; // Reset the input
    }
  };

  const resetForm = () => {
    setIndustry("");
    setFile();
    setCountry("canada");
    setRegion("");
    setSelectedCampaign();
    setSelectedTeam();
    setSource("");
  };

  const buildLeadImportFormData = () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("campaignId", selectedCampaign);
    formData.append("teamId", selectedTeam || "");
    formData.append("orgId", orgId);
    formData.append("source", source || "");
    formData.append("industry", industry || "");
    formData.append("country", country || "");
    formData.append("region", region || "");
    formData.append(
      "assignmentStrategy",
      selectedCampaignObj?.assignmentStrategy || ""
    );
    return formData;
  };

  const handleSubmit = async () => {
    if (!file || !selectedCampaign) {
      toast.error(
        !file ? "Please select a file to import" : "Campaign ID is required"
      );
      return;
    }

    setIsLoading(true);

    try {
      const formData = buildLeadImportFormData();
      const result = await importLeads(formData, orgId);

      if(!result.ok) {
        throw new Error(result.error)
      }

      toast.success(result.message);
      resetForm();
    } catch (error) {
      console.error("Import error:", error);
      toast.error("An error occurred while importing leads");
    } finally {
      setIsLoading(false);
      setOpen(false)
    }
  };


  const removeFile = () => {
    setFile(null);
    const fileInput = document.getElementById("csv-file-input");
    if (fileInput) fileInput.value = "";
  };

  const handleCloseDialog = (isOpen) => {
    setOpen(isOpen);

    if (!isOpen) {
      resetForm();
    }
  };
  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Import Leads
        </Button>
      </DialogTrigger>
      <DialogContent className=" min-w-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Leads from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import leads. The file should contain a
            'phoneNumber' or email column.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label>File</Label>
            <Input
              id="csv-file-input"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </div>

          {file && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Campaign</Label>
              <Select
                value={selectedCampaign}
                onValueChange={setSelectedCampaign}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {campaigns?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Team</Label>
              <Select
                value={selectedTeam}
                onValueChange={setSelectedTeam}
                disabled={
                  !selectedCampaign ||
                  campaigns.find((c) => c.id === selectedCampaign)
                    ?.assignmentStrategy === "MANUAL" ||
                  !campaigns.find((c) => c.id === selectedCampaign)?.team
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={(() => {
                      const selected = campaigns.find(
                        (c) => c.id === selectedCampaign
                      );

                      if (!selected) return "Select campaign first";

                      // ✅ Always show "No team assigned" if there's no team
                      if (!selected.team) return "No team assigned";

                      // ✅ Only show "Not required" if strategy is MANUAL and team exists
                      if (selected.assignmentStrategy === "MANUAL")
                        return "Not required";

                      // ✅ Otherwise show the actual team name
                      return selected.team.name;
                    })()}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(() => {
                      const selected = campaigns.find(
                        (c) => c.id === selectedCampaign
                      );
                      if (!selected?.team) return null;

                      return (
                        <SelectItem value={selected.team.id}>
                          {selected.team.name}
                        </SelectItem>
                      );
                    })()}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lead type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="trades">Trades</SelectItem>
                    <SelectItem value="real-estate">Real Estate</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lead type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="google_scraper">
                      Google Scraper
                    </SelectItem>
                    <SelectItem value="apollo">Apollo</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="canada">Canada</SelectItem>
                    <SelectItem value="us">US</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {country && (
              <div className="space-y-2">
                <Label>{country === "canada" ? "Province" : "State"}</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={`Select ${
                        country === "canada" ? "Province" : "State"
                      }`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {regionOptions.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Assignment Strategy</Label>
              <Input
                value={
                  selectedCampaign
                    ? campaigns
                        .find((c) => c.id === selectedCampaign)
                        ?.assignmentStrategy?.replace("_", " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (l) => l.toUpperCase()) ||
                      "Not specified"
                    : "Not specified"
                }
                readOnly
              />
            </div>
          </div>
          <div className="col-span-2">
            {selectedCampaign && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                <Info className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    const selected = campaigns.find(
                      (c) => c.id === selectedCampaign
                    );
                    const strategy = selected?.assignmentStrategy;
                    const hasNoTeam = !selected?.team;

                    if (hasNoTeam) {
                      return "No team is assigned to this campaign — leads will remain unassigned.";
                    }

                    const messages = {
                      MANUAL: "You will need to assign leads manually",
                      ROUND_ROBIN:
                        "Leads will be evenly spread across team members",
                      ROLE_BASED:
                        "Leads will be assigned based on team member roles",
                    };

                    return (
                      messages[strategy] ?? "Assignment method not specified"
                    );
                  })()}
                </p>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>CSV Format Example:</strong>
            </p>
            <code className="block bg-muted p-2 rounded text-xs whitespace-pre">
              phoneNumber,company,website
              <br />
              +1234567890,Acme Inc,www.acme.com
              <br />
              +0987654321,Techify,www.techify.io
            </code>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!file || isLoading}>
            {isLoading ? "Importing..." : "Import Leads"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
