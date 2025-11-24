#!/bin/bash

print_boundary() {
   echo -e "\n...........$1............"
   echo -e "File: $2\n"
   cat "$2"
   echo -e "\n...........$1 END............\n"
}

# Updated to look for Vue, TypeScript, JavaScript, HTML, CSS, and Config files
find . -type f \( \
    -name "*.vue" -o \
    -name "*.ts" -o \
    -name "*.js" -o \
    -name "*.css" -o \
    -name "*.html" -o \
    -name "*.json" -o \
    -name "*.md" -o \
    -name "*.sh" -o \
    -name ".env" \
\) \
-not -path "*/node_modules/*" \
-not -path "*/dist/*" \
-not -path "*/coverage/*" \
-not -path "*/.git/*" \
-not -path "*/.vscode/*" \
| grep -v -E '(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|\.ico$|\.svg$|\.png$|\.jpg$)' \
| while read -r file; do
    filename=$(basename "$file")
    print_boundary "$filename" "$file"
done