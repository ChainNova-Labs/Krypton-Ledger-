# Krypton Ledger — AI Context Layer

## Project Identity
**Name:** Krypton Ledger (ZK-Shielded Factoring)
**Program:** Stellar Drips Wave 5
**Purpose:** Enterprise privacy-first invoice factoring on Stellar using ZK proofs.

## Architecture (Poly-Repo)
```
/krypton-contracts   Rust/Soroban contracts + Noir circuits
/krypton-backend     Node.js/TypeScript off-chain proving service
/krypton-frontend    Next.js 14 frontend + Stellar Wallet SDK
```

## Target Environment
- **Chain:** Stellar / Soroban
- **Protocol:** 26 "Yardstick" (primary), 25 "X-Ray" primitives
- **ZK Stack:** NoirLang (Ultrahonk / UltraPlonk), Barretenberg backend
- **Host Functions (CAP-0080):** `bn254_multi_pairing_check`, `bn254_fr_add`, `bn254_fr_sub`, `bn254_fr_mul`, `bn254_fr_pow`
- **Hash Functions (X-Ray):** `poseidon_hash`, `poseidon2_hash` (nullifiers & commitments)
- **Integer Safety (CAP-0082):** `checked_add`, `checked_mul` for discount arithmetic

## Cross-Repo Data Schemas

### InvoiceWitness (private, Noir circuit input)
```typescript
interface InvoiceWitness {
  invoice_amount: bigint;   // u128, field element
  supplier_id:    bigint;   // u64, field element
  buyer_id:       bigint;   // u64, field element
  invoice_salt:   bigint;   // u128, random blinding factor
}
```

### InvoiceProof (public, on-chain submission)
```typescript
interface InvoiceProof {
  commitment:        `0x${string}`;  // Poseidon(amount, supplier_id, buyer_id, salt)
  eligibility_hash:  `0x${string}`;  // public output from Noir circuit
  proof_bytes:       Uint8Array;     // serialized Ultrahonk proof
  public_inputs:     `0x${string}`[];
}
```

### Soroban Contract Call
```rust
// verify_invoice_proof(env, proof_bytes: Bytes, public_inputs: Vec<BytesN<32>>) -> bool
```

## Coding Standards

### TypeScript (krypton-backend, krypton-frontend)
- **Strict mode:** `"strict": true` — zero `any`, zero implicit `any`
- All async functions return `Promise<T>` with explicit `T`
- Error handling: typed `Result<T, E>` pattern or discriminated unions — no raw `throw` in library code
- Imports: ESM only (`"type": "module"`)
- Formatter: Prettier, 2-space indent, single quotes

### Rust (krypton-contracts)
- Edition 2021
- Explicit error types via `thiserror` or `soroban_sdk::contracterror`
- No `unwrap()` in contract code — use `?` or explicit `panic!` with message
- All public contract functions annotated with `#[contractimpl]`

### Noir (krypton-contracts/circuits)
- Nargo version: `>=0.36.0`
- All private inputs prefixed with `priv_` convention in comments
- Poseidon2 preferred over Poseidon for new commitments (X-Ray native)

## Key Invariants
1. Invoice commitment is computed **off-chain** (backend) and verified **on-chain** (Soroban).
2. Proof bytes flow: Noir prover → `/api/prove-factoring` → frontend → Soroban `verify_invoice_proof`.
3. Nullifiers prevent double-factoring; stored in a Soroban `Map<BytesN<32>, bool>`.
4. Discount arithmetic uses CAP-0082 checked ops — overflow panics the contract safely.
