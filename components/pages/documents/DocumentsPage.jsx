"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Upload, 
  FileText, 
  Eye, 
  Download, 
  Search, 
  Plus,
  Calendar,
  Trash2,
  ExternalLink
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import Link from 'next/link';

const DOCUMENT_CATEGORIES = {
  script: { label: 'Call Script', color: 'bg-blue-100 text-blue-800' },
  training: { label: 'Training', color: 'bg-green-100 text-green-800' },
  reference: { label: 'Reference', color: 'bg-purple-100 text-purple-800' },
  template: { label: 'Template', color: 'bg-orange-100 text-orange-800' },
  compliance: { label: 'Compliance', color: 'bg-red-100 text-red-800' },
  faq: { label: 'FAQ', color: 'bg-yellow-100 text-yellow-800' }
};

const UploadDialog = ({ selectedCampaign, onUpload }) => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    name: '',
    category: '',
    description: '',
    file: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.category) return;
    
    setUploading(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('campaignId', selectedCampaign);
      formData.append('category', uploadData.category);
      if (uploadData.description) {
        formData.append('description', uploadData.description);
      }

      // Upload to API
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      // Call parent callback with the new document
      onUpload(result.document);
      
      // Reset form
      setUploadData({ name: '', category: '', description: '', file: null });
      setOpen(false);
      
    } catch (error) {
      console.error('Upload error:', error);
      // You might want to show an error toast here
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                {uploadData.file ? uploadData.file.name : 'Choose file to upload'}
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => setUploadData({...uploadData, file: e.target.files[0]})}
                className="hidden"
                id="file-upload"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => document.getElementById('file-upload').click()}
                disabled={uploading}
              >
                Browse Files
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={uploadData.category} 
              onValueChange={(value) => setUploadData({...uploadData, category: value})}
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
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the document..."
              value={uploadData.description}
              onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
              rows={3}
              disabled={uploading}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!uploadData.file || !uploadData.category || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
const DocumentsTable = ({ documents, searchTerm }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (user) => {
    return `${user.firstname?.[0] || ''}${user.lastname?.[0] || ''}`.toUpperCase();
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredDocuments.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
        <p className="text-gray-600">
          {searchTerm ? 'Try adjusting your search terms' : 'Upload your first document to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Document</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDocuments.map((document) => {
            const categoryInfo = DOCUMENT_CATEGORIES[document.category] || { 
              label: document.category, 
              color: 'bg-gray-100 text-gray-800' 
            };

            return (
              <TableRow key={document.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{document.name}</div>
                      {document.description && (
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {document.description}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${categoryInfo.color}`}>
                    {categoryInfo.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatFileSize(document.fileSize)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={document.uploader.imageUrl || null} />
                      <AvatarFallback className="text-xs">
                        {getInitials(document.uploader)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {document.uploader.firstname} {document.uploader.lastname}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(document.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" title="View" asChild >
                      <Link href={document.fileUrl}>
                      <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" title="Download">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Delete" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default function DocumentsPage({ campaigns }) {
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCampaignData = campaigns.find(c => c.id === selectedCampaign);
  const selectedCampaignName = selectedCampaignData?.name;
  const documents = selectedCampaignData?.documents || [];

  const handleUpload = (newDocument) => {
    // Find the campaign and update its documents
    const updatedCampaigns = campaigns.map(campaign => {
      if (campaign.id === selectedCampaign) {
        return {
          ...campaign,
          documents: [newDocument, ...campaign.documents]
        };
      }
      return campaign;
    });
    // Note: You might want to lift this state up to the parent component
    // or use a state management solution for proper updates
    console.log('New document uploaded:', newDocument);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Document Management</h1>
        <p className="text-gray-600">
          Manage documents for your campaigns - scripts, training materials, compliance docs, and more.
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
              <Label htmlFor="campaign-select" className="text-sm font-medium mb-2 block">
                Select Campaign
              </Label>
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
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
            <UploadDialog selectedCampaign={selectedCampaign} onUpload={handleUpload} />
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
                  Managing documents for <span className="font-medium">{selectedCampaignName}</span>
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
                <Badge variant="secondary">
                  {documents.length} {documents.length === 1 ? 'document' : 'documents'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DocumentsTable documents={documents} searchTerm={searchTerm} />
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!selectedCampaign && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Select a Campaign</h3>
              <p className="text-gray-600 mb-6">
                Choose a campaign from the dropdown above to view and manage its documents.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}