#!/bin/bash

set -e

if [ "$1" == "" ]; then
  echo "usage: $(basename $0) <party-name> [domain-url = https://canton.global]"
  exit 1
fi
USER=$1
if [ "$2" == "" ]; then
  DOMAIN_URL="https://canton.global"
else
  DOMAIN_URL=$2
fi

if [ ! -e .daml/dist/daml-chat-app-0.0.1.dar ]; then
  echo "please build the solutions first using"
  echo "  npm install"
  echo "  npm run build"
  exit 1
fi

if ! [ -x "$(command -v screen)" ]; then
  echo 'Error: screen is not installed.' >&2
  exit 1
fi

if [ "$CANTON_AUTO_APPROVE_AGREEMENTS" != "yes" ]; then
  echo "please set export CANTON_AUTO_APPROVE_AGREEMENTS=yes"
  echo "this will auto-accept the terms of service of the global canton domain"
  echo "but if you set this, make sure you have read them before accepting them"
  exit 1
fi

TARGET=canton

# find latest release
URL=$(curl -s https://api.github.com/repos/digital-asset/canton/releases/latest | grep browser_download_url | grep "tar.gz" | cut -d '"' -f 4)
FNAME=$(basename $URL)

# grab remote file
mkdir -p $TARGET
if [ ! -e $TARGET/${FNAME} ]; then
  curl -L $URL -o $TARGET/$FNAME
  cd $TARGET
  if [ -e latest ]; then
    rm latest
  fi
  tar zxvf $FNAME
  DIRECTORY=$(echo $FNAME | sed -E 's/\.tar\.gz//')
  ln -s $DIRECTORY latest
  cd ..
fi



# generate script
cat > $TARGET/upstart.canton <<- EOM
participant1.start()
connect(participant1, "global", "${DOMAIN_URL}")
enable_party(participant1, "$USER")
val Some(myId) = participant1.get_id()
retryUntilTrue() {
  participant1.list_parties().filter(_.participant == myId).length > 1
}
EOM
cat setup.sc >> $TARGET/upstart.canton

trap 'screen -X -S cantonchat kill' EXIT

echo "Starting canton chat background screen session"
screen -d -m -S cantonchat $TARGET/latest/bin/canton -v --truncate-log \
  -c $TARGET/latest/examples/03-split-configuration/participant1.conf \
  --bootstrap-script=$TARGET/upstart.canton 

echo "PLEASE ADJUST URL IN OPENED BROWSER TO http://localhost:3000?ledgerId=participant1"

npm run live

