#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 4 ]]; then
  echo "Usage: scripts/authenticate-eks.sh <cluster> <namespace> <token> <certificate>" >&2
  exit 1
fi

CLUSTER="$1"
NAMESPACE="$2"
TOKEN="$3"
CERTIFICATE="$4"

TMP_CA_FILE="$(mktemp)"

# Ensure the temporary CA file is removed on exit
cleanup() {
  rm -f "$TMP_CA_FILE"
}
trap cleanup EXIT

printf '%s' "$CERTIFICATE" > "$TMP_CA_FILE"

kubectl config set-cluster "$CLUSTER" \
  --certificate-authority="$TMP_CA_FILE" \
  --server="https://$CLUSTER"

kubectl config set-credentials deploy-user --token="$TOKEN"

kubectl config set-context "$CLUSTER" \
  --cluster="$CLUSTER" \
  --user=deploy-user \
  --namespace="$NAMESPACE"

kubectl config use-context "$CLUSTER"
