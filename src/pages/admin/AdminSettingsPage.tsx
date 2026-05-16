import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, ShieldCheck, Truck, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToastAction } from '@/components/ui/toast';
import { toast } from '@/hooks/use-toast';
import { getCurrentSession, getCurrentUser, updateAdminCredentials } from '@/lib/adminAuth';
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { fetchSiteSettings, saveSiteSettings, DisplayPlacement, type SiteSettings } from '@/hooks/useSiteSettings';
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

    // Business info states
    const [locationText, setLocationText] = useState('');
    const [locationPlacement, setLocationPlacement] = useState<DisplayPlacement[]>(['footer']);
    const [peakHoursText, setPeakHoursText] = useState('');
    const [peakHoursPlacement, setPeakHoursPlacement] = useState<DisplayPlacement[]>(['footer']);
    const [availabilityText, setAvailabilityText] = useState('');
    const [availabilityPlacement, setAvailabilityPlacement] = useState<DisplayPlacement[]>(['footer']);
    const [phoneText, setPhoneText] = useState('');
    const [phonePlacement, setPhonePlacement] = useState<DisplayPlacement[]>(['footer']);
    const [emailText, setEmailText] = useState('');
    const [emailPlacement, setEmailPlacement] = useState<DisplayPlacement[]>(['footer']);
    const [mapEmbedUrl, setMapEmbedUrl] = useState('');
    // Social links
    const [instagramUrl, setInstagramUrl] = useState('');
    const [instagramPlacement, setInstagramPlacement] = useState<DisplayPlacement[]>(['footer']);
    const [facebookUrl, setFacebookUrl] = useState('');
    const [facebookPlacement, setFacebookPlacement] = useState<DisplayPlacement[]>(['footer']);
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [whatsappPlacement, setWhatsappPlacement] = useState<DisplayPlacement[]>(['footer']);
    const [savingSiteSettings, setSavingSiteSettings] = useState(false);
    const siteSettingsRestoreRef = useRef<SiteSettings | null>(null);

    useEffect(() => {
        let isMounted = true;

        const initializeData = async () => {
            try {
                // 1. Fetch User
                const user = await getCurrentUser();
                if (isMounted) setEmail(user?.email ?? '');

                // 2. Fetch Delivery Fee and business settings from Supabase
                const [{ data: feeData, error: feeError }, siteSettings] = await Promise.all([
                    supabase
                        .from('app_settings' as any)
                        .select('value')
                        .eq('key', 'delivery_fee')
                        .maybeSingle(),
                    fetchSiteSettings(),
                ] as const);

                if (feeError) {
                    console.error("Fetch error:", feeError.message);
                }

                if (isMounted && feeData) {
                    setDeliveryFeeInput(String((feeData as any).value));
                }

                    if (isMounted && siteSettings) {
                    setLocationText(siteSettings.site_location ?? '');
                    setLocationPlacement(Array.isArray(siteSettings.site_location_placement) ? siteSettings.site_location_placement : (siteSettings.site_location_placement ? [siteSettings.site_location_placement] : ['footer']));
                    setPeakHoursText(siteSettings.site_peak_hours ?? '');
                    setPeakHoursPlacement(Array.isArray(siteSettings.site_peak_hours_placement) ? siteSettings.site_peak_hours_placement : (siteSettings.site_peak_hours_placement ? [siteSettings.site_peak_hours_placement] : ['footer']));
                    setAvailabilityText(siteSettings.site_availability ?? '');
                    setAvailabilityPlacement(Array.isArray(siteSettings.site_availability_placement) ? siteSettings.site_availability_placement : (siteSettings.site_availability_placement ? [siteSettings.site_availability_placement] : ['footer']));
                    setPhoneText(siteSettings.site_phone ?? '');
                    setPhonePlacement(Array.isArray(siteSettings.site_phone_placement) ? siteSettings.site_phone_placement : (siteSettings.site_phone_placement ? [siteSettings.site_phone_placement] : ['footer']));
                    setEmailText(siteSettings.site_email ?? '');
                    setEmailPlacement(Array.isArray(siteSettings.site_email_placement) ? siteSettings.site_email_placement : (siteSettings.site_email_placement ? [siteSettings.site_email_placement] : ['footer']));
                    setMapEmbedUrl(siteSettings.site_map_embed_url ?? '');
                    setInstagramUrl(siteSettings.site_instagram_url ?? '');
                    setInstagramPlacement(Array.isArray(siteSettings.site_instagram_placement) ? siteSettings.site_instagram_placement : (siteSettings.site_instagram_placement ? [siteSettings.site_instagram_placement] : ['footer']));
                    setFacebookUrl(siteSettings.site_facebook_url ?? '');
                    setFacebookPlacement(Array.isArray(siteSettings.site_facebook_placement) ? siteSettings.site_facebook_placement : (siteSettings.site_facebook_placement ? [siteSettings.site_facebook_placement] : ['footer']));
                    setWhatsappNumber(siteSettings.site_whatsapp_number ?? '');
                    setWhatsappPlacement(Array.isArray(siteSettings.site_whatsapp_placement) ? siteSettings.site_whatsapp_placement : (siteSettings.site_whatsapp_placement ? [siteSettings.site_whatsapp_placement] : ['footer']));
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

    const restorePreviousSiteSettings = async () => {
        if (!siteSettingsRestoreRef.current) return;

        try {
            setSavingSiteSettings(true);
            const previous = siteSettingsRestoreRef.current;
            const { error } = await saveSiteSettings(previous);

            if (error) {
                throw error;
            }

            setLocationText(previous.site_location ?? '');
            setLocationPlacement(Array.isArray(previous.site_location_placement) ? previous.site_location_placement : (previous.site_location_placement ? [previous.site_location_placement] : ['footer']));
            setPeakHoursText(previous.site_peak_hours ?? '');
            setPeakHoursPlacement(Array.isArray(previous.site_peak_hours_placement) ? previous.site_peak_hours_placement : (previous.site_peak_hours_placement ? [previous.site_peak_hours_placement] : ['footer']));
            setAvailabilityText(previous.site_availability ?? '');
            setAvailabilityPlacement(Array.isArray(previous.site_availability_placement) ? previous.site_availability_placement : (previous.site_availability_placement ? [previous.site_availability_placement] : ['footer']));
            setPhoneText(previous.site_phone ?? '');
            setPhonePlacement(Array.isArray(previous.site_phone_placement) ? previous.site_phone_placement : (previous.site_phone_placement ? [previous.site_phone_placement] : ['footer']));
            setEmailText(previous.site_email ?? '');
            setEmailPlacement(Array.isArray(previous.site_email_placement) ? previous.site_email_placement : (previous.site_email_placement ? [previous.site_email_placement] : ['footer']));
            setInstagramUrl(previous.site_instagram_url ?? '');
            setInstagramPlacement(Array.isArray(previous.site_instagram_placement) ? previous.site_instagram_placement : (previous.site_instagram_placement ? [previous.site_instagram_placement] : ['footer']));
            setFacebookUrl(previous.site_facebook_url ?? '');
            setFacebookPlacement(Array.isArray(previous.site_facebook_placement) ? previous.site_facebook_placement : (previous.site_facebook_placement ? [previous.site_facebook_placement] : ['footer']));
            setWhatsappNumber(previous.site_whatsapp_number ?? '');
            setWhatsappPlacement(Array.isArray(previous.site_whatsapp_placement) ? previous.site_whatsapp_placement : (previous.site_whatsapp_placement ? [previous.site_whatsapp_placement] : ['footer']));
            setMapEmbedUrl(previous.site_map_embed_url ?? '');

            toast({
                title: 'Site settings restored',
                description: 'Previous values have been reapplied.',
            });
            siteSettingsRestoreRef.current = null;
        } catch (error: any) {
            toast({
                title: 'Restore failed',
                description: error.message || 'Unable to restore previous settings.',
                variant: 'destructive',
            });
        } finally {
            setSavingSiteSettings(false);
        }
    };

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

    const handleSaveSiteInfo = async () => {
        setSavingSiteSettings(true);

        try {
            const currentSettings = await fetchSiteSettings();
            siteSettingsRestoreRef.current = currentSettings;

            const { error } = await saveSiteSettings({
                site_location: locationText,
                    site_location_placement: locationPlacement,
                site_peak_hours: peakHoursText,
                    site_peak_hours_placement: peakHoursPlacement,
                site_availability: availabilityText,
                    site_availability_placement: availabilityPlacement,
                site_phone: phoneText,
                    site_phone_placement: phonePlacement,
                site_email: emailText,
                    site_email_placement: emailPlacement,
                    site_instagram_url: instagramUrl,
                    site_instagram_placement: instagramPlacement,
                    site_facebook_url: facebookUrl,
                    site_facebook_placement: facebookPlacement,
                    site_whatsapp_number: whatsappNumber,
                    site_whatsapp_placement: whatsappPlacement,
                site_map_embed_url: mapEmbedUrl,
            });

            if (error) {
                throw error;
            }

            toast({
                title: 'Site settings saved',
                description: 'Location, hours, and contact settings have been updated.',
                action: (
                    <ToastAction altText="Undo site settings" onClick={restorePreviousSiteSettings}>
                        Undo
                    </ToastAction>
                ),
                duration: 60000,
            });
        } catch (error: any) {
            console.error('Save site settings failed:', error);
            toast({
                title: 'Save failed',
                description: error.message || 'Unable to update site settings.',
                variant: 'destructive',
            });
        } finally {
            setSavingSiteSettings(false);
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

                {/* BUSINESS INFO CARD */}
                <Card className="shadow-sm border-stone-200">
                    <CardHeader>
                        <CardTitle>Business Info</CardTitle>
                        <CardDescription>
                            Control the displayed location, peak hours, availability, contact details, and map embed for the site.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <LoaderCircle className="h-4 w-4 animate-spin" /> Loading...
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="site-location">Location text</Label>
                                    <Input
                                        id="site-location"
                                        value={locationText}
                                        onChange={(e) => setLocationText(e.target.value)}
                                        placeholder="164-A, Sector C, Gulmohar, Bahria Town, Lahore"
                                    />
                                    <Label>Show location in</Label>
                                    <div className="flex gap-4">
                                        {(['header','footer','page'] as DisplayPlacement[]).map((p) => (
                                            <label key={p} className="inline-flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={locationPlacement.includes(p)}
                                                    onChange={() => setLocationPlacement((prev) => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                                                    className="rounded"
                                                />
                                                <span className="capitalize">{p}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="site-peak-hours">Peak hours</Label>
                                    <Input
                                        id="site-peak-hours"
                                        value={peakHoursText}
                                        onChange={(e) => setPeakHoursText(e.target.value)}
                                        placeholder="Mon–Fri: 7 AM – 9 PM; Sat–Sun: 8 AM – 10 PM"
                                    />
                                    <Label>Show peak hours in</Label>
                                    <div className="flex gap-4">
                                        {(['header','footer','page'] as DisplayPlacement[]).map((p) => (
                                            <label key={p} className="inline-flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={peakHoursPlacement.includes(p)}
                                                    onChange={() => setPeakHoursPlacement((prev) => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                                                    className="rounded"
                                                />
                                                <span className="capitalize">{p}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="site-availability">Availability</Label>
                                    <Input
                                        id="site-availability"
                                        value={availabilityText}
                                        onChange={(e) => setAvailabilityText(e.target.value)}
                                        placeholder="Open daily from 7 AM to 10 PM"
                                    />
                                    <Label>Show availability in</Label>
                                    <div className="flex gap-4">
                                        {(['header','footer','page'] as DisplayPlacement[]).map((p) => (
                                            <label key={p} className="inline-flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={availabilityPlacement.includes(p)}
                                                    onChange={() => setAvailabilityPlacement((prev) => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                                                    className="rounded"
                                                />
                                                <span className="capitalize">{p}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="site-phone">Phone number</Label>
                                    <Input
                                        id="site-phone"
                                        type="tel"
                                        value={phoneText}
                                        onChange={(e) => setPhoneText(e.target.value)}
                                        placeholder="+92 321 0682000"
                                    />
                                    <Label>Show phone in</Label>
                                    <div className="flex gap-4">
                                        {(['header','footer','page'] as DisplayPlacement[]).map((p) => (
                                            <label key={p} className="inline-flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={phonePlacement.includes(p)}
                                                    onChange={() => setPhonePlacement((prev) => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                                                    className="rounded"
                                                />
                                                <span className="capitalize">{p}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="site-email">Email address</Label>
                                    <Input
                                        id="site-email"
                                        type="email"
                                        value={emailText}
                                        onChange={(e) => setEmailText(e.target.value)}
                                        placeholder="hello@eightyplus.com"
                                    />
                                    <Label>Show email in</Label>
                                    <div className="flex gap-4">
                                        {(['header','footer','page'] as DisplayPlacement[]).map((p) => (
                                            <label key={p} className="inline-flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={emailPlacement.includes(p)}
                                                    onChange={() => setEmailPlacement((prev) => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                                                    className="rounded"
                                                />
                                                <span className="capitalize">{p}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                    {/* SOCIAL LINKS */}
                                    <div className="grid gap-3">
                                        <Label htmlFor="site-instagram">Instagram URL</Label>
                                        <Input
                                            id="site-instagram"
                                            type="url"
                                            value={instagramUrl}
                                            onChange={(e) => setInstagramUrl(e.target.value)}
                                            placeholder="https://www.instagram.com/yourprofile"
                                        />
                                        <Label>Show Instagram in</Label>
                                        <div className="flex gap-4">
                                            {(['header','footer','page'] as DisplayPlacement[]).map((p) => (
                                                <label key={p + 'ig'} className="inline-flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={instagramPlacement.includes(p)}
                                                        onChange={() => setInstagramPlacement((prev) => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                                                        className="rounded"
                                                    />
                                                    <span className="capitalize">{p}</span>
                                                </label>
                                            ))}
                                        </div>

                                        <Label htmlFor="site-facebook">Facebook URL</Label>
                                        <Input
                                            id="site-facebook"
                                            type="url"
                                            value={facebookUrl}
                                            onChange={(e) => setFacebookUrl(e.target.value)}
                                            placeholder="https://www.facebook.com/yourpage"
                                        />
                                        <Label>Show Facebook in</Label>
                                        <div className="flex gap-4">
                                            {(['header','footer','page'] as DisplayPlacement[]).map((p) => (
                                                <label key={p + 'fb'} className="inline-flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={facebookPlacement.includes(p)}
                                                        onChange={() => setFacebookPlacement((prev) => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                                                        className="rounded"
                                                    />
                                                    <span className="capitalize">{p}</span>
                                                </label>
                                            ))}
                                        </div>

                                        <Label htmlFor="site-whatsapp">WhatsApp number</Label>
                                        <Input
                                            id="site-whatsapp"
                                            type="tel"
                                            value={whatsappNumber}
                                            onChange={(e) => setWhatsappNumber(e.target.value)}
                                            placeholder="+923210682000"
                                        />
                                        <Label>Show WhatsApp in</Label>
                                        <div className="flex gap-4">
                                            {(['header','footer','page'] as DisplayPlacement[]).map((p) => (
                                                <label key={p + 'wa'} className="inline-flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={whatsappPlacement.includes(p)}
                                                        onChange={() => setWhatsappPlacement((prev) => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                                                        className="rounded"
                                                    />
                                                    <span className="capitalize">{p}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="site-map-embed-url">Map embed URL</Label>
                                    <Input
                                        id="site-map-embed-url"
                                        type="url"
                                        value={mapEmbedUrl}
                                        onChange={(e) => setMapEmbedUrl(e.target.value)}
                                        placeholder="https://www.google.com/maps?q=Example&output=embed"
                                    />
                                    <p className="text-[11px] text-stone-400 italic">
                                        Paste the Google Maps embed URL you want the About page to use.
                                    </p>
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={handleSaveSiteInfo} disabled={savingSiteSettings} className="bg-[#5D3A26] hover:bg-[#432a1b] text-white">
                                        {savingSiteSettings ? (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save site info
                                            </>
                                        )}
                                    </Button>
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