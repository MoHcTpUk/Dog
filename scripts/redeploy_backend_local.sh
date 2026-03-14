#!/bin/bash
bash ../deploy/stop.sh
bash ./build_backend.sh
bash ../deploy/start_local.sh
wait
