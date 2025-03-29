#!/bin/sh

# Replace environment variables in the main.js file
MAIN_JS_FILE=$(find /usr/share/nginx/html/assets -name 'main-*.js')
if [ -n "$MAIN_JS_FILE" ]; then
  # Replace the default API URL with the environment variable if set
  if [ -n "$VITE_API_URL" ]; then
    sed -i "s|http://localhost:3000|$VITE_API_URL|g" $MAIN_JS_FILE
  fi
fi

# Execute CMD
exec "$@"
