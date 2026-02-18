#!/bin/bash
# JSON Schema Validation Script for FlowForge v2.0

echo "🔍 FlowForge v2.0 Schema Validation"
echo "===================================="

# Check for ajv-cli (JSON schema validator)
if ! command -v ajv &> /dev/null; then
    echo "⚠️  ajv-cli not installed. Install with: npm install -g ajv-cli"
    echo "   Performing basic JSON validation instead..."
    
    # Basic JSON validation using jq
    for schema in *.json; do
        echo -n "Checking $schema... "
        if jq empty "$schema" 2>/dev/null; then
            echo "✅ Valid JSON"
        else
            echo "❌ Invalid JSON"
        fi
    done
else
    # Full schema validation with ajv
    for schema in *.json; do
        echo -n "Validating $schema... "
        if ajv compile -s "$schema" &>/dev/null; then
            echo "✅ Valid Schema"
        else
            echo "❌ Invalid Schema"
            ajv compile -s "$schema" 2>&1 | head -5
        fi
    done
fi

echo ""
echo "📊 Schema Statistics:"
echo "--------------------"
for schema in *.json; do
    properties=$(jq '.properties | length' "$schema" 2>/dev/null || echo "0")
    required=$(jq '.required | length' "$schema" 2>/dev/null || echo "0")
    echo "$schema: $properties properties, $required required"
done

echo ""
echo "✅ Validation Complete!"