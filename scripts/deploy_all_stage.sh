#!/bin/bash
ssh user@dogappa.com -p 2222 "
cd /home/user/dogapp/deploy &&
bash start_stage.sh"