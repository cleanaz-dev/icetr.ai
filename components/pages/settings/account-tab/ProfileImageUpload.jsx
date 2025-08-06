'use client';
import { useState, useRef } from 'react';
import { Upload, X, Camera, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function ProfileImageUpload({ user, onUploadSuccess }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user.imageUrl || null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Please select a valid image file (JPEG, PNG, GIF, or WEBP)');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        setError(null);
        setUploadSuccess(false);
        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile || !user.id) return;

        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const response = await fetch(`/api/org/${user.orgId}/users/${user.id}/upload-image`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }

            // Update preview with the new URL from the server
            setPreviewUrl(data.imageUrl);
            setSelectedFile(null);
            setUploadSuccess(true);
            
            // Call success callback
            if (onUploadSuccess) {
                onUploadSuccess(data.imageUrl);
            }

            // Clear success message after 3 seconds
            setTimeout(() => setUploadSuccess(false), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const resetUpload = () => {
        setSelectedFile(null);
        setPreviewUrl(user.imageUrl || null);
        setError(null);
        setUploadSuccess(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-3">
            {/* Image Preview with Overlay Controls */}
            <div className="relative group">
                <div className="relative size-24 rounded-full overflow-hidden border-2 border-border">
                    <Image
                        src={previewUrl || '/default-profile.png'}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                        width={100}
                        height={100}
                    />
                    
                    {/* Overlay on hover */}
                    {/* <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <Camera className="w-4 h-4 text-white" />
                    </div> */}
                </div>

                {/* Change indicator for new uploads */}
                {selectedFile && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                )}
            </div>

            {/* Upload Controls */}
            <div className="space-y-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg, image/png, image/gif, image/webp"
                    className="hidden"
                    id="profile-upload"
                />
                
                <div className="flex gap-2">
                    <Label
                        htmlFor="profile-upload"
                        className="inline-flex items-center px-3 py-1.5 text-sm border rounded-md cursor-pointer hover:bg-muted transition-colors"
                    >
                        <Upload className="w-3 h-3 mr-1.5" />
                        {selectedFile ? 'Change' : 'Upload'}
                    </Label>

                    {selectedFile && (
                        <>
                            <Button
                                onClick={handleUpload}
                                disabled={isUploading}
                                size="sm"
                                className="px-3 py-1.5 h-auto"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1.5"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-3 h-3 mr-1.5" />
                                        Save
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={resetUpload}
                                variant="ghost"
                                size="sm"
                                className="px-3 py-1.5 h-auto"
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        </>
                    )}
                </div>

                {/* Status Messages */}
                {uploadSuccess && (
                    <p className="text-green-600 text-xs flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Profile picture updated successfully
                    </p>
                )}
                
                {error && (
                    <p className="text-red-500 text-xs">{error}</p>
                )}
                
                {!error && !uploadSuccess && (
                    <p className="text-xs text-muted-foreground">
                        JPEG, PNG, GIF, or WEBP. Max 5MB.
                    </p>
                )}
            </div>
        </div>
    );
}