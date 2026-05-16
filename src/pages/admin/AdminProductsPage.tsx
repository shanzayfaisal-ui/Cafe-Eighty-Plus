import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Pencil, Plus, Search, Trash2, RefreshCcw, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ProductForm, { type ProductFormValues } from '@/components/admin/ProductForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getImage } from '@/lib/imageMap';
import type { Tables } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

const STORAGE_BUCKET = 'product-images';

type ProductRecord = Tables<'menu_items'> & {
    categoryName?: string;
};

const AdminProductsPage = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'menu' | 'coffee' | 'merch'>('menu');
    const [products, setProducts] = useState<ProductRecord[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ProductRecord | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const loadData = async () => {
        try {
            setLoading(true);
            const [productsResp, categoriesResp] = await Promise.all([
                supabase.from('menu_items').select('*').order('display_order', { ascending: true }),
                supabase.from('menu_categories').select('id, name')
            ]);
            
            if (productsResp.data) {
                const catMap = new Map(categoriesResp.data?.map(c => [c.id, c.name]));
                const formattedProducts = productsResp.data.map(p => ({ 
                    ...p, 
                    categoryName: catMap.get(p.category_id) 
                }));
                setProducts(formattedProducts);

                if (location.state?.editProduct) {
                    const incomingProduct = location.state.editProduct;
                    const fullProduct = formattedProducts.find(p => p.id === incomingProduct.id) || incomingProduct;
                    
                    setSelectedProduct(fullProduct);
                    
                    const catName = fullProduct.categoryName?.toLowerCase() || '';
                    if (catName.includes('coffee beans')) setActiveTab('coffee');
                    else if (catName.includes('merchandise')) setActiveTab('merch');
                    else setActiveTab('menu');

                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    // Clear the state so it doesn't trigger again on refresh
                    window.history.replaceState({}, document.title);
                }
            }
            if (categoriesResp.data) setCategories(categoriesResp.data);
        } catch (error: any) {
            console.error("Load Error:", error.message);
            toast({ title: "Failed to load data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void loadData(); }, [location.state]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const cat = p.categoryName?.toLowerCase() || '';
            
            if (activeTab === 'coffee') return matchesSearch && cat.includes('coffee beans');
            if (activeTab === 'merch') return matchesSearch && cat.includes('merchandise');
            return matchesSearch && !cat.includes('coffee beans') && !cat.includes('merchandise');
        });
    }, [products, searchTerm, activeTab]);

    const handleCancel = () => {
        setSelectedProduct(null);
        // Ensure any navigation state from other pages is cleared
        window.history.replaceState({}, document.title);
    };

    const handleDelete = async (product: ProductRecord) => {
        if (!window.confirm(`Delete ${product.name}?`)) return;
        const deletedProduct = product;
        let cleanupTimer: ReturnType<typeof window.setTimeout> | null = null;

        try {
            const { error } = await supabase.from('menu_items').delete().eq('id', product.id);
            if (error) throw error;

            toast({
                title: "Product deleted",
                description: "Undo within 1 minute.",
                action: (
                    <ToastAction
                        altText="Undo delete"
                        onClick={async () => {
                            if (cleanupTimer) {
                                clearTimeout(cleanupTimer);
                                cleanupTimer = null;
                            }

                            const { error: restoreError } = await supabase.from('menu_items').insert([deletedProduct as any]);
                            if (restoreError) {
                                toast({ title: 'Restore failed', description: restoreError.message, variant: 'destructive' });
                                return;
                            }

                            toast({ title: 'Product restored' });
                            await loadData();
                        }}
                    >
                        Undo
                    </ToastAction>
                ),
                duration: 60000,
            });

            await loadData();

            if (deletedProduct.image_path) {
                cleanupTimer = window.setTimeout(async () => {
                    const { error: storageError } = await supabase.storage.from(STORAGE_BUCKET).remove([deletedProduct.image_path]);
                    if (storageError) {
                        console.error("Image cleanup failed:", storageError.message);
                    }
                }, 60000);
            }
        } catch (e: any) {
            toast({ title: "Delete failed", description: e.message, variant: "destructive" });
        }
    };

    const handleSave = async (values: ProductFormValues) => {
        setSaving(true);
        try {
            let finalImageUrl = values.image_url;
            let finalImagePath = values.image_path;
            const formValues = values as any;

            if (formValues.file) {
                const file = formValues.file;
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = fileName;

                const { error: uploadError } = await supabase.storage
                    .from(STORAGE_BUCKET)
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from(STORAGE_BUCKET)
                    .getPublicUrl(filePath);

                finalImageUrl = publicUrl;
                finalImagePath = filePath;
            }

            const productData = {
                name: values.name,
                description: values.description,
                price: values.price,
                price_num: values.price_num,
                display_order: values.display_order,
                category_id: values.category_id,
                image_url: finalImageUrl,
                image_path: finalImagePath,
                image_key: values.image_key,
                is_best_seller: values.is_best_seller,
                size: values.size
            };

            if (selectedProduct) {
                const { error } = await supabase
                    .from('menu_items')
                    .update(productData as any)
                    .eq('id', selectedProduct.id);
                if (error) throw error;
                toast({ title: "Product updated successfully" });
            } else {
                const { error } = await supabase
                    .from('menu_items')
                    .insert([productData] as any);
                if (error) throw error;
                toast({ title: "Product created successfully" });
            }

            handleCancel(); // Resets form and clears history state
            await loadData();
        } catch (e: any) {
            toast({ title: "Save failed", description: e.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout title="Product Management" description="Manage your product catalog, descriptions, and pricing.">
            <div className="space-y-8">
                <div className="flex p-1 bg-stone-100 rounded-2xl w-fit">
                    {(['menu', 'coffee', 'merch'] as const).map((tab) => (
                        <button 
                            key={tab} 
                            onClick={() => {
                                setActiveTab(tab);
                                handleCancel();
                            }} 
                            className={cn(
                                "px-6 py-2 text-xs font-bold rounded-xl uppercase transition-all", 
                                activeTab === tab ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"
                            )}
                        >
                            {tab === 'menu' ? 'Main Menu' : tab === 'coffee' ? 'Coffee Beans' : 'Merchandise'}
                        </button>
                    ))}
                </div>

                <div className="grid gap-8 xl:grid-cols-[1fr_1.5fr]">
                    <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm h-fit">
                        <h2 className="font-serif font-bold text-xl mb-6 text-[#2D1B14]">
                            {selectedProduct ? 'Edit Details' : 'Add New Item'}
                        </h2>
                        <ProductForm 
                            categories={categories} 
                            initialValues={selectedProduct} 
                            isSubmitting={saving} 
                            onSubmit={handleSave} 
                            onCancel={handleCancel} 
                        />
                    </div>

                    <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-stone-50 flex justify-between items-center bg-stone-50/30">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                                <Input 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    placeholder="Search catalog..." 
                                    className="pl-10 rounded-xl border-stone-100 bg-white" 
                                />
                            </div>
                            <Button variant="ghost" onClick={loadData} size="icon" className="ml-4 text-stone-400">
                                <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                            </Button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                            {loading ? (
                                <div className="py-20 text-center text-stone-400 flex flex-col items-center gap-2">
                                    <Loader2 className="animate-spin" size={24} />
                                    <span>Loading products...</span>
                                </div>
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                    <div key={product.id} className={cn(
                                        "flex items-center gap-4 p-4 rounded-2xl border transition-colors group",
                                        selectedProduct?.id === product.id ? "bg-stone-100 border-[#5D3A26]/20" : "border-stone-50 hover:bg-stone-50/50"
                                    )}>
                                        <div className="bg-stone-100 text-stone-400 text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-bold">
                                            {product.display_order}
                                        </div>
                                        <img 
                                            src={product.image_url || getImage(product.image_key || 'espresso')} 
                                            alt={product.name}
                                            className="w-14 h-14 rounded-xl object-cover shadow-sm" 
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold text-[#2D1B14] text-sm">{product.name}</p>
                                            <p className="text-xs text-stone-400 font-medium">{product.price}</p>
                                            <p className="text-[10px] uppercase tracking-wider text-stone-300 font-bold mt-1">
                                                {product.categoryName}
                                            </p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" onClick={() => {
                                                setSelectedProduct(product);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}>
                                                <Pencil size={14} className="text-stone-400 hover:text-[#5D3A26]" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product)} className="text-rose-200 hover:text-rose-500 hover:bg-rose-50">
                                                <Trash2 size={14}/>
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center text-stone-300">
                                    No items found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminProductsPage;