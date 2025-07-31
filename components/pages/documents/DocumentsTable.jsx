import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Eye, Download, Trash2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { DOCUMENT_CATEGORIES } from "@/lib/config/documents";

/**
 * DocumentsTable component displays a list of documents with optional search filtering.
 *
 * @param {Object} props
 * @param {Array<Object>} props.documents - List of document objects.
 * @param {string} props.searchTerm - Filter string for search.
 */
export const DocumentsTable = ({ documents, searchTerm }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (user) => {
    return `${user.firstname?.[0] || ""}${
      user.lastname?.[0] || ""
    }`.toUpperCase();
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredDocuments.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No documents found
        </h3>
        <p className="text-gray-600">
          {searchTerm
            ? "Try adjusting your search terms"
            : "Upload your first document to get started"}
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
              color: "bg-gray-100 text-gray-800",
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
                  <Badge className={`${categoryInfo.color} `}>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="group inline-block">
                        <Button size="icon" variant="menu">
                          <MoreHorizontal className="w-5 h-5 text-primary group-hover:scale-125 transition-transform duration-300" />
                        </Button>
                      </div>
                    </DropdownMenuTrigger>
                 

                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      className="w-48"
                    >
                         <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link
                          href={document.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4 hover:text-muted-foreground " />
                          View
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => window.open(document.fileUrl, "_blank")}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4 hover:text-muted-foreground " />
                        Download
                      </DropdownMenuItem>

                      <DropdownMenuItem
                      variant="destructive"
                        onClick={() => {
                          console.log("Delete clicked");
                        }}
                        className="flex items-center gap-2 "
                      >
                        <Trash2 className="w-4 h-4 hover:text-muted-foreground " />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
