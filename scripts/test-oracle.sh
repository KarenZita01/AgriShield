#!/bin/bash
set -e

echo "Testing oracle..."
cd oracle
npm test
echo "Oracle tests passed!"
