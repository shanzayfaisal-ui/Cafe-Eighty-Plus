import AdminLayout from "@/components/admin/AdminLayout";
import GalleryManager from "@/components/admin/GalleryManager";

const AdminGalleryPage = () => {
  return (
    <AdminLayout 
      title="Gallery Assets" 
      description="Upload and manage your cafe's portfolio images"
    >
      <GalleryManager />
    </AdminLayout>
  );
};

export default AdminGalleryPage;