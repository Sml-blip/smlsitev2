import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resend = new Resend('re_Q6PqJ9b9_BNnU4C2NQ9qL6SYj7PNpeLWo');

function buildAdminEmailHtml(order: {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  total: number;
  status: string;
  date: string;
  items: Array<{ name: string; price: number; quantity: number }>;
}) {
  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#374151;">${item.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#374151;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#374151;text-align:right;">${(item.price * item.quantity).toLocaleString('fr-TN')} TND</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Nouvelle Commande</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#111827;padding:28px 32px;text-align:center;">
      <p style="color:#9ca3af;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">SML INFORMATIQUE</p>
      <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0;">Nouvelle commande reçue</h1>
    </div>

    <!-- Order ref banner -->
    <div style="background:#f0fdf4;border-bottom:1px solid #d1fae5;padding:14px 32px;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:13px;color:#6b7280;">Référence</span>
      <span style="font-size:14px;font-weight:700;font-family:monospace;color:#111827;">${order.orderNumber}</span>
    </div>

    <div style="padding:28px 32px;">

      <!-- Customer info -->
      <h2 style="font-size:13px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin:0 0 14px;">Informations client</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="padding:8px 12px;background:#f9fafb;border-radius:8px 8px 0 0;border-bottom:1px solid #f0f0f0;">
            <span style="font-size:12px;color:#9ca3af;">Nom</span><br/>
            <span style="font-size:14px;font-weight:600;color:#111827;">${order.customerName}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#f9fafb;border-bottom:1px solid #f0f0f0;">
            <span style="font-size:12px;color:#9ca3af;">Téléphone</span><br/>
            <span style="font-size:14px;font-weight:600;color:#111827;">${order.phone || '—'}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#f9fafb;border-radius:0 0 8px 8px;">
            <span style="font-size:12px;color:#9ca3af;">Adresse</span><br/>
            <span style="font-size:14px;font-weight:600;color:#111827;">${order.address || '—'}</span>
          </td>
        </tr>
      </table>

      <!-- Items -->
      <h2 style="font-size:13px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin:0 0 14px;">Articles commandés</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #f0f0f0;margin-bottom:16px;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:10px 12px;font-size:12px;font-weight:600;color:#6b7280;text-align:left;">Produit</th>
            <th style="padding:10px 12px;font-size:12px;font-weight:600;color:#6b7280;text-align:center;">Qté</th>
            <th style="padding:10px 12px;font-size:12px;font-weight:600;color:#6b7280;text-align:right;">Prix</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>

      <!-- Total -->
      <div style="background:#111827;border-radius:10px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;">
        <span style="color:#9ca3af;font-size:14px;">Total commande</span>
        <span style="color:#ffffff;font-size:18px;font-weight:700;font-family:monospace;">${order.total.toLocaleString('fr-TN')} TND</span>
      </div>

      <!-- Status -->
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;">
        <p style="margin:0;font-size:13px;color:#92400e;">
          ⏳ <strong>Statut :</strong> ${order.status} — Contactez le client au <strong>${order.phone || '—'}</strong> pour confirmer la livraison.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;border-top:1px solid #f0f0f0;padding:18px 32px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">SML Informatique · Tunis, Tunisie · ${order.date}</p>
    </div>
  </div>
</body>
</html>`;
}

async function sendWhatsAppConfirmation(params: {
  phone: string;
  customerName: string;
  orderNumber: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  total: number;
  address: string;
}) {
  const API_KEY = 'sz_live_583b7d4d-d5cd-4f51-9350-d71295ac4af4';
  const FROM = '21648028729'; // SML WhatsApp Business number

  // Normalize recipient to E.164 with + prefix (as required by SendZen)
  let digits = params.phone.replace(/\s+/g, '').replace(/^\+/, '');
  if (!digits.startsWith('216')) digits = `216${digits}`;
  const to = `+${digits}`;

  const res = await fetch('https://api.sendzen.io/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM,
      to,
      type: 'template',
      template: {
        name: 'order_confirmation',
        lang_code: 'fr',
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: params.customerName },
              { type: 'text', text: params.orderNumber },
              { type: 'text', text: String(params.total) },
              { type: 'text', text: params.address },
            ],
          },
        ],
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SendZen error ${res.status}: ${err}`);
  }
  return res.json();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (phone) {
      // Normalize: strip spaces and leading +
      const normalized = phone.replace(/\s+/g, '').replace(/^\+/, '');
      query = query.ilike('phone', `%${normalized}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const orders = data.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      email: order.email,
      phone: order.phone,
      address: order.address,
      city: order.city,
      zip: order.zip,
      date: new Date(order.created_at).toLocaleDateString('fr-FR'),
      status: order.status,
      total: order.total,
      items: order.items
    }));

    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();

    const orderNumber = `ORD-${Date.now()}`;

    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: body.customerName,
        email: body.email,
        phone: body.phone || '',
        address: body.address || '',
        city: body.city || '',
        zip: body.zip || '',
        status: 'En attente',
        total: body.total || 0,
        items: body.items || []
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const orderDate = new Date(data.created_at).toLocaleDateString('fr-FR');

    // Send notification email to admin (fire-and-forget, don't block the response)
    resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'sml.shop.2024@gmail.com',
      subject: `🛒 Nouvelle commande ${data.order_number} — ${body.customerName}`,
      html: buildAdminEmailHtml({
        orderNumber: data.order_number,
        customerName: body.customerName,
        phone: body.phone || '',
        address: body.address || '',
        total: data.total,
        status: data.status,
        date: orderDate,
        items: body.items || [],
      }),
    }).catch((err: Error) => {
      console.error('[Resend] Failed to send order email:', err.message);
    });

    // Send WhatsApp confirmation to client (awaited so it completes before response)
    if (body.phone) {
      try {
        await sendWhatsAppConfirmation({
          phone: body.phone,
          customerName: body.customerName,
          orderNumber: orderNumber,
          items: body.items || [],
          total: data.total,
          address: body.address || '',
        });
      } catch (err: any) {
        console.error('[SendZen] WhatsApp failed:', err.message);
      }
    }

    return NextResponse.json({
      id: data.id,
      orderNumber: data.order_number,
      customerName: data.customer_name,
      email: data.email,
      date: orderDate,
      status: data.status,
      total: data.total,
      items: data.items
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
