#!/bin/bash
set -e

echo "Building contracts..."
cd contracts
cargo build --release --target wasm32v1-none
echo "Build complete!"
ls -la target/wasm32v1-none/release/*.wasm
