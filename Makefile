.PHONY: build-contracts test-circuits run-backend dev-all

build-contracts:
	cd krypton-contracts && cargo build --target wasm32-unknown-unknown --release

test-circuits:
	cd krypton-contracts/circuits/factoring && nargo test

run-backend:
	cd krypton-backend && npm run dev

dev-all:
	$(MAKE) -j3 build-contracts run-backend \
		&& cd krypton-frontend && npm run dev
