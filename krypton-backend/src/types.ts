/** Private witness — never leaves the backend */
export interface InvoiceWitness {
  invoice_amount: bigint;
  supplier_id:    bigint;
  buyer_id:       bigint;
  invoice_salt:   bigint;
}

/** Public proof payload sent to the frontend / Soroban */
export interface InvoiceProof {
  commitment:       `0x${string}`;
  eligibility_hash: `0x${string}`;
  nullifier:        `0x${string}`;
  proof_bytes:      string;          // hex-encoded Uint8Array
  public_inputs:    `0x${string}`[];
}

export type ProveResult =
  | { ok: true;  proof: InvoiceProof }
  | { ok: false; error: string };
