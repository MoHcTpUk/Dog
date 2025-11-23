#!/bin/bash
./build_frontend.sh "$1"
./build_backend.sh "$1"
./build_landing.sh "$1"