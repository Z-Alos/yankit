#!/bin/bash

# Exit script on any error
set -e

echo "🛠️ Building Vite frontend..."
npm run build

echo "⚡ Bundling Electron app..."
npm run electron:build

echo "📦 Navigating to dist directory..."
cd dist

APPIMAGE="Yankit-0.0.1.AppImage"

if [ -f "$APPIMAGE" ]; then
  echo "🧪 Making AppImage executable..."
  chmod +x "$APPIMAGE"

  echo "🚀 Launching $APPIMAGE..."
  ./"$APPIMAGE"
else
  echo "❌ AppImage not found. Did the build succeed? Check for errors."
fi

