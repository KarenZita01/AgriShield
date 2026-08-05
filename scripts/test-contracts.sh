#!/bin/bash
set -e

echo "Testing contracts..."
cd contracts
cargo test
echo "All tests passed!"
