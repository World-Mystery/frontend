"use client"

import { useState, useRef } from "react"
import { Upload, FileText, X, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ImportReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportReportDialog({ open, onOpenChange }: ImportReportDialogProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleUpload = () => {
    if (!file) return
    setUploading(true)
    // Simulate upload
    setTimeout(() => {
      setUploading(false)
      setUploaded(true)
      setTimeout(() => {
        onOpenChange(false)
        setFile(null)
        setUploaded(false)
      }, 1500)
    }, 2000)
  }

  const handleClose = () => {
    onOpenChange(false)
    setFile(null)
    setUploaded(false)
    setUploading(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>导入体检报告</DialogTitle>
          <DialogDescription>
            上传体检报告文件，AI 将自动解析并更新您的健康数据
          </DialogDescription>
        </DialogHeader>

        {uploaded ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-foreground">报告上传成功</p>
            <p className="text-xs text-muted-foreground">AI 正在解析报告内容...</p>
          </div>
        ) : (
          <>
            {/* Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-all",
                isDragging
                  ? "border-primary bg-primary/[0.03]"
                  : "border-border/60 hover:border-primary/40 hover:bg-accent/30"
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/[0.07]">
                <Upload className="h-5 w-5 text-primary/70" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {"拖拽文件到此处，或点击选择"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {"支持 PDF、图片格式（JPG/PNG），最大 20MB"}
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Selected file */}
            {file && (
              <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-accent/30 px-4 py-3">
                <FileText className="h-5 w-5 shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-accent"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            )}

            {/* Upload button */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all",
                file && !uploading
                  ? "btn-bubble"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {uploading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {"正在上传..."}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {"开始导入"}
                </>
              )}
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
