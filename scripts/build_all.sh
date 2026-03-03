#!/bin/bash
./build_frontend.sh "$1" &
./build_backend.sh "$1" &
./build_landing.sh "$1" &
./build_telegram_bot.sh "$1"
wait
