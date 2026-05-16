import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type DisplayPlacement = "header" | "footer" | "page";

export type SiteSettings = {
  site_location?: string;
  site_location_placement?: DisplayPlacement | DisplayPlacement[];
  site_peak_hours?: string;
  site_peak_hours_placement?: DisplayPlacement | DisplayPlacement[];
  site_availability?: string;
  site_availability_placement?: DisplayPlacement | DisplayPlacement[];
  site_phone?: string;
  site_phone_placement?: DisplayPlacement | DisplayPlacement[];
  site_email?: string;
  site_email_placement?: DisplayPlacement | DisplayPlacement[];
  site_map_embed_url?: string;
  site_instagram_url?: string;
  site_facebook_url?: string;
  site_whatsapp_number?: string;
  site_instagram_placement?: DisplayPlacement | DisplayPlacement[];
  site_facebook_placement?: DisplayPlacement | DisplayPlacement[];
  site_whatsapp_placement?: DisplayPlacement | DisplayPlacement[];
};

const SITE_SETTING_KEYS = [
  "site_location",
  "site_location_placement",
  "site_peak_hours",
  "site_peak_hours_placement",
  "site_availability",
  "site_availability_placement",
  "site_phone",
  "site_phone_placement",
  "site_email",
  "site_email_placement",
  "site_map_embed_url",
  "site_instagram_url",
  "site_facebook_url",
  "site_whatsapp_number",
  "site_instagram_placement",
  "site_facebook_placement",
  "site_whatsapp_placement",
] as const;

export const fetchSiteSettings = async () => {
  const { data, error } = await supabase
    .from("app_settings" as any)
    .select("key, value")
    .in("key", SITE_SETTING_KEYS as readonly string[]);

  if (error) {
    throw error;
  }

  return (data ?? []).reduce<SiteSettings>((acc, item) => {
    if (item?.key) {
      const raw = item.value;

      // Try to parse JSON arrays/objects used for multi-placement values
      let parsed: any = raw;
      if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
          try {
            parsed = JSON.parse(trimmed);
          } catch (e) {
            // leave as string if parse fails
            parsed = raw;
          }
        }
      }

      acc[item.key as keyof SiteSettings] = parsed ?? undefined;
    }
    return acc;
  }, {});
};

export const saveSiteSettings = async (settings: SiteSettings) => {
  const payload = Object.entries(settings)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      // Serialize arrays/objects so they persist in a single-value settings table
      const stored = Array.isArray(value) || (typeof value === 'object' && value !== null)
        ? JSON.stringify(value)
        : value;
      return { key, value: stored };
    });

  if (payload.length === 0) {
    return { error: null };
  }

  return await supabase.from("app_settings" as any).upsert(payload, { onConflict: "key" });
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    setLoading(true);
    try {
      const loaded = await fetchSiteSettings();
      setSettings(loaded);
    } catch (err) {
      console.error("Failed to load site settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  return { settings, loading, refreshSettings };
};
