#!/bin/sh
PATH=/usr/sbin:/sbin:/usr/bin:/bin
export PATH="$PATH:"/usr/local/bin/

NODE_ENV=production node gateway/main.js &
NODE_ENV=production node blog/main.js &
NODE_ENV=production node users/main.js &
NODE_ENV=production node notifier/main.js
