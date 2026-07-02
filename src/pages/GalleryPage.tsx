import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Folder, Image as ImageIcon, Upload, Trash2, Edit3, X, Download, Plus, Eye } from 'lucide-react';
import { User, GalleryPhoto, Album } from '../types';
import ConfirmModal from '../components/ConfirmModal';

interface GalleryPageProps {
  user: User;
  gallery: GalleryPhoto[];
  albums: Album[];
  themeClasses: any;
  onRefresh: () => void;
}

export default function GalleryPage({ user, gallery, albums, themeClasses, onRefresh }: GalleryPageProps) {
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [showRenameAlbum, setShowRenameAlbum] = useState<string | null>(null); // albumId
  
  // Create / Rename States
  const [newAlbumName, setNewAlbumName] = useState('');
  const [renameValue, setRenameValue] = useState('');

  // Upload States
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAlbumName, setUploadAlbumName] = useState('');
  const [uploadFileBase64, setUploadFileBase64] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Preview lightbox state
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null);
  const [confirmDeleteAlbumId, setConfirmDeleteAlbumId] = useState<string | null>(null);
  const [confirmDeletePhotoId, setConfirmDeletePhotoId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // Filter photos based on album selection
  const filteredPhotos = activeAlbum 
    ? gallery.filter((p) => p.albumName.toLowerCase() === activeAlbum.toLowerCase())
    : gallery;

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadFileBase64(event.target.result as string);
        setUploadTitle(file.name.split('.')[0]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Upload Action
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileBase64 || !uploadTitle || !uploadAlbumName) return;

    setLoading(true);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('roommate_token')}`,
        },
        body: JSON.stringify({
          photoUrl: uploadFileBase64,
          title: uploadTitle,
          albumName: uploadAlbumName,
        }),
      });

      if (!res.ok) throw new Error('Upload failed');
      
      // Reset Upload states
      setUploadTitle('');
      setUploadFileBase64(null);
      setUploadAlbumName('');
      onRefresh();
    } catch (err) {
      alert('Failed to upload image. Please check limits or size.');
    } finally {
      setLoading(false);
    }
  };

  // Create Album Action
  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName) return;

    try {
      const res = await fetch('/api/albums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('roommate_token')}`,
        },
        body: JSON.stringify({ name: newAlbumName }),
      });
      if (!res.ok) throw new Error('Failed to create album');

      setShowCreateAlbum(false);
      setNewAlbumName('');
      onRefresh();
    } catch (err) {
      alert('Failed to create album');
    }
  };

  // Rename Album Action
  const handleRenameAlbum = async (albumId: string) => {
    if (!renameValue) return;

    try {
      const res = await fetch(`/api/albums/${albumId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('roommate_token')}`,
        },
        body: JSON.stringify({ name: renameValue }),
      });
      if (!res.ok) throw new Error('Failed to rename album');

      setShowRenameAlbum(null);
      setRenameValue('');
      onRefresh();
    } catch (err) {
      alert('Failed to rename album');
    }
  };

  // Delete Album Action
  const handleDeleteAlbum = async (albumId: string) => {
    setConfirmDeleteAlbumId(albumId);
  };

  const executeDeleteAlbum = async (albumId: string) => {
    try {
      const res = await fetch(`/api/albums/${albumId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('roommate_token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete album');

      setActiveAlbum(null);
      setConfirmDeleteAlbumId(null);
      onRefresh();
    } catch (err) {
      alert('Failed to delete album');
    }
  };

  // Delete Photo Action
  const handleDeletePhoto = async (photoId: string) => {
    setConfirmDeletePhotoId(photoId);
  };

  const executeDeletePhoto = async (photoId: string) => {
    try {
      const res = await fetch(`/api/gallery/${photoId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('roommate_token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete photo');

      setPreviewPhoto(null);
      setConfirmDeletePhotoId(null);
      onRefresh();
    } catch (err) {
      alert('Failed to delete photo');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Personal & Shared Gallery</h2>
          <p className={`${themeClasses.textMuted} text-sm mt-1`}>
            Share snapshots of house milestones, recipes, clean chores, or sunset views!
          </p>
        </div>
        <button
          onClick={() => setShowCreateAlbum(true)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${themeClasses.buttonPrimary}`}
        >
          <Plus className="w-4 h-4" />
          Create Album
        </button>
      </div>

      {/* Main Grid: Albums / Photo List & Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column: Albums & Upload Drawer */}
        <div className="space-y-4 lg:col-span-1">
          {/* Albums Panel */}
          <div className={`rounded-2xl ${themeClasses.card} p-5`}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
              House Albums
            </h3>
            <div className="space-y-1.5">
              <button
                onClick={() => setActiveAlbum(null)}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                  activeAlbum === null ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-white/5 text-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> All Shared Photos
                </span>
                <span className="bg-white/5 px-2 py-0.5 rounded text-[10px]">
                  {gallery.length}
                </span>
              </button>

              {albums.map((album) => {
                const count = gallery.filter((p) => p.albumName.toLowerCase() === album.name.toLowerCase()).length;
                return (
                  <div key={album.id} className="relative group">
                    <button
                      onClick={() => setActiveAlbum(album.name)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                        activeAlbum?.toLowerCase() === album.name.toLowerCase()
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      <span className="flex items-center gap-2 pr-12 truncate">
                        <Folder className="w-4 h-4 text-emerald-400 shrink-0" />
                        {showRenameAlbum === album.id ? (
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => handleRenameAlbum(album.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameAlbum(album.id);
                            }}
                            autoFocus
                            className="bg-slate-900 text-white border-white/20 border text-[11px] px-1 py-0.5 rounded w-28 focus:outline-none"
                          />
                        ) : (
                          album.name
                        )}
                      </span>
                      <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] group-hover:opacity-0 transition">
                        {count}
                      </span>
                    </button>

                    {/* Quick album management tools */}
                    {album.userId === user.id && showRenameAlbum !== album.id && (
                      <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-slate-900/95 p-1 rounded-lg border border-white/10">
                        <button
                          onClick={() => {
                            setRenameValue(album.name);
                            setShowRenameAlbum(album.id);
                          }}
                          className="p-1 hover:text-emerald-400 text-gray-400 transition"
                          title="Rename Album"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteAlbum(album.id)}
                          className="p-1 hover:text-red-400 text-gray-400 transition"
                          title="Delete Album"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upload Photo Panel */}
          <div className={`rounded-2xl ${themeClasses.card} p-5`}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
              Add Snapshot
            </h3>
            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                  Upload Target Album
                </label>
                <select
                  required
                  value={uploadAlbumName}
                  onChange={(e) => setUploadAlbumName(e.target.value)}
                  className={`w-full px-2.5 py-2 rounded-lg border text-xs focus:outline-none ${themeClasses.input}`}
                >
                  <option value="">Select or Create Album...</option>
                  <option value="Living Area">Living Area</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Balcony View">Balcony View</option>
                  {albums.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                  Drag / Drop Photo
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
                    dragActive ? 'border-emerald-400 bg-emerald-500/10' : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                  <p className="text-[10px] text-gray-400">Drag or click to choose image file</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="photo-file-upload"
                  />
                  <label
                    htmlFor="photo-file-upload"
                    className="inline-block mt-2.5 px-3 py-1 bg-white/5 text-[10px] rounded-lg hover:bg-white/10 transition font-medium text-slate-300"
                  >
                    Select File
                  </label>
                </div>
              </div>

              {uploadFileBase64 && (
                <div className="space-y-2">
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black/40">
                    <img
                      src={uploadFileBase64}
                      alt="Upload Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setUploadFileBase64(null)}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/90 text-white rounded-full transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none ${themeClasses.input}`}
                      placeholder="e.g. Sunny Balcony"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 rounded-lg text-xs font-semibold transition ${themeClasses.buttonPrimary} disabled:opacity-50`}
                  >
                    {loading ? 'Uploading...' : 'Confirm Upload'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right column: Gallery Photo Display Grid */}
        <div className="lg:col-span-3">
          <div className={`rounded-2xl ${themeClasses.card} p-6 h-full`}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
              <h3 className="text-base font-bold flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                {activeAlbum || 'All Shared Gallery Photos'}
              </h3>
              <span className="text-xs text-gray-400 font-medium">
                Showing {filteredPhotos.length} photos
              </span>
            </div>

            {filteredPhotos.length === 0 ? (
              <div className="py-24 text-center text-sm text-gray-400 flex flex-col items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-500 mb-3" />
                <span>No photos found in this album. Drag & drop a new photo in the side panel!</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredPhotos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    layoutId={photo.id}
                    whileHover={{ scale: 1.02 }}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-white/5 group cursor-pointer bg-black/20"
                  >
                    <img
                      src={photo.photoUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Hover controls overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-200 p-4 flex flex-col justify-between">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewPhoto(photo);
                          }}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                          title="Preview Fullscreen"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={photo.photoUrl}
                          download={photo.title}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center"
                          title="Download photo"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs truncate">{photo.title}</h4>
                        <span className="text-[9px] text-emerald-400 font-semibold uppercase tracking-wider block mt-0.5">
                          {photo.albumName}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS & LIGHTBOX */}
      {showCreateAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-sm p-6 rounded-2xl ${themeClasses.card} border border-white/15`}>
            <h3 className="text-lg font-bold mb-4">Create Photo Album</h3>
            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Album Name</label>
                <input
                  type="text"
                  required
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                  placeholder="e.g. Garden Party"
                />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateAlbum(false)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${themeClasses.buttonPrimary}`}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox photo preview */}
      <AnimatePresence>
        {previewPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="relative max-w-4xl w-full flex flex-col gap-4">
              <button
                onClick={() => setPreviewPhoto(null)}
                className="absolute -top-10 right-0 p-2 text-white hover:text-emerald-400 transition"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black/45 border border-white/10">
                <img
                  src={previewPhoto.photoUrl}
                  alt={previewPhoto.title}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex justify-between items-center text-white px-2">
                <div>
                  <h4 className="text-lg font-bold">{previewPhoto.title}</h4>
                  <p className="text-xs text-gray-400">
                    Album: {previewPhoto.albumName} • Uploaded at {new Date(previewPhoto.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-3">
                  <a
                    href={previewPhoto.photoUrl}
                    download={previewPhoto.title}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                  {true && (
                    <button
                      onClick={() => handleDeletePhoto(previewPhoto.id)}
                      className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Photo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!confirmDeleteAlbumId}
        title="Confirm Album Deletion"
        message="Are you sure you want to delete this album and ALL of its photos? This action cannot be undone."
        confirmText="Yes, Delete Album"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={() => {
          if (confirmDeleteAlbumId) {
            executeDeleteAlbum(confirmDeleteAlbumId);
          }
        }}
        onCancel={() => setConfirmDeleteAlbumId(null)}
      />

      <ConfirmModal
        isOpen={!!confirmDeletePhotoId}
        title="Confirm Photo Deletion"
        message="Are you sure you want to delete this photo from the household gallery?"
        confirmText="Yes, Delete Photo"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={() => {
          if (confirmDeletePhotoId) {
            executeDeletePhoto(confirmDeletePhotoId);
          }
        }}
        onCancel={() => setConfirmDeletePhotoId(null)}
      />
    </div>
  );
}
