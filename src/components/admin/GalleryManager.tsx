import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Plus, Loader2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

const GalleryManager = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) toast.error("Failed to load gallery");
    else setImages(data || []);
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to your 'Gallery' bucket
      const { error: uploadError } = await supabase.storage
        .from('Gallery')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('Gallery')
        .getPublicUrl(filePath);

      // 3. Insert using your EXACT column names
      const { error: dbError } = await supabase
        .from('gallery')
        .insert([{ 
          title: file.name.split('.')[0],
          alt: file.name.split('.')[0],
          image_url: publicUrl, 
          image_key: filePath, // Storing for deletion logic
          display_order: images.length + 1,
          span: 'col-span-1' 
        }]);

      if (dbError) throw dbError;

      toast.success("Image added successfully");
      fetchImages();
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, imageKey: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      // 1. Remove from Storage using the key
      const { error: storageError } = await supabase.storage
        .from('Gallery')
        .remove([imageKey]);

      if (storageError) throw storageError;
      
      // 2. Remove from Database
      const { error: dbError } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);
      
      if (dbError) throw dbError;

      setImages(images.filter(img => img.id !== id));
      toast.success("Image deleted from gallery");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-border">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#5D3A26]">Gallery Assets</h2>
          <p className="text-sm text-muted-foreground">Manage your website's portfolio images</p>
        </div>
        <label className="flex items-center gap-2 bg-[#5D3A26] text-white px-6 py-2.5 rounded-lg cursor-pointer hover:bg-[#4A2E1E] transition-all shadow-md active:scale-95">
          {uploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
          <span className="font-semibold">{uploading ? "Processing..." : "Upload Photo"}</span>
          <input type="file" hidden onChange={handleUpload} disabled={uploading} accept="image/*" />
        </label>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-3">
          <Loader2 className="animate-spin text-[#5D3A26]" size={40} />
          <p className="text-[#5D3A26] font-medium">Loading Gallery...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-[#5D3A26] transition-all bg-muted shadow-sm">
              <img 
                src={img.image_url} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                alt={img.alt || "Gallery Image"} 
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white text-xs font-medium truncate pr-2">{img.title}</span>
                  <button 
                    onClick={() => handleDelete(img.id, img.image_key)}
                    className="bg-rose-600 hover:bg-rose-700 p-2 rounded-lg text-white shadow-lg transition-transform hover:scale-110"
                    title="Delete Image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && images.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl">
          <p className="text-muted-foreground">No images found. Upload your first masterpiece!</p>
        </div>
      )}
    </div>
  );
};

export default GalleryManager;