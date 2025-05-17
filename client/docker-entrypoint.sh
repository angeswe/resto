#!/bin/sh

# Replace environment variables in the index.js file
INDEX_JS_FILE=$(find /usr/share/nginx/html/assets -name 'index-*.js')
if [ -n "$INDEX_JS_FILE" ]; then
  # Replace the default API URL with the environment variable if set
  if [ -n "$VITE_API_URL" ]; then
    sed -i "s|http://localhost:3000|$VITE_API_URL|g" $INDEX_JS_FILE
  fi
fi

# Execute CMD
exec "$@"


#! /bin/sh

if [ -z "$VITE_API_URL" ]; then
    echo "VITE_API_URL is not set. Exiting."
    exit 1
fi

for i in $(env | grep "^$VITE_API_URL"); do
    key=$(echo "$i" | cut -d '=' -f 1)
    value=$(echo "$i" | cut -d '=' -f 2-)

    echo "$key=$value"

    find "/usr/share/nginx/html/assets" -type f -exec sed -i 's|'"${key}"'|'"${value}"'|g' {} \;
done
