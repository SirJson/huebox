#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
pushd "$DIR"
deno run --unstable --allow-all --import-map=./import_map.json ./main.ts
popd
