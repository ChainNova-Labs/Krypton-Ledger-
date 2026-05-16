import { Noir } from '@noir-lang/noir_js';
import { UltraHonkBackend } from '@noir-lang/backend_barretenberg';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeCommitment, computeNullifier } from './poseidon.js';
import type { InvoiceWitness, InvoiceProof } from './types.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const CIRCUIT_PATH = join(__dir, '../../krypton-contracts/circuits/factoring/target/factoring.json');

let _noir: Noir | null = null;
let _backend: UltraHonkBackend | null = null;

async function getProver(): Promise<{ noir: Noir; backend: UltraHonkBackend }> {
  if (_noir && _backend) return { noir: _noir, backend: _backend };

  const circuitJson = JSON.parse(await readFile(CIRCUIT_PATH, 'utf-8')) as object;
  _backend = new UltraHonkBackend(circuitJson);
  _noir    = new Noir(circuitJson, _backend);
  return { noir: _noir, backend: _backend };
}

export async function proveInvoice(witness: InvoiceWitness): Promise<InvoiceProof> {
  const { noir } = await getProver();

  const commitment = computeCommitment(
    witness.invoice_amount,
    witness.supplier_id,
    witness.buyer_id,
    witness.invoice_salt,
  );

  const nullifier = computeNullifier(commitment, witness.supplier_id);

  const { proof, publicInputs } = await noir.generateProof({
    priv_invoice_amount: witness.invoice_amount.toString(),
    priv_supplier_id:    witness.supplier_id.toString(),
    priv_buyer_id:       witness.buyer_id.toString(),
    priv_invoice_salt:   witness.invoice_salt.toString(),
    pub_commitment:      BigInt(commitment).toString(),
    pub_eligibility:     '1',
  });

  const proofHex = Buffer.from(proof).toString('hex');
  const pubInputsHex = publicInputs.map(
    (b: Uint8Array) => `0x${Buffer.from(b).toString('hex')}` as `0x${string}`,
  );

  return {
    commitment,
    eligibility_hash: pubInputsHex[1] ?? '0x00',
    nullifier,
    proof_bytes:   proofHex,
    public_inputs: pubInputsHex,
  };
}
