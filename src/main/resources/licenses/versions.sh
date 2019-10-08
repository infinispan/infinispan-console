#!/bin/bash

# Input: File containing lines in <package>:<version> format.
while read line; do
  p=$(echo $line | cut -f1 -d ':')
  v=$(echo $line | cut -f2 -d ':')
  d=$(curl -s https://www.npmjs.com/package/$p/v/$v | tr -d '\n')
  echo -n "$p "
  echo $d | sed -n -r -e 's|.*"license":"([^"]+)".*|\1|p'
done < $1
