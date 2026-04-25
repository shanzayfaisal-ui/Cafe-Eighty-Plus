import { useEffect, useState } from 'react';
import { LoaderCircle, ShieldCheck, Truck, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { getCurrentSession, getCurrentUser, updateAdminCredentials } from '@/lib/adminAuth';
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";

const AdminSettingsPage = () => {
    const navigate = useNavigate();
    const { refreshDeliveryFee } = useCart();
    
    // Admin Auth States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Delivery Fee States
    const [deliveryFeeInput, setDeliveryFeeInput] = useState('');
    const [updatingFee, setUpdatingFee] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const initializeData = async () => {
            try {
                // 1. Fetch User
                const user = await getCurrentUser();
                if (isMounted) setEmail(user?.email ?? '');

                // 2. Fetch Delivery Fee from Supabase
                const { data, error } = await supabase
                    .from('app_settings' as any)
                    .select('value')
                    .eq('key', 'delivery_fee')
                    .maybeSingle();
                
                if (error) {
                    console.error("Fetch error:", error.message);
                }

                if (isMounted && data) {
                    // Force string for the input field
                    setDeliveryFeeInput(String((data as any).value));
                }
            } catch (error) {
                console.error("Initialization error:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        initializeData();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleSaveAuth = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (password && password.length < 6) {
            toast({
                title: 'Password too short',
                description: 'Use at least 6 characters for the new password.',
                variant: 'destructive',
            });
            return;
        }

        if (password !== confirmPassword) {
            toast({
                title: 'Passwords do not match',
                description: 'Please confirm the same password before saving.',
                variant: 'destructive',
            });
            return;
        }

        try {
            setSaving(true);
            const session = await getCurrentSession();

            if (!session) {
                toast({
                    title: 'Session expired',
                    description: 'Please sign in again to update your admin account.',
                    variant: 'destructive',
                });
                navigate('/admin/login', { replace: true });
                return;
            }

            await updateAdminCredentials({
                email,
                password: password || undefined,
            });

            setPassword('');
            setConfirmPassword('');
            toast({
                title: 'Account updated',
                description: 'Your admin credentials have been updated.',
            });
        } catch (error) {
            toast({
                title: 'Update failed',
                description: error instanceof Error ? error.message : 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateDeliveryFee = async () => {
        if (deliveryFeeInput === "") {
            toast({
                title: "Invalid Input",
                description: "Please enter a value for the delivery fee.",
                variant: "destructive"
            });
            return;
        }

        try {
            setUpdatingFee(true);
            
            // Perform the update
            const { error, data } = await supabase
                .from('app_settings' as any)
                .update({ value: deliveryFeeInput })
                .eq('key', 'delivery_fee')
                .select(); // We use select() to verify the update actually happened

            if (error) throw error;

            // If no data is returned, the row might not exist
            if (!data || data.length === 0) {
                throw new Error("No setting found with key 'delivery_fee'. Ensure the row exists in Supabase.");
            }

            // Sync the global cart state
            await refreshDeliveryFee(); 
            
            toast({
                title: 'Success',
                description: `Delivery fee updated to Rs. ${deliveryFeeInput}`,
            });
        } catch (error: any) {
            console.error("Delivery Fee Update Error:", error);
            toast({
                title: 'Update failed',
                description: error.message || "Ensure you have permission to update this table.",
                variant: 'destructive',
            });
        } finally {
            setUpdatingFee(false);
        }
    };

    return (
        <AdminLayout title="Admin settings" description="Manage your account credentials and store configurations.">
            <div className="space-y-6 max-w-2xl">
                
                {/* STORE SETTINGS CARD */}
                <Card className="shadow-sm border-stone-200">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-[#5D3A26]" />
                            <CardTitle>Store Configuration</CardTitle>
                        </div>
                        <CardDescription>
                            Configure global store values like delivery charges.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <LoaderCircle className="h-4 w-4 animate-spin" /> Loading...
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="delivery-fee">Delivery Fee (Rs.)</Label>
                                    <div className="flex gap-3">
                                        <Input
                                            id="delivery-fee"
                                            type="number"
                                            value={deliveryFeeInput}
                                            onChange={(e) => setDeliveryFeeInput(e.target.value)}
                                            placeholder="e.g. 200"
                                            className="max-w-[200px]"
                                        />
                                        <Button 
                                            onClick={handleUpdateDeliveryFee} 
                                            disabled={updatingFee}
                                            className="bg-[#5D3A26] hover:bg-[#432a1b] text-white"
                                        >
                                          {updatingFee ? (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <>
                                              <Save className="h-4 w-4 mr-2" />
                                              Update Fee
                                            </>
                                          )}
                                        </Button>
                                    </div>
                                    <p className="text-[11px] text-stone-400 italic">
                                        Current value in system: {deliveryFeeInput}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ACCOUNT SETTINGS CARD */}
                <Card className="shadow-sm border-stone-200">
                    <CardHeader>
                        <CardTitle>Account settings</CardTitle>
                        <CardDescription>
                            Update your admin email or password. Changes are sent through Supabase Auth.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Loading account details...
                            </div>
                        ) : (
                            <form onSubmit={handleSaveAuth} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="settings-email">Admin email</Label>
                                    <Input
                                        id="settings-email"
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        autoComplete="email"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="settings-password">New password</Label>
                                    <Input
                                        id="settings-password"
                                        type="password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        autoComplete="new-password"
                                        placeholder="Leave blank to keep current"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="settings-confirm-password">Confirm new password</Label>
                                    <Input
                                        id="settings-confirm-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        autoComplete="new-password"
                                        placeholder="Repeat new password"
                                    />
                                </div>

                                <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2 font-medium text-foreground">
                                        <ShieldCheck className="h-4 w-4 text-[#5D3A26]" />
                                        Session protection
                                    </div>
                                    <p className="mt-2 text-xs">
                                        Verification may be required if you change your email address.
                                    </p>
                                </div>

                                <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                                    {saving ? <LoaderCircle className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                                    {saving ? 'Saving...' : 'Save account changes'}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminSettingsPage;