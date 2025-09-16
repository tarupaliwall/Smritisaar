import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface DatasetUploadProps {
  onUploadComplete: (message: string, count: number) => void;
}

interface UploadResponse {
  message: string;
  processedCount: number;
  filename: string;
}

export function DatasetUpload({ onUploadComplete }: DatasetUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append('dataset', file);

      const response = await fetch('/api/upload-dataset', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setSelectedFile(null);
      setUploadProgress(0);
      onUploadComplete(data.message, data.processedCount);
      toast({
        title: "Dataset Uploaded Successfully",
        description: `Processed ${data.processedCount} cases from ${data.filename}`,
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      setUploadProgress(0);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload dataset",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv', // .csv
        'application/zip', // .zip
      ];
      
      const allowedExtensions = ['.xlsx', '.xls', '.csv', '.zip'];
      const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        toast({
          title: "Invalid File Type",
          description: "Please select an Excel (.xlsx, .xls), CSV, or ZIP file",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "File Too Large",
          description: "File size must be less than 50MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    
    setUploadProgress(10);
    uploadMutation.mutate(selectedFile);
    
    // Simulate upload progress (since we don't have real progress tracking)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <section 
      className="bg-card border border-border rounded-lg p-6 mb-8 shadow-sm" 
      data-testid="dataset-upload"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground mb-2">
          <i className="fas fa-upload text-primary mr-2" />
          Upload Dataset
        </h3>
        <p className="text-sm text-muted-foreground">
          Upload your legal cases dataset in Excel (.xlsx, .xls), CSV, or ZIP format
        </p>
      </div>

      <div className="space-y-4">
        {/* File Input */}
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors hover:border-primary/50">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.zip"
            onChange={handleFileSelect}
            className="hidden"
            data-testid="file-input"
          />
          
          <div className="space-y-2">
            <i className="fas fa-cloud-upload-alt text-3xl text-muted-foreground" />
            
            {selectedFile ? (
              <div className="space-y-2">
                <p className="text-card-foreground font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  Size: {formatFileSize(selectedFile.size)}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-card-foreground">Choose a file to upload</p>
                <p className="text-sm text-muted-foreground">
                  Supports .xlsx, .xls, .csv, and .zip files (max 50MB)
                </p>
              </div>
            )}
            
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              data-testid="button-select-file"
            >
              <i className="fas fa-folder-open mr-2" />
              {selectedFile ? 'Change File' : 'Select File'}
            </Button>
          </div>
        </div>

        {/* Upload Progress */}
        {(uploadMutation.isPending || uploadProgress > 0) && (
          <div className="space-y-2" data-testid="upload-progress">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Uploading and processing...</span>
              <span className="text-primary">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Upload Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 transition-colors"
            data-testid="button-upload-dataset"
          >
            <i className="fas fa-upload mr-2" />
            {uploadMutation.isPending ? 'Processing...' : 'Upload & Process Dataset'}
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-4 bg-muted rounded-lg" data-testid="upload-instructions">
          <h4 className="font-semibold text-card-foreground mb-2">
            <i className="fas fa-info-circle text-primary mr-2" />
            Dataset Format Requirements
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Required columns:</strong> english, tamil, batch, sentence_number, doc_id</li>
            <li>• <strong>English column:</strong> Contains the legal case text in English</li>
            <li>• <strong>Tamil column:</strong> Contains the legal case text in Tamil (optional)</li>
            <li>• <strong>Batch:</strong> Batch number for organizing cases</li>
            <li>• <strong>Sentence Number:</strong> Sequence number within the batch</li>
            <li>• <strong>Doc ID:</strong> Unique document identifier for the case</li>
            <li>• <strong>ZIP files:</strong> Can contain multiple Excel/CSV files</li>
          </ul>
        </div>
      </div>
    </section>
  );
}