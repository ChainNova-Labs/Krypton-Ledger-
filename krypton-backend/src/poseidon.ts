/**
 * Off-chain Poseidon2 commitment matching the on-circuit computation.
 * Uses the same field order as the Noir circuit: [amount, supplier, buyer, salt].
 *
 * In production replace with @aztec/foundation poseidon2 or a Barretenberg WASM call
 * to guarantee byte-for-byte parity with the circuit.
 */
export function computeCommitment(
  invoiceAmount: bigint,
  supplierId:    bigint,
  buyerId:       bigint,
  salt:          bigint,
): `0x${string}` {
  // Placeholder: real implementation calls barretenberg poseidon2_hash
  const inputs = [invoiceAmount, supplierId, buyerId, salt];
  // XOR-fold as a stub — replace with actual Poseidon2 WASM call
  const hash = inputs.reduce((acc, v) => acc ^ v, 0n);
  return `0x${hash.toString(16).padStart(64, '0')}`;
}

export function computeNullifier(commitment: `0x${string}`, supplierId: bigint): `0x${string}` {
  const c = BigInt(commitment);
  const hash = c ^ supplierId;
  return `0x${hash.toString(16).padStart(64, '0')}`;
}
