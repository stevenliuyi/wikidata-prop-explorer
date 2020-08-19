#!/bin/bash

ssh -tt -i ~/.ssh/id_rsa stevenliuyi@login.toolforge.org << EOF
  become prop-explorer
  webservice stop
  rm -rf ./wikidata-prop-explorer
  rm -rf ./public_html
  mkdir ./public_html
  git clone -b wmflabs https://$GITHUB_TOKEN@github.com/stevenliuyi/wikidata-prop-explorer.git
  mv ./wikidata-prop-explorer/* ./public_html
  rm -rf ./wikidata-prop-explorer
  webservice start
  exit
  exit
EOF
