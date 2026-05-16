import type { Request, Response } from 'express';
import { proveInvoice } from '../prover.js';
import type { InvoiceWitness, ProveResult } from '../types.js';

interface ProveRequestBody {
  invoice_amount: string;  // bigint serialized as decimal string
  supplier_id:    string;
  buyer_id:       string;
  invoice_salt:   string;
}

function parseWitness(body: ProveRequestBody): InvoiceWitness {
  return {
    invoice_amount: BigInt(body.invoice_amount),
    supplier_id:    BigInt(body.supplier_id),
    buyer_id:       BigInt(body.buyer_id),
    invoice_salt:   BigInt(body.invoice_salt),
  };
}

export async function proveFactoringRoute(
  req: Request<object, ProveResult, ProveRequestBody>,
  res: Response<ProveResult>,
): Promise<void> {
  const { invoice_amount, supplier_id, buyer_id, invoice_salt } = req.body;

  if (!invoice_amount || !supplier_id || !buyer_id || !invoice_salt) {
    res.status(400).json({ ok: false, error: 'Missing required fields' });
    return;
  }

  try {
    const witness = parseWitness(req.body);
    const proof   = await proveInvoice(witness);
    res.json({ ok: true, proof });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ ok: false, error: message });
  }
}
