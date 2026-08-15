import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    if (!body.name || !String(body.name).trim()) {
      return Response.json({ error: 'missing_field', field: 'name' }, { status: 400 });
    }
    if (!body.phone || !String(body.phone).trim()) {
      return Response.json({ error: 'missing_field', field: 'phone' }, { status: 400 });
    }

    const lead = await base44.asServiceRole.entities.Lead.create({
      leadType: body.leadType || 'consultation',
      name: String(body.name).trim(),
      phone: String(body.phone).trim(),
      email: String(body.email || '').trim(),
      message: body.message || '',
      productId: body.productId || '',
      variantSKU: body.variantSKU || '',
      configuration: body.configuration || '',
      quizResult: body.quizResult || '',
      fabricSamples: Array.isArray(body.fabricSamples) ? body.fabricSamples : [],
      utmSource: body.utmSource || '',
      utmMedium: body.utmMedium || '',
      utmCampaign: body.utmCampaign || '',
      utmContent: body.utmContent || '',
      utmTerm: body.utmTerm || '',
      landingPage: body.landingPage || '',
      status: 'new',
    });

    return Response.json({ id: lead.id, status: 'new' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}