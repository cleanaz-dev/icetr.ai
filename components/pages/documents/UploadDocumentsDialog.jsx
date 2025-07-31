"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Plus } from "lucide-react";
import {
  DOCUMENT_CATEGORIES,
  getReadableFileType,
} from "@/lib/config/documents";
import { Input } from "@/components/ui/input";

export const UploadDialog = ({ selectedCampaign, onUpload, orgId }) => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    name: "",
    category: "",
    description: "",
    file: null,
  });

  const resetForm = () => {
    setUploadData({ name: "", category: "", description: "", file: null });
  };

  const handleDialogClose = (isOpen) => {
    if (!isOpen) {
      resetForm();
    }
    setOpen(isOpen);
  };
  const hasFile = uploadData?.file;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.category) return;

    setUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", uploadData.file);
      formData.append("campaignId", selectedCampaign);
      formData.append("category", uploadData.category);
      if (uploadData.description) {
        formData.append("description", uploadData.description);
      }

      // Upload to API
      const response = await fetch(`/api/org/${orgId}/documents/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      // Call parent callback with the new document
      onUpload(result.document);

      // Reset form
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Upload error:", error);
      // You might want to show an error toast here
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button disabled={!selectedCampaign}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a document for the selected campaign
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-4 hover:border-gray-400 transition-colors">
              <Upload className="w-8 h-8 text-gray-400" />

              <p
                className={`text-sm h-16 w-full max-w-xs flex items-center justify-center rounded-lg transition-colors duration-200 ${
                  hasFile
                    ? "bg-muted border border-muted-foreground/40 px-4"
                    : "bg-transparent"
                }`}
              >
                {uploadData.file
                  ? uploadData.file.name
                  : "Choose file to upload"}
              </p>

              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) =>
                  setUploadData({ ...uploadData, file: e.target.files[0] })
                }
                className="hidden"
                id="file-upload"
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("file-upload")?.click()}
                disabled={uploading}
              >
                Browse Files
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={uploadData.category}
                onValueChange={(value) =>
                  setUploadData({ ...uploadData, category: value })
                }
                disabled={uploading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_CATEGORIES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>File Type</Label>
              <Input
              className="border-muted text-sm"
                readOnly
                value={
                  uploadData?.file
                    ? getReadableFileType(uploadData.file.type)
                    : ""
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the document..."
              value={uploadData.description}
              onChange={(e) =>
                setUploadData({ ...uploadData, description: e.target.value })
              }
              rows={3}
              disabled={uploading}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!uploadData.file || !uploadData.category || uploading}
            >
              {uploading ? "Uploading..." : "Upload Documents"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
