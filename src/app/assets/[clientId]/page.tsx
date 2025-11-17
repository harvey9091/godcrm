'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getSession } from '@/lib/supabase/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getClientById, getAssetsByClientId, createAsset, deleteAsset } from '@/lib/supabase/db'
import { Client, Asset } from '@/lib/types'
import { FileUpload } from '@/components/ui/file-upload'
import { IconTrash, IconFile, IconVideo, IconPhoto, IconMusic, IconFileText } from '@tabler/icons-react'

export default function ClientAssetsPage() {
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<Client | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const params = useParams()

  const fetchClient = useCallback(async () => {
    try {
      const data = await getClientById(params.clientId as string)
      setClient(data)
    } catch (error) {
      console.error('Error fetching client:', error)
    }
  }, [params.clientId])

  const fetchAssets = useCallback(async () => {
    try {
      const data = await getAssetsByClientId(params.clientId as string)
      setAssets(data)
    } catch (error) {
      console.error('Error fetching assets:', error)
    }
  }, [params.clientId])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await getSession()
        if (!data.session) {
          router.push('/login')
        } else {
          fetchClient()
          fetchAssets()
        }
      } catch (error) {
        console.error('Authentication error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, params.clientId, fetchClient, fetchAssets])

  const handleFileUpload = async (files: File[]) => {
    setUploading(true)
    try {
      // In a real app, you would upload to Supabase Storage
      // For now, we'll simulate the upload and create a database entry
      for (const file of files) {
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Create asset entry in database
        await createAsset({
          client_id: params.clientId as string,
          file_url: URL.createObjectURL(file),
          file_name: file.name
        })
      }
      
      // Refresh assets
      fetchAssets()
    } catch (error) {
      console.error('Error uploading files:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteAsset = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return
    
    try {
      await deleteAsset(id)
      fetchAssets()
    } catch (error) {
      console.error('Error deleting asset:', error)
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || ''
    
    if (['mp4', 'mov', 'avi', 'mkv'].includes(extension)) {
      return <IconVideo className="w-8 h-8 text-blue-500" />
    }
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return <IconPhoto className="w-8 h-8 text-green-500" />
    }
    
    if (['mp3', 'wav', 'ogg'].includes(extension)) {
      return <IconMusic className="w-8 h-8 text-purple-500" />
    }
    
    if (['pdf', 'doc', 'docx'].includes(extension)) {
      return <IconFileText className="w-8 h-8 text-red-500" />
    }
    
    return <IconFile className="w-8 h-8 text-gray-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!client) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div>Client not found</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              <AnimatedGradientText className="text-3xl font-bold">
                {client.name} Assets
              </AnimatedGradientText>
            </h1>
            <p className="text-muted-foreground mt-1">Manage assets for this client</p>
          </div>
          <Button onClick={() => router.back()} variant="outline">
            Back to Assets
          </Button>
        </div>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload onChange={handleFileUpload} />
            {uploading && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2">Uploading files...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assets Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Client Assets</CardTitle>
          </CardHeader>
          <CardContent>
            {assets.length === 0 ? (
              <div className="text-center py-12">
                <IconFile className="w-12 h-12 text-gray-400 mx-auto" />
                <h3 className="mt-4 text-lg font-medium">No assets uploaded</h3>
                <p className="mt-1 text-muted-foreground">
                  Upload files to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {assets.map((asset) => (
                  <div key={asset.id} className="border rounded-lg p-4 relative group">
                    <div className="flex flex-col items-center">
                      {getFileIcon(asset.file_name)}
                      <h3 className="mt-2 text-sm font-medium truncate w-full text-center">
                        {asset.file_name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(asset.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteAsset(asset.id)}
                    >
                      <IconTrash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}