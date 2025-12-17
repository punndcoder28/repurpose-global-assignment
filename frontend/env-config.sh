#!/bin/sh

# Generate env-config.js with runtime environment variables
cat <<EOF > /usr/share/nginx/html/env-config.js
window.ENV = {
  VITE_API_URL: '${VITE_API_URL:-http://localhost:3200/graphql}'
};
EOF

echo "Environment configuration generated:"
cat /usr/share/nginx/html/env-config.js
