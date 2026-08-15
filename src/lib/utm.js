export function getUtm() {
  if (typeof window === 'undefined') {
    return { utmSource: '', utmMedium: '', utmCampaign: '', utmContent: '', utmTerm: '', landingPage: '' };
  }
  const p = new URLSearchParams(window.location.search);
  return {
    utmSource: p.get('utm_source') || '',
    utmMedium: p.get('utm_medium') || '',
    utmCampaign: p.get('utm_campaign') || '',
    utmContent: p.get('utm_content') || '',
    utmTerm: p.get('utm_term') || '',
    landingPage: window.location.pathname,
  };
}