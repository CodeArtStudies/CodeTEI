#!/usr/bin/env bash
# Validate all CodeTEI XML files against the schema
# Requires: jing (or rng-validator) in PATH

SCHEMA="schema/CodeTEI-v0.2.rng"
EXAMPLES=$(find examples -name "*.xml")

if ! command -v jing > /dev/null; then
  echo "jing not found. Please install Jing (RELAX NG validator)." >&2
  exit 1
fi

ret=0
for f in $EXAMPLES; do
  echo "Validating $f …"
  jing "$SCHEMA" "$f" || ret=1
done

if [ $ret -eq 0 ]; then
  echo "All files are valid."
else
  echo "Validation errors occurred." >&2
fi
exit $ret
