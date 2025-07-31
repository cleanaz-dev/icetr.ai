"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ExternalLink, Download } from "lucide-react";
import { Loader2 } from "lucide-react";
import { BsFiletypePdf, BsFiletypeDocx, BsFiletypeTxt, BsFiletypeCsv } from "react-icons/bs";

export default function DocumentsTab({campaignId, orgId}) {
  const [documents,setDocuments] = useState()
  const [loading, setLoading] = useState(false)

  

useEffect(() => {
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/org/${orgId}/campaigns/${campaignId}/documents`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const documents = await response.json();
      setDocuments(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      // Handle error (show toast, set error state, etc.)
    } finally {
      setLoading(false); // Always set loading to false
    }
  };

  if (campaignId) { // Only fetch if campaignId exists
    fetchDocuments();
  }
}, [campaignId]);

  const handleViewDocument = (document) => {
    // Use fileUrl instead of url, open in new tab
    window.open(document.fileUrl, "_blank", "noopener,noreferrer");
  };



  // Check loading state FIRST
if (loading) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="animate-spin mb-4"><Loader2 className="text-primary size-6"/></div>
      <p className="text-sm text-muted-foreground">Loading documents...</p>
    </div>
  );
}

  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileText className="w-12 h-12 text-muted-foreground mb-4" />
        <h4 className="font-medium text-muted-foreground mb-2">No Documents</h4>
        <p className="text-sm text-muted-foreground">
          No documents available for this campaign.
        </p>
      </div>
    );
  }

  const getFileTypeIcon = (type) => {
    const typeConfig = {
      pdf: {
        icon: BsFiletypePdf,
        color: "text-red-500"
      },
      docx: {
        icon: BsFiletypeDocx,
        color: "text-blue-700"
      },
      txt: {
        icon: BsFiletypeTxt,
        color: "text-gray-600"
      },
      csv: {
        icon: BsFiletypeCsv,
        color: "text-green-600"
      },
      // Add more file types as needed
      default: {
        icon: BsFiletypeTxt,
        color: "text-gray-400"
      }
    };

    const config = typeConfig[type] || typeConfig.default;
    const IconComponent = config.icon;
    
    return <IconComponent className={`w-4 h-4 ${config.color} mt-0.5 flex-shrink-0`} />;
  };



  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">Campaign Documents</h4>
        <span className="text-sm text-muted-foreground">
          {documents.length} document
          {documents.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-2">
        {documents.map((document) => (
          <div
            key={document.id}
            className="hover:bg-muted/50 transition-colors"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                       {document.type && (
                       getFileTypeIcon(document.type)
                      )}
                  <div className="flex-1 min-w-0">
                    <h5
                      className="font-medium text-sm truncate"
                      title={document.name}
                    >
                      {document.name}
                    </h5>
                    {document.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {document.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      {document.type && (
                       <span className="uppercase">{document.type}</span>
                      )}
                      {document.fileSize && <span>{Math.round(document.fileSize / 1024)} KB</span>}
                      {document.createdAt && (
                        <span>
                          Created{" "}
                          {new Date(document.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDocument(document)}
                    className="h-8 w-8 p-0"
                    title="View Document"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>

                 
                </div>
              </div>
            </CardContent>
          </div>
        ))}
      </div>
    </div>
  );
}