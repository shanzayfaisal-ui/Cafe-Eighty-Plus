import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Save, Upload, Coffee, Edit3, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Layer {
  label: string;
  pct: number;
  color: string;
}

interface CoffeeGuide {
  id: string;
  name: string;
  description: string;
  ratio: string;
  milk: string;
  strength: string;
  image_key: string;
  layers: Layer[];
}

const AdminCoffeeGuide = () => {
  const [coffees, setCoffees] = useState<CoffeeGuide[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ratio, setRatio] = useState('');
  const [milk, setMilk] = useState('');
  const [strength, setStrength] = useState('');
  const [layers, setLayers] = useState<Layer[]>([{ label: 'Espresso', pct: 50, color: '#3b2a1f' }]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCoffees();
  }, []);

  const fetchCoffees = async () => {
    const { data } = await supabase.from('coffee_guide').select('*').order('name');
    if (data) setCoffees(data as any);
  };

  const handleEdit = (coffee: CoffeeGuide) => {
    setSelectedId(coffee.id);
    setName(coffee.name);
    setDescription(coffee.description);
    setRatio(coffee.ratio);
    setMilk(coffee.milk);
    setStrength(coffee.strength);
    setLayers(coffee.layers);
    // Generate the public URL for the existing image
    const { data: { publicUrl } } = supabase.storage.from('coffee-guides').getPublicUrl(coffee.image_key);
    setPreviewUrl(publicUrl);
  };

  const resetForm = () => {
    setSelectedId(null);
    setName('');
    setDescription('');
    setRatio('');
    setMilk('');
    setStrength('');
    setLayers([{ label: 'Espresso', pct: 50, color: '#3b2a1f' }]);
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let imagePath = coffees.find(c => c.id === selectedId)?.image_key || "";

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('coffee-guides')
          .upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        imagePath = fileName;
      }

      const payload = {
        name, description, ratio, milk, strength,
        layers: layers as any,
        image_key: imagePath,
      };

      const { error } = selectedId 
        ? await supabase.from('coffee_guide').update(payload).eq('id', selectedId)
        : await supabase.from('coffee_guide').insert([payload]);

      if (error) throw error;

      toast({ title: "Success", description: "Coffee guide updated." });
      resetForm();
      fetchCoffees();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coffee?")) return;
    const { error } = await supabase.from('coffee_guide').delete().eq('id', id);
    if (!error) {
      toast({ title: "Deleted", description: "Coffee removed." });
      fetchCoffees();
      if (selectedId === id) resetForm();
    }
  };

  return (
    <AdminLayout title="Coffee Guide" description="Manage your coffee types and ratios.">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT: LIST OF COFFEES */}
        <Card className="xl:col-span-1">
          <CardContent className="pt-6">
            <Button onClick={resetForm} variant="outline" className="w-full mb-4 gap-2">
              <Plus size={16} /> New Coffee Type
            </Button>
            <div className="space-y-2">
              {coffees.map(coffee => (
                <div key={coffee.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-100">
                  <span className="font-medium text-stone-800">{coffee.name}</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(coffee)}><Edit3 size={16} /></Button>
                    <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(coffee.id)}><Trash2 size={16} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: EDITOR FORM */}
        <Card className="xl:col-span-2">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Coffee Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Image (Upload to Update)</Label>
                <Input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div><Label>Ratio</Label><Input value={ratio} onChange={(e) => setRatio(e.target.value)} /></div>
                  <div><Label>Milk</Label><Input value={milk} onChange={(e) => setMilk(e.target.value)} /></div>
                  <div><Label>Strength</Label><Input value={strength} onChange={(e) => setStrength(e.target.value)} /></div>
                </div>
              </div>

              {/* LIVE PREVIEW AREA */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <Label className="text-[10px] uppercase tracking-widest text-stone-400 mb-2 block">Live Preview</Label>
                <div className="flex flex-col items-center text-center">
                  {previewUrl ? (
                    <img src={previewUrl} className="w-32 h-32 rounded-xl object-cover shadow-sm mb-2" alt="Preview" />
                  ) : (
                    <div className="w-32 h-32 bg-stone-200 rounded-xl mb-2 flex items-center justify-center"><Coffee className="text-stone-400" /></div>
                  )}
                  <h4 className="font-bold font-serif">{name || "Coffee Name"}</h4>
                  <div className="w-full h-6 bg-stone-200 rounded-full mt-3 flex overflow-hidden border border-white">
                    {layers.map((l, i) => (
                      <div key={i} style={{ width: `${l.pct}%`, backgroundColor: l.color }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* LAYERS EDITOR */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between items-center">
                <Label className="font-bold">Composition Layers</Label>
                <Button onClick={() => setLayers([...layers, { label: '', pct: 0, color: '#000000' }])} size="sm" variant="outline"><Plus size={14} className="mr-1" /> Add Layer</Button>
              </div>
              {layers.map((layer, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <Input className="flex-1" placeholder="Label" value={layer.label} onChange={(e) => {
                    const nl = [...layers]; nl[index].label = e.target.value; setLayers(nl);
                  }} />
                  <Input className="w-20" type="number" value={layer.pct} onChange={(e) => {
                    const nl = [...layers]; nl[index].pct = Number(e.target.value); setLayers(nl);
                  }} />
                  <Input className="w-16 h-10 p-1" type="color" value={layer.color} onChange={(e) => {
                    const nl = [...layers]; nl[index].color = e.target.value; setLayers(nl);
                  }} />
                  <Button variant="ghost" size="icon" className="text-red-400" onClick={() => setLayers(layers.filter((_, i) => i !== index))}><Trash2 size={16} /></Button>
                </div>
              ))}
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full bg-[#2D1B14] hover:bg-[#5D3A26]">
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
              {selectedId ? "Update Coffee Guide" : "Create New Coffee Guide"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCoffeeGuide;