#!/bin/bash
bash build_all.sh
bash publish_all.sh
cd ~/Work/DogApp/
rsync -avz ./deploy/ user@dogappa.com:/home/user/dogapp/deploy/
ssh user@dogappa.com "
cd /home/user/dogapp/deploy &&
bash start.sh stage"