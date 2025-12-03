#!/bin/bash
set -e

# Install dependencies
bun install

# Run the development server
bun run dev
