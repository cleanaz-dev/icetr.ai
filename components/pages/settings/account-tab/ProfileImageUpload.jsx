'use client';
import { useState, useRef } from 'react';
import { Image, Upload, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImageUp } from 'lucide-react';

export default function ProfileImageUpload({ user }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user.imageUrl || null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
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

            const response = await fetch(`/api/org/${orgId}/users/${user.id}/upload-image`, {
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
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <img
                        src={previewUrl || '/default-profile.png'}
                        alt="Profile preview"
                        className="size-32 rounded-full object-cover"
                    />

                    {selectedFile && (
                        <Button
                            type="button"
                            onClick={resetUpload}
                        >
                            <X size={16} />
                        </Button>
                    )}
                </div>

                <div className="flex-1">
                    <div className=''>
                        <h1 className='text-lg font-medium'>{user.firstname} {user.lastname}</h1>
                        <p className='text-muted-foreground'>{user.email}</p>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/jpeg, image/png, image/gif, image/webp"
                        className="hidden"
                        id="profile-upload"
                    />
                    <Label
                        htmlFor="profile-upload"
                        className="inline-flex items-center px-4 py-2 bg-primary rounded-md cursor-pointer hover:bg-primary/70 transition-colors text-white"
                    >
                        <ImageUp size={16} className="mr-2" />
                        {selectedFile ? 'Change Image' : 'Select Image'}
                    </Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                        JPEG, PNG, GIF, or WEBP. Max 5MB.
                    </p>
                </div>
            </div>

            {selectedFile && (
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleUpload}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Upload Image'}
                    </Button>
                    <Button
                        type="button"
                        onClick={resetUpload}
                        variant="outline"
                    >
                        Cancel
                    </Button>
                </div>
            )}

            {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
        </div>
    );
}