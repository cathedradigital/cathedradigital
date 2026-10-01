#!/bin/bash
# Configure the Cathedra Digital Supabase project.
#
# This script intentionally contains NO credentials. Authenticate with the
# Supabase CLI before running it (for example: `supabase login`).
#
# Production project: isojguvcnfncokoxoauk
# Production URL: https://isojguvcnfncokoxoauk.supabase.co

set -euo pipefail

PROJECT_ID="isojguvcnfncokoxoauk"

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI is required. Install it and run: supabase login"
  exit 1
fi

echo "=== Cathedra Digital · Supabase production setup ==="
echo "Project: $PROJECT_ID"
echo

echo "1) Linking local migrations to the production project..."
supabase link --project-ref "$PROJECT_ID"

echo
echo "2) Checking migration state..."
supabase migration list

echo
echo "3) Applying pending migrations..."
supabase db push

echo
echo "4) Final migration state..."
supabase migration list

echo
echo "=== Supabase setup complete ==="
echo "Project: https://$PROJECT_ID.supabase.co"
echo "Dashboard: https://supabase.com/dashboard/project/$PROJECT_ID"
