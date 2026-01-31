#!/bin/bash
bash publish_all.sh
ssh user@dogappa.com "
cd /home/user/dogapp/deploy &&
bash start_stage.sh"