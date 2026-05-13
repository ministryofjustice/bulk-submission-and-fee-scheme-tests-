#!/bin/bash
set -e

if [ -z "${GITHUB_TOKEN}" ]; then
    echo "ERROR: GITHUB_TOKEN environment variable is required"
    exit 1
fi

if [ -z "${GITHUB_REPOSITORY}" ]; then
    echo "ERROR: GITHUB_REPOSITORY environment variable is required"
    exit 1
fi

get_runner_token() {
    local response_file
    local http_status
    local runner_token
    local api_message
    local documentation_url

    response_file=$(mktemp)

    if ! http_status=$(curl -sS -L \
        -o "${response_file}" \
        -w "%{http_code}" \
        -X POST \
        -H "Accept: application/vnd.github+json" \
        -H "Authorization: Bearer ${GITHUB_TOKEN}" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/runners/registration-token"); then
        echo "ERROR: GitHub runner token request failed before receiving a response" >&2
        rm -f "${response_file}"
        return 1
    fi

    runner_token=$(jq -r '.token // empty' "${response_file}")

    if [ -z "${runner_token}" ]; then
        api_message=$(jq -r '.message // empty' "${response_file}")
        documentation_url=$(jq -r '.documentation_url // empty' "${response_file}")

        echo "ERROR: Failed to get runner registration token from GitHub API" >&2
        echo "GitHub API HTTP status: ${http_status}" >&2
        if [ -n "${api_message}" ]; then
            echo "GitHub API message: ${api_message}" >&2
        fi
        if [ -n "${documentation_url}" ]; then
            echo "GitHub API documentation: ${documentation_url}" >&2
        fi

        rm -f "${response_file}"
        return 1
    fi

    rm -f "${response_file}"
    echo "${runner_token}"
}

echo "Fetching runner registration token..."
RUNNER_TOKEN=$(get_runner_token)

if [ -z "${RUNNER_TOKEN}" ] || [ "${RUNNER_TOKEN}" = "null" ]; then
    echo "ERROR: Failed to get runner registration token"
    exit 1
fi

RUNNER_NAME=${RUNNER_NAME:-"k8s-e2e-runner"}

echo "Configuring GitHub Actions runner..."
echo "URL: https://github.com/${GITHUB_REPOSITORY}"
echo "Runner name: ${RUNNER_NAME}"

if [ -f ".runner" ]; then
    echo "Found existing runner configuration, removing..."
    ./config.sh remove --token "${RUNNER_TOKEN}" 2>/dev/null || true
fi

./config.sh \
    --url "https://github.com/${GITHUB_REPOSITORY}" \
    --token "${RUNNER_TOKEN}" \
    --name "${RUNNER_NAME}" \
    --labels "${RUNNER_LABELS:-self-hosted,linux,uat,k8s}" \
    --unattended \
    --replace

cleanup() {
    echo "Removing runner..."
    if [ -f ".runner" ]; then
        REMOVE_TOKEN=$(get_runner_token || true)
        if [ -n "${REMOVE_TOKEN}" ] && [ "${REMOVE_TOKEN}" != "null" ]; then
            ./config.sh remove --token "${REMOVE_TOKEN}"
        fi
    fi
}

trap cleanup SIGTERM
trap cleanup SIGINT

./run.sh
