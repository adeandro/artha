#!/bin/bash
# Helper script untuk build APK dengan EAS

echo "🚀 Artha APK Build Helper"
echo "========================"
echo ""
echo "Pilih opsi:"
echo "1) Login Expo (jalankan sekali saja)"
echo "2) Build Preview APK (untuk testing)"
echo "3) Build Production APK (untuk release)"
echo "4) Lihat build status"
echo ""
read -p "Pilih opsi (1-4): " choice

case $choice in
  1)
    echo "🔐 Login ke Expo..."
    npx expo login
    ;;
  2)
    echo "🔨 Build Preview APK..."
    npx eas build --platform android --profile preview
    ;;
  3)
    echo "🔨 Build Production APK..."
    npx eas build --platform android --profile production
    ;;
  4)
    echo "📊 Status Build..."
    echo "Kunjungi: https://expo.dev"
    open https://expo.dev || xdg-open https://expo.dev || start https://expo.dev
    ;;
  *)
    echo "❌ Opsi tidak valid"
    ;;
esac
