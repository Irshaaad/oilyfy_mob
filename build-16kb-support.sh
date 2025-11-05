#!/bin/bash

echo "🚀 Building React Native app with 16KB page size support..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean
cd ..

# Install updated dependencies
echo "📦 Installing updated dependencies..."
npm install

# Install iOS pods (if on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Installing iOS pods..."
    cd ios
    pod install
    cd ..
fi

# Build Android app
echo "🤖 Building Android app..."
cd android
./gradlew assembleDebug
cd ..

echo "✅ Build completed! Your app now supports 16KB memory page sizes."
echo ""
echo "📋 Next steps:"
echo "1. Test your app on Android devices"
echo "2. Use Android Studio's APK Analyzer to verify native libraries"
echo "3. Test on Android Emulator with 16KB page size configuration"
echo ""
echo "🔍 To verify 16KB support:"
echo "- Open your APK in Android Studio"
echo "- Check lib/ directory for .so files"
echo "- Verify they're aligned for 16KB page sizes"

