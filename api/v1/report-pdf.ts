/**
 * POST /api/v1/report-pdf — Génération PDF du rapport de parcelle (Phase 1)
 * Body: { parcel, kpis, yield, growth?, recommendations? }
 * Retourne un PDF binaire (application/pdf).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../lib/cors';

// Types pour le body (alignés avec l'app)
interface ParcelData {
  name: string;
  id: string;
  culture: string;
  stage?: string;
  surfaceHa: number;
}

interface KPIData {
  id: string;
  label: string;
  value: string;
  icon: string;
}

interface YieldData {
  parcelName: string;
  parcelId: string;
  expectedHarvest: string;
  yieldKgHa: string;
}

interface ReportBody {
  parcel?: ParcelData;
  kpis?: KPIData[];
  yield?: YieldData;
  growth?: { value: string; trend: string; period: string };
  recommendations?: string[];
  notes?: string;
}

function buildPdfBuffer(body: ReportBody): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // pdfkit en CommonJS côté Node (Vercel)
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const title = 'Rapport de parcelle — SeneGundo';
    doc.fontSize(18).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text("L'intelligence des données pour la réussite de vos récoltes", { align: 'center' });
    doc.moveDown(1.5);

    // Parcelle
    const parcel = body.parcel;
    if (parcel) {
      doc.fontSize(14).font('Helvetica-Bold').text('Parcelle', { continued: false });
      doc.font('Helvetica').fontSize(11);
      doc.text(`Nom : ${parcel.name || '—'}`, { continued: false });
      doc.text(`ID : ${parcel.id || '—'}`, { continued: false });
      doc.text(`Culture(s) : ${parcel.culture || '—'}`, { continued: false });
      doc.text(`Surface : ${parcel.surfaceHa ?? 0} ha`, { continued: false });
      if (parcel.stage) doc.text(`Stade : ${parcel.stage}`, { continued: false });
      doc.moveDown(1);
    }

    // KPIs
    const kpis = body.kpis ?? [];
    if (kpis.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('Indicateurs', { continued: false });
      doc.font('Helvetica').fontSize(11);
      kpis.forEach((k) => {
        doc.text(`${k.icon} ${k.label} : ${k.value}`, { continued: false });
      });
      doc.moveDown(1);
    }

    // Rendement
    const yieldData = body.yield;
    if (yieldData) {
      doc.fontSize(14).font('Helvetica-Bold').text('Rendement estimé', { continued: false });
      doc.font('Helvetica').fontSize(11);
      doc.text(`${yieldData.parcelName} — ${yieldData.parcelId}`, { continued: false });
      doc.text(`Récolte : ${yieldData.expectedHarvest || '—'}`, { continued: false });
      doc.text(`Rendement : ${yieldData.yieldKgHa || '—'}`, { continued: false });
      doc.moveDown(1);
    }

    // Pluviométrie / tendance
    const growth = body.growth;
    if (growth) {
      doc.fontSize(14).font('Helvetica-Bold').text('Pluviométrie', { continued: false });
      doc.font('Helvetica').fontSize(11);
      doc.text(`${growth.value} (tendance ${growth.trend === 'up' ? 'à la hausse' : 'à la baisse'})`, { continued: false });
      doc.moveDown(1);
    }

    // Recommandations
    const recs = body.recommendations ?? [];
    if (recs.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('Recommandations', { continued: false });
      doc.font('Helvetica').fontSize(11);
      recs.forEach((r) => doc.text(`• ${r}`, { continued: false }));
      doc.moveDown(1);
    }

    if (body.notes) {
      doc.fontSize(12).font('Helvetica-Bold').text('Notes', { continued: false });
      doc.font('Helvetica').fontSize(11).text(body.notes, { continued: false });
      doc.moveDown(0.5);
    }

    doc.fontSize(9).fillColor('#666').text(
      `Généré le ${new Date().toLocaleDateString('fr-FR')} — SeneGundo`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );
    doc.end();
  });
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body as ReportBody | undefined;
  if (!body) {
    res.status(400).json({ error: 'Body requis (rapport JSON)' });
    return;
  }

  try {
    const pdfBuffer = await buildPdfBuffer(body);
    const filename = `rapport-senegundo-${body.parcel?.id ?? 'parcelle'}-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', String(pdfBuffer.length));
    res.status(200).send(pdfBuffer);
  } catch (e) {
    console.error('report-pdf error:', e);
    res.status(500).json({
      error: 'Erreur lors de la génération du PDF',
      message: e instanceof Error ? e.message : 'Erreur inconnue',
    });
  }
}
