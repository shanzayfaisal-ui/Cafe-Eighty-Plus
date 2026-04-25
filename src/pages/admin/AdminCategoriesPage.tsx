import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, X, Check, ChevronDown, Package, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  items?: MenuItem[];
}

const AdminCategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAllData = async () => {
    const { data: catData, error: catError } = await supabase
      .from("menu_categories")
      .select("*")
      .order("name", { ascending: true });

    if (catError) {
      toast.error("Failed to load categories");
      return;
    }

    const { data: itemData, error: itemError } = await supabase
      .from("menu_items")
      .select("*");

    if (!itemError && catData) {
      const merged: Category[] = catData.map((cat: any) => {
        const items = (itemData || [])
          .filter((item: any) => item.category_id === cat.id)
          .map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price_num || item.price,
            description: item.description || "",
            image_url: item.image_url || "",
            category_id: item.category_id
          }));

        return {
          id: cat.id,
          name: cat.name,
          items: items
        };
      });
      
      setCategories(merged);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("menu_categories").insert([{ name: newCategory }]);
    if (!error) {
      toast.success("Category created");
      setNewCategory("");
      fetchAllData();
    }
    setLoading(false);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Deleting this category will not delete its products, but they will become uncategorized. Continue?")) return;
    const { error } = await supabase.from("menu_categories").delete().eq("id", id);
    if (!error) {
      toast.success("Category removed");
      setExpandedId(null);
      fetchAllData();
    }
  };

  const handleUpdateCategory = async (id: string) => {
    const { error } = await supabase.from("menu_categories").update({ name: editValue }).eq("id", id);
    if (!error) {
      toast.success("Category renamed");
      setEditingId(null);
      fetchAllData();
    }
  };

  const goToProductEdit = (item: MenuItem) => {
    // Navigate to inventory and pass the item data in the state
    navigate('/admin/products', { 
      state: { editProduct: item } 
    });
    toast.info(`Switching to Inventory to edit ${item.name}`);
  };

  return (
    <AdminLayout title="Menu Categories" description="Manage categories and assigned menu items">
      <div className="max-w-5xl space-y-8">
        
        {/* ADD CATEGORY */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm flex gap-4">
          <input 
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New Category Name (e.g. Desserts)"
            className="flex-1 bg-stone-50 border-none rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-[#5D3A26]"
          />
          <button 
            disabled={loading}
            onClick={handleAddCategory} 
            className="bg-[#2D1B14] text-[#EAD8C0] px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Plus size={16} /> {loading ? "Creating..." : "Create"}
          </button>
        </div>

        {/* CATEGORY LIST */}
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden">
              
              <div 
                className={cn(
                  "p-8 flex items-center justify-between cursor-pointer transition-all",
                  expandedId === cat.id ? "bg-stone-50/80" : "hover:bg-stone-50/30"
                )} 
                onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
              >
                <div className="flex items-center gap-5">
                  <div className={cn("transition-transform duration-300", expandedId === cat.id && "rotate-180")}>
                    <ChevronDown size={20} className={expandedId === cat.id ? "text-[#5D3A26]" : "text-stone-300"} />
                  </div>
                  
                  {editingId === cat.id ? (
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <input 
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm font-bold outline-none ring-1 ring-[#5D3A26]"
                        autoFocus
                      />
                      <button onClick={() => handleUpdateCategory(cat.id)} className="p-2 bg-emerald-500 text-white rounded-xl"><Check size={16}/></button>
                      <button onClick={() => setEditingId(null)} className="p-2 bg-stone-100 text-stone-400 rounded-xl"><X size={16}/></button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-bold text-[#2D1B14] leading-none">{cat.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-2">{cat.items?.length || 0} Products</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => { setEditingId(cat.id); setEditValue(cat.name); }} className="p-3 text-stone-400 hover:text-[#5D3A26] hover:bg-white rounded-2xl transition-all border border-transparent hover:border-stone-100">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="p-3 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {expandedId === cat.id && (
                <div className="p-8 border-t border-stone-50 bg-white">
                  {cat.items && cat.items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cat.items.map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-4 rounded-3xl border border-stone-50 bg-stone-50/30 group hover:border-[#5D3A26]/20 transition-all">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-200 shrink-0">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-400"><ImageIcon size={20}/></div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-[#2D1B14] truncate">{item.name}</h4>
                            <p className="text-xs text-[#5D3A26] font-black mt-1">Rs. {item.price}</p>
                          </div>

                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => goToProductEdit(item)}
                              className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-100 rounded-xl text-[10px] font-bold uppercase tracking-wider text-stone-400 hover:text-[#5D3A26] hover:border-[#5D3A26] transition-all"
                            >
                              <Edit2 size={12}/> Edit in Inventory
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-stone-50/50 rounded-[2rem] border border-dashed border-stone-200">
                      <Package size={32} className="mx-auto mb-3 text-stone-200" />
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">No items assigned to this category</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCategoriesPage;