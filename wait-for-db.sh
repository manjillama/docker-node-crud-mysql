#!/bin/bash

set -e
set -x

host="127.0.0.1"
shift
cmd="npm start"

until mysql -h "$host" -u root -p root -e 'select 1'; do
  >&2 echo "MySQL is unavailable - sleeping"
  sleep 1
done

>&2 echo "Mysql is up - executing command"
exec $cmd
