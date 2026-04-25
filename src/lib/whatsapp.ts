const WHATSAPP_PHONE_NUMBER = '923210682000';
const WHATSAPP_BASE_URL = 'https://api.whatsapp.com/send';

export const buildWhatsAppChatUrl = (text?: string) => {
  const params = new URLSearchParams({ phone: WHATSAPP_PHONE_NUMBER });

  if (text?.trim()) {
    params.set('text', text);
  }

  return `${WHATSAPP_BASE_URL}?${params.toString()}`;
};

export const WHATSAPP_COMMUNITY_MESSAGE =
  'Hi! I want to join the Eighty Plus WhatsApp community. Please share the invite link.';

export const WHATSAPP_COMMUNITY_URL = buildWhatsAppChatUrl(WHATSAPP_COMMUNITY_MESSAGE);
