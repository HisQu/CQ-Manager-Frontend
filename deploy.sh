#!/bin/bash

set -euo pipefail

cp .env.prod .env
set -a
source .env
set +a
npm run build

scp -r dist/ mephisto:~/
ssh -t mephisto -t 'sudo rm -rf /var/www/cqfrontend-build/ && sudo cp -r /home/danielmotz/dist/ /var/www/cqfrontend-build/'
