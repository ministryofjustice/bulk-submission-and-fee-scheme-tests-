#!/bin/bash
set -euo pipefail

DOCKERD_STARTED=0

start_docker() {
    echo "Checking Docker availability..."

    # Works when host socket is mounted into the runner container.
    if docker info >/dev/null 2>&1; then
        echo "Docker daemon is already available."
        return 0
    fi

    # Fallback to DinD (daemon in container).
    if ! command -v dockerd >/dev/null 2>&1; then
        echo "ERROR: 'dockerd' not found in image."
        return 1
    fi

    echo "Docker not available yet; attempting to start dockerd..."
    dockerd \
        --host=unix:///var/run/docker.sock \
        --pidfile=/tmp/dockerd.pid \
        >/tmp/dockerd.log 2>&1 &

    DOCKERD_STARTED=1

    for i in $(seq 1 60); do
        if docker info >/dev/null 2>&1; then
            echo "Docker daemon started successfully."
            return 0
        fi
        sleep 1
    done

    echo "ERROR: Docker daemon failed to start."
    echo "Last 100 lines of /tmp/dockerd.log:"
    tail -n 100 /tmp/dockerd.log || true
    echo "Hint: if running DinD, container typically needs --privileged."
    echo "Hint: alternatively mount host socket: -v /var/run/docker.sock:/var/run/docker.sock"
    return 1
}

cleanup() {
    echo "Removing runner..."
    if [ -f ".runner" ]; then
        REMOVE_TOKEN=$(curl -sL \
            -X POST \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer ${GITHUB_TOKEN}" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            "https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/runners/registration-token" \
            | jq -r .token)
        if [ -n "${REMOVE_TOKEN}" ] && [ "${REMOVE_TOKEN}" != "null" ]; then
            ./config.sh remove --token "${REMOVE_TOKEN}" || true
        fi
    fi

    if [ "${DOCKERD_STARTED}" -eq 1 ] && [ -f /tmp/dockerd.pid ]; then
        echo "Stopping dockerd..."
        kill "$(cat /tmp/dockerd.pid)" 2>/dev/null || true
    fi
}

if [ -z "${GITHUB_TOKEN:-}" ]; then
    echo "ERROR: GITHUB_TOKEN environment variable is required"
    exit 1
fi

if [ -z "${GITHUB_REPOSITORY:-}" ]; then
    echo "ERROR: GITHUB_REPOSITORY environment variable is required"
    exit 1
fi

start_docker

echo "Fetching runner registration token..."
RUNNER_TOKEN=$(curl -sL \
    -X POST \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/runners/registration-token" \
    | jq -r .token)

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
        REMOVE_TOKEN=$(curl -sL \
            -X POST \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer ${GITHUB_TOKEN}" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            "https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/runners/registration-token" \
            | jq -r .token)
        if [ -n "${REMOVE_TOKEN}" ] && [ "${REMOVE_TOKEN}" != "null" ]; then
            ./config.sh remove --token "${REMOVE_TOKEN}"
        fi
    fi
}

trap cleanup SIGTERM
trap cleanup SIGINT
trap cleanup EXIT

./run.sh
