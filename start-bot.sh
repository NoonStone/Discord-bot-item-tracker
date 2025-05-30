#!/bin/bash

# Load environment variables from .env
set -a
source .env
set +a

# Run the compiled executable
./LaunchLinux
