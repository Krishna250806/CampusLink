import type { Event, Committee } from '../types/campuslink';

/**
 * Encodes an Event & Committee object into a hyper-compact, URL-safe Base64 string.
 * Uses TextEncoder and URL-safe Base64 (- and _ replacing + and /, no trailing padding =).
 * Omits empty fields to produce a minimal string (~120-180 chars) for instant QR scannability.
 */
export function encodeEventPayload(event: Partial<Event>, committee?: Partial<Committee>): string {
  try {
    const obj: Record<string, any> = {};

    if (event.id) obj.id = event.id;
    if (event.title) obj.t = event.title;
    if (event.tagline) obj.g = event.tagline;
    if (event.description) obj.d = event.description.slice(0, 150);
    if (event.posterUrl && !event.posterUrl.startsWith('data:')) obj.p = event.posterUrl;
    if (event.startDate) obj.s = event.startDate;
    if (event.endDate) obj.e = event.endDate;
    if (event.venue) obj.v = event.venue;
    if (event.address) obj.a = event.address;
    if (event.mapsUrl) obj.m = event.mapsUrl;
    if (event.primaryCtaText) obj.c = event.primaryCtaText;
    if (event.primaryCtaUrl) obj.u = event.primaryCtaUrl;
    if (event.themeId && event.themeId !== 'midnight') obj.th = event.themeId;
    if (event.customAccentColor && event.customAccentColor !== '#fafafa') obj.ac = event.customAccentColor;
    if (event.bgSvgPattern && event.bgSvgPattern.length < 100) obj.bg = event.bgSvgPattern;

    if (committee?.name) obj.cn = committee.name;
    if (committee?.handle) obj.ch = committee.handle;
    if (committee?.logoUrl && committee.logoUrl.length < 500) obj.cl = committee.logoUrl;

    if (Array.isArray(event.links) && event.links.length > 0) {
      obj.l = event.links.slice(0, 6).map(link => ({
        t: link.title,
        u: link.url,
        i: link.icon !== 'Link' ? link.icon : undefined,
        tp: link.type !== 'custom' ? link.type : undefined,
        f: link.featured ? 1 : undefined
      }));
    }

    const jsonStr = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(jsonStr);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    // Make URL-safe (+ -> -, / -> _, strip =)
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    console.error('Failed to encode event payload:', e);
    return '';
  }
}

/**
 * Decodes a URL-safe Base64 payload back into Event and Committee partial objects.
 */
export function decodeEventPayload(encoded: string): { event: Partial<Event>; committee?: Partial<Committee> } | null {
  if (!encoded) return null;
  try {
    // Revert URL-safe characters (- -> +, _ -> /)
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(jsonStr);

    if (!parsed || typeof parsed !== 'object') return null;

    const rawLinks = parsed.l || parsed.links || [];
    const parsedLinks = Array.isArray(rawLinks) ? rawLinks.map((l: any, idx: number) => ({
      id: l.id || `lnk_dyn_${idx}`,
      title: l.t || l.title || 'Link',
      url: l.u || l.url || '#',
      icon: l.i || l.icon || 'ExternalLink',
      description: l.d || l.description || '',
      type: l.tp || l.type || 'custom',
      featured: Boolean(l.f ?? l.featured),
      visible: true,
      sortOrder: idx + 1,
      clickCount: 0
    })) : [];

    const event: Partial<Event> = {
      id: parsed.id || parsed.eventId,
      title: parsed.t || parsed.title,
      tagline: parsed.g || parsed.tagline,
      description: parsed.d || parsed.description,
      posterUrl: parsed.p || parsed.posterUrl,
      startDate: parsed.s || parsed.startDate,
      endDate: parsed.e || parsed.endDate,
      venue: parsed.v || parsed.venue,
      address: parsed.a || parsed.address,
      mapsUrl: parsed.m || parsed.mapsUrl,
      primaryCtaText: parsed.c || parsed.primaryCtaText,
      primaryCtaUrl: parsed.u || parsed.primaryCtaUrl,
      themeId: parsed.th || parsed.themeId,
      customAccentColor: parsed.ac || parsed.customAccentColor,
      bgSvgPattern: parsed.bg || parsed.bgSvgPattern,
      links: parsedLinks
    };

    const committee: Partial<Committee> = {
      name: parsed.cn || parsed.committeeName,
      handle: parsed.ch || parsed.committeeHandle,
      logoUrl: parsed.cl || parsed.committeeLogoUrl
    };

    return { event, committee };
  } catch (e) {
    console.error('Failed to decode event payload:', e);
    return null;
  }
}
