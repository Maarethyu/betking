#!/usr/bin/env bash

export NPM_CONFIG_PRODUCTION=false;
export NODE_ENV=;
NPM_CONFIG_PRODUCTION=false;
NODE_ENV=development;
cd app && npm install && npm install --only=dev
