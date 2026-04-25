import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Package, Save, AlertCircle, LoaderCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  id: string;
  name: string;
  category_name: string;
  stock: number;
}

const AdminInventoryPage = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      // 1. Fetch categories
      const { data: catData } = await supabase
        .from('menu_categories')
        .select('id, name')
        .eq('cartable', true);

      if (!catData || catData.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      // 2. Fetch items - Notice the 'as any' on the table AND the data
      const { data, error: itemError } = await supabase
        .from('menu_items' as any)
        .select('id, name, category_id, stock, display_order')
        .in('category_id', catData.map(c => c.id));

      if (itemError) throw itemError;

      // We cast data to any[] here to stop the 'property does not exist' errors
      const itemData = data as any[];

      if (itemData) {
        // Sort manually using the dynamic properties
        const sortedData = [...itemData].sort((a, b) => 
            (Number(a.display_order) || 0) - (Number(b.display_order) || 0)
        );

        const itemsWithCategory = sortedData.map(item => {
          const cat = catData.find(c => c.id === item.category_id);
          return {
            id: item.id,
            name: item.name,
            category_name: cat?.name || 'Other',
            stock: Number(item.stock) || 0,
          };
        });
        setItems(itemsWithCategory);
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
      toast({
        title: "Error",
        description: "Failed to load inventory",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (itemId: string, newStock: number) => {
    setSaving(prev => new Set(prev).add(itemId));
    try {
      const { error } = await supabase
        .from('menu_items' as any)
        .update({ stock: newStock } as any) // Cast update object to any
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev =>
        prev.map(item => item.id === itemId ? { ...item, stock: newStock } : item)
      );

      toast({ title: "Success", description: "Stock updated" });
    } catch (err) {
      toast({ title: "Error", description: "Update failed", variant: "destructive" });
    } finally {
      setSaving(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleStockChange = (itemId: string, value: string) => {
    const numValue = value === "" ? 0 : Math.max(0, parseInt(value) || 0);
    setItems(prev =>
      prev.map(item => item.id === itemId ? { ...item, stock: numValue } : item)
    );
  };

  const handleSave = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    await updateStock(itemId, item.stock);
  };

  return (
    <AdminLayout title="Inventory" description="Manage stock levels">
      <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-3">
             <LoaderCircle className="animate-spin text-stone-400" size={32} />
             <p className="text-stone-500 text-sm">Loading...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                  <th className="px-8 py-5">Product</th>
                  <th className="px-8 py-5">Category</th>
                  <th className="px-8 py-5">Stock</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                    <td className="px-8 py-5 font-bold text-[#2D1B14]">{item.name}</td>
                    <td className="px-8 py-5 text-sm text-stone-500">{item.category_name}</td>
                    <td className="px-8 py-5">
                      <input
                        type="number"
                        min="0"
                        value={item.stock}
                        onChange={(e) => handleStockChange(item.id, e.target.value)}
                        className="w-24 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#5D3A26]"
                      />
                    </td>
                    <td className="px-8 py-5">
                        {item.stock <= 0 ? (
                          <span className="text-rose-600 text-[10px] font-black uppercase bg-rose-50 px-2 py-1 rounded-md">Out of Stock</span>
                        ) : (
                          <span className="text-emerald-600 text-[10px] font-black uppercase bg-emerald-50 px-2 py-1 rounded-md">Available</span>
                        )}
                    </td>
                    <td className="px-8 py-5">
                      <button
                        onClick={() => handleSave(item.id)}
                        disabled={saving.has(item.id)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#5D3A26] text-white rounded-xl text-[11px] font-black uppercase hover:bg-[#3d2619] disabled:opacity-50"
                      >
                        {saving.has(item.id) ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />}
                        Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminInventoryPage;