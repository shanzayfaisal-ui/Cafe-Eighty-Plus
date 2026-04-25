import { useEffect, useMemo, useState } from 'react';
import { Eye, Image as ImageIcon, Pencil, Plus, Search, Settings, ShieldAlert, Trash2, Package2, Shapes, Truck } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ProductForm from '@/components/admin/ProductForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getImage } from '@/lib/imageMap';
import { previewCategories, previewProducts, type PreviewCategory, type PreviewProduct } from '@/lib/adminPreviewData';

const AdminPreviewPage = () => {
    const [products, setProducts] = useState<PreviewProduct[]>(previewProducts);
    const [categories, setCategories] = useState<PreviewCategory[]>(previewCategories);
    const [selectedProductId, setSelectedProductId] = useState<string>(previewProducts[0]?.id ?? '');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [usingLiveData, setUsingLiveData] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const applyFallbackData = () => {
            if (!isMounted) return;
            setCategories(previewCategories);
            setProducts(previewProducts);
            setSelectedProductId(previewProducts[0]?.id ?? '');
            setUsingLiveData(false);
        };

        const loadPreviewData = async () => {
            try {
                const [productsResponse, categoriesResponse] = await Promise.all([
                    supabase.from('menu_items').select('*').order('display_order').order('name'),
                    supabase.from('menu_categories').select('id, name').order('display_order').order('name'),
                ]);

                if (productsResponse.error || categoriesResponse.error) {
                    throw productsResponse.error ?? categoriesResponse.error;
                }

                const liveCategories = (categoriesResponse.data ?? []).map((category) => ({
                    id: category.id,
                    name: category.name,
                }));

                const categoryMap = new Map(liveCategories.map((category) => [category.id, category.name]));
                const liveProducts = (productsResponse.data ?? []).map((product) => ({
                    id: product.id,
                    category_id: product.category_id,
                    categoryName: categoryMap.get(product.category_id) ?? 'Uncategorized',
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    price_num: product.price_num,
                    image_key: product.image_key,
                    image_url: product.image_url ?? null,
                    image_path: product.image_path ?? null,
                    display_order: product.display_order,
                    status: 'Active' as const,
                }));

                if (!isMounted) return;

                if (liveProducts.length > 0 && liveCategories.length > 0) {
                    setCategories(liveCategories);
                    setProducts(liveProducts);
                    setSelectedProductId(liveProducts[0]?.id ?? '');
                    setUsingLiveData(true);
                } else {
                    applyFallbackData();
                }
            } catch (error) {
                console.warn('Admin preview is using sample data.', error);
                applyFallbackData();
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        void loadPreviewData();
        return () => { isMounted = false; };
    }, []);

    const selectedProduct = useMemo(
        () => products.find((product) => product.id === selectedProductId) ?? products[0] ?? previewProducts[0],
        [products, selectedProductId],
    );

    const filteredProducts = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (!normalizedSearch) return products;
        return products.filter((product) => product.name.toLowerCase().includes(normalizedSearch));
    }, [products, searchTerm]);

    const previewStats = useMemo(
        () => ({
            productCount: products.length,
            categoryCount: categories.length,
            uploadedImageCount: products.filter((product) => Boolean(product.image_url)).length,
        }),
        [categories.length, products],
    );

    const showPreviewToast = (action: string) => {
        toast({
            title: 'Disabled in preview mode',
            description: `${action} is shown for demonstration only.`,
        });
    };

    return (
        <AdminLayout
            title="Admin Preview"
            description="Demo preview only. The real admin dashboard remains protected."
            // If these cause errors, cast AdminLayout to any or update its Interface
            {...({
                previewMode: true,
                previewNotice: "Demo Preview Only — Changes are disabled here.",
                adminEmailOverride: "preview@demo.local",
                navBasePath: "/admin-preview"
            } as any)}
        >
            <div className="space-y-6">
                <Card id="dashboard" className="border-amber-200 bg-amber-50/60 shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                                <Eye className="h-5 w-5 text-amber-700" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Admin Preview Mode</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {loading ? 'Loading preview data...' : usingLiveData ? 'Showing live read-only data.' : 'Showing sample mock data.'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base">Products</CardTitle>
                            <Package2 className="h-4 w-4 text-accent" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{loading ? '—' : previewStats.productCount}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base">Categories</CardTitle>
                            <Shapes className="h-4 w-4 text-accent" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{loading ? '—' : previewStats.categoryCount}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base">Custom Images</CardTitle>
                            <ImageIcon className="h-4 w-4 text-accent" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{loading ? '—' : previewStats.uploadedImageCount}</div>
                        </CardContent>
                    </Card>
                </div>

                <div id="products" className="grid gap-6 xl:grid-cols-[1.05fr_1.4fr]">
                    <ProductForm
                        categories={categories}
                        initialValues={selectedProduct}
                        onSubmit={async () => showPreviewToast('Saving products')}
                        onCancel={() => setSelectedProductId(products[0]?.id ?? '')}
                        readOnly
                        // Casting to any to bypass strict Props errors if interface wasn't updated
                        {...({
                            submitLabel: "Preview only",
                            readOnlyMessage: "Create, edit, and upload controls are disabled in preview."
                        } as any)}
                    />
                    
                    <Card>
                        <CardHeader className="gap-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <CardTitle>All products</CardTitle>
                                    <CardDescription>Search and browse products list.</CardDescription>
                                </div>
                                <Button type="button" onClick={() => showPreviewToast('Adding products')}>
                                    <Plus className="mr-2 h-4 w-4" /> Add product
                                </Button>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Search by product name"
                                    className="pl-9"
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-start">
                                        <img src={product.image_url || getImage(product.image_key || 'espresso')} alt={product.name} className="h-20 w-20 rounded-lg border object-cover" />
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold">{product.name}</h3>
                                            <p className="text-sm text-muted-foreground">{product.categoryName} • {product.price}</p>
                                            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
                                        </div>
                                        <div className="flex gap-2 sm:flex-col">
                                            <Button variant="outline" size="sm" onClick={() => setSelectedProductId(product.id)}>
                                                <Pencil className="h-3 w-3 mr-1" /> View
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card id="settings" className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Settings Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                            <div className="flex items-center gap-2 font-medium">
                                <ShieldAlert className="h-4 w-4 text-amber-600" />
                                Preview restriction
                            </div>
                            <p className="mt-1 text-muted-foreground">Admin settings are read-only in this demo.</p>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2 border-b pb-6">
                            <div className="space-y-2">
                                <Label>Admin email</Label>
                                <Input value="preview@demo.local" disabled />
                            </div>
                            <div className="space-y-2">
                                <Label>Password</Label>
                                <Input type="password" value="••••••••" disabled />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-[#5D3A26]" />
                                <h3 className="font-medium">Store Configuration</h3>
                            </div>
                            <div className="flex gap-3 items-end">
                                <div className="space-y-2 flex-1 max-w-[200px]">
                                    <Label>Delivery Fee (Rs.)</Label>
                                    <Input value="200" disabled />
                                </div>
                                <Button onClick={() => showPreviewToast('Updating fee')}>Update Fee</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminPreviewPage;