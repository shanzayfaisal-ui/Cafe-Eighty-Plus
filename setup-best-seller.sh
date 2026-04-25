#!/bin/bash

# Setup Script for Best Seller Feature
# Run this to complete the setup

echo "🚀 Setting up Best Seller System..."
echo ""

# Step 1: Apply migrations
echo "1️⃣  Applying Supabase migrations..."
supabase db push
echo "✅ Migrations applied"
echo ""

# Step 2: Generate types
echo "2️⃣  Generating TypeScript types..."
supabase gen types typescript --project-id mxmgbvqtgvxgkbvcymlz > src/integrations/supabase/types.ts
echo "✅ Types generated"
echo ""

echo "3️⃣  Setup complete!"
echo ""
echo "Next steps:"
echo "  • Open browser DevTools (F12)"
echo "  • Go to Admin Panel → Product Management"
echo "  • Edit or create a product"
echo "  • Check the 'Mark as Best Seller' checkbox"
echo "  • Click Save"
echo "  • Watch the Console tab for logs"
echo ""
echo "If you see errors, refer to BEST_SELLER_SETUP.md for troubleshooting"
