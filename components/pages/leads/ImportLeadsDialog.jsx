"use client";

import { useState } from "react";
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

export default function ImportLeadsDialog({ campaignId, onImportComplete }) {
  const [file, setFile] = useState(null);
  const [source, setSource] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("canada");
  const [region, setRegion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file to import");
      return;
    }

    if (!campaignId) {
      toast.error("Campaign ID is required");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("campaignId", campaignId);
    formData.append("source", source);
    formData.append("industry", industry);
    formData.append("country", country);
    formData.append("region", region);

    try {
      const response = await fetch("/api/import/leads", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Successfully imported ${data.count || 0} leads`);
        setFile(null);
        setIsOpen(false);
        // Reset file input
        const fileInput = document.getElementById("csv-file-input");
        if (fileInput) fileInput.value = "";

        // Call callback if provided
        if (onImportComplete) {
          onImportComplete(data);
        }
      } else {
        toast.error(data.error || "Failed to import leads");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("An error occurred while importing leads");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    const fileInput = document.getElementById("csv-file-input");
    if (fileInput) fileInput.value = "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Import Leads
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
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
          <Button onClick={handleImport} disabled={!file || isLoading}>
            {isLoading ? "Importing..." : "Import Leads"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
