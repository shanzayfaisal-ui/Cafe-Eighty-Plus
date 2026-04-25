import { useEffect, useMemo, useState } from 'react';
import { ImagePlus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getImage } from '@/lib/imageMap';
import type { Tables } from '@/integrations/supabase/types';

export interface ProductFormValues {
  id?: string;
  name: string;
  description: string;
  price: string;
  price_num: number;
  category_id: string;
  display_order: number;
  image_key: string;
  image_url?: string | null;
  image_path?: string | null;
  is_best_seller?: boolean;
  removeUploadedImage?: boolean;
  file?: File | null;
  size?: string;
}

interface ProductFormProps {
  categories: Pick<Tables<'menu_categories'>, 'id' | 'name'>[];
  initialValues?: Partial<ProductFormValues> | null;
  isSubmitting?: boolean;
  onSubmit: (values: ProductFormValues) => void | Promise<void>;
  onCancel?: () => void;
  readOnly?: boolean;
}

const ProductForm = ({
  categories,
  initialValues,
  isSubmitting = false,
  onSubmit,
  onCancel,
  readOnly = false,
}: ProductFormProps) => {

  const buildDefaultValues = (data?: Partial<ProductFormValues> | null): ProductFormValues => ({
    id: data?.id,
    name: data?.name ?? '',
    description: data?.description ?? '',
    price: data?.price ?? 'Rs. ',
    price_num: data?.price_num ?? 0,
    category_id: data?.category_id ?? categories[0]?.id ?? '',
    display_order: data?.display_order ?? 0,
    image_key: data?.image_key ?? 'espresso',
    image_url: data?.image_url ?? null,
    image_path: data?.image_path ?? null,
    is_best_seller: data?.is_best_seller ?? false,
    size: data?.size ?? '',
    removeUploadedImage: false,
    file: null,
  });

  const [formValues, setFormValues] = useState<ProductFormValues>(() => buildDefaultValues(initialValues));
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialValues?.image_url ?? null);

  // ✅ CRITICAL FIX: Watch initialValues. If it becomes null (Cancel clicked), reset the form.
  useEffect(() => {
    if (!isSubmitting) {
      setFormValues(buildDefaultValues(initialValues));
      setPreviewUrl(initialValues?.image_url ?? null);
    }
  }, [initialValues, isSubmitting]);

  const selectedCategoryName = useMemo(() => {
    return categories.find(cat => cat.id === formValues.category_id)?.name?.toLowerCase() || '';
  }, [formValues.category_id, categories]);

  const showSize = selectedCategoryName === 'coffee beans';

  useEffect(() => {
    if (!formValues.file) {
      setPreviewUrl(formValues.removeUploadedImage ? null : formValues.image_url ?? null);
      return;
    }
    const objectUrl = URL.createObjectURL(formValues.file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [formValues.file, formValues.image_url, formValues.removeUploadedImage]);

  const fallbackImage = useMemo(() => getImage(formValues.image_key || 'espresso'), [formValues.image_key]);

  const handleChange = (field: keyof ProductFormValues, value: any) => {
    setFormValues((current) => ({ 
      ...current, 
      [field]: value 
    }));
  };

  const handleNumericChange = (field: keyof ProductFormValues, value: string) => {
    if (value === '') {
      setFormValues(prev => ({ ...prev, [field]: 0 }));
      return;
    }
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      setFormValues(prev => ({ ...prev, [field]: parsedValue }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (readOnly || isSubmitting) return;

    await onSubmit({
      ...formValues,
      name: formValues.name.trim(),
      description: formValues.description.trim(),
      price: `Rs. ${formValues.price_num}`,
      price_num: Number(formValues.price_num),
      display_order: Number(formValues.display_order),
      size: showSize ? formValues.size : '',
    });
  };

  return (
    <Card className="shadow-sm border-stone-100">
      <CardHeader>
        <CardTitle className="text-[#2D1B14]">{formValues.id ? 'Edit product' : 'Add new product'}</CardTitle>
        <CardDescription>Update the menu item details and image.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="product-name">Name</Label>
              <Input id="product-name" value={formValues.name} onChange={(e) => handleChange('name', e.target.value)} required disabled={readOnly} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="product-description">Description</Label>
              <Textarea id="product-description" value={formValues.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} required disabled={readOnly} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-price">Display Price (e.g., Rs. 500)</Label>
              <Input id="product-price" value={formValues.price} onChange={(e) => handleChange('price', e.target.value)} placeholder="Rs. " required disabled={readOnly} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-price-num">Price (Numeric Value)</Label>
              <Input 
                id="product-price-num" 
                type="number" 
                step="any"
                value={formValues.price_num === 0 ? '' : formValues.price_num} 
                onChange={(e) => handleNumericChange('price_num', e.target.value)} 
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="500" 
                required 
                disabled={readOnly} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-category">Category</Label>
              <select id="product-category" value={formValues.category_id} onChange={(e) => handleChange('category_id', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required disabled={readOnly}>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display-order">Display Order</Label>
              <Input 
                id="display-order" 
                type="number" 
                value={formValues.display_order === 0 ? '' : formValues.display_order} 
                onChange={(e) => handleNumericChange('display_order', e.target.value)} 
                onWheel={(e) => e.currentTarget.blur()}
                disabled={readOnly} 
                placeholder="0" 
              />
            </div>

            {showSize && (
              <div className="space-y-2">
                <Label htmlFor="product-size">Size (e.g. 250g, 500g)</Label>
                <Input id="product-size" value={formValues.size} onChange={(e) => handleChange('size', e.target.value)} disabled={readOnly} />
              </div>
            )}

            <div className="flex items-center space-x-2 pt-4">
              <input type="checkbox" id="best-seller" checked={formValues.is_best_seller} onChange={(e) => handleChange('is_best_seller', e.target.checked)} className="h-4 w-4 rounded border-stone-300" disabled={readOnly} />
              <Label htmlFor="best-seller" className="cursor-pointer">Mark as Best Seller</Label>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[150px_1fr] items-start pt-4 border-t border-stone-50">
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="aspect-square overflow-hidden rounded-xl border bg-stone-50">
                <img src={previewUrl || fallbackImage} alt="Preview" className="h-full w-full object-cover" />
              </div>
            </div>

            <div className="space-y-4">
              <Label htmlFor="product-image-file">Product Image</Label>
              <Input id="product-image-file" type="file" accept="image/*" className="hidden" onChange={(e) => {
                const selectedFile = e.target.files?.[0] ?? null;
                handleChange('file', selectedFile);
                handleChange('removeUploadedImage', false);
              }} disabled={readOnly} />
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('product-image-file')?.click()} disabled={readOnly}>
                  <ImagePlus size={16} className="mr-2" /> Change Image
                </Button>
                {(formValues.image_url || formValues.file) && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => {
                    handleChange('file', null);
                    handleChange('removeUploadedImage', true);
                  }} disabled={readOnly} className="text-stone-400">
                    <RotateCcw size={16} className="mr-2" /> Reset
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            {onCancel && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={(e) => {
                  e.preventDefault();
                  onCancel();
                }}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={readOnly || isSubmitting}>
              {isSubmitting ? 'Saving...' : formValues.id ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;