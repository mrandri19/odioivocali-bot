#!/bin/bash
set -e

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage:" $0 "PORT APIKEY"
    exit 1
fi

APIKEY=$2
PORT=$1

echo "Started ngrok in background"
ngrok http $PORT > /dev/null 2>&1 &

echo "Giving it a 2 seconds to set up"
sleep 2

printf "\n"

echo "Getting url with ngrok api"

# The ngrok api return 2 urls, one with https and the other http, this was
# the easiest way to fine one with https
URL="$(curl http://127.0.0.1:4040/api/tunnels | jq -r .tunnels[1].public_url)"
if [[ $URL != *"https"* ]]; then
    URL="$(curl http://127.0.0.1:4040/api/tunnels | jq -r .tunnels[0].public_url)"
fi
echo $URL

printf "\n"

echo "Setting webhook on the telegram api"
curl -X POST \
  https://api.telegram.org/$APIKEY/setWebhook \
  -H 'cache-control: no-cache' \
  -H 'content-type: multipart/form-data;' \
  -F url=$URL/telegram

printf "\n"
printf "\n"
echo "Press any button to exit and kill ngrok"
read

echo "Killing ngrok"
kill $(jobs -p)
