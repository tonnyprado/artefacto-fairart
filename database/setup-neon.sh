#!/bin/bash

# Script para configurar la base de datos en Neon
#
# Uso:
#   1. Obtén tu DATABASE_URL de Neon Console
#   2. Ejecuta: ./setup-neon.sh "postgresql://..."
#

echo "🚀 Configurando Base de Datos ARTEFACT en Neon..."
echo ""

# Verificar que se proporcionó la URL
if [ -z "$1" ]; then
  echo "❌ Error: Debes proporcionar la DATABASE_URL"
  echo ""
  echo "Uso:"
  echo "  ./setup-neon.sh \"postgresql://user:password@host/database\""
  echo ""
  echo "📝 Obtén tu DATABASE_URL desde:"
  echo "   https://console.neon.tech → Tu Proyecto → Connection String"
  exit 1
fi

DATABASE_URL="$1"

echo "1️⃣  Ejecutando schema.sql (crear tablas)..."
psql "$DATABASE_URL" -f schema.sql

if [ $? -eq 0 ]; then
  echo "✅ Schema creado exitosamente"
else
  echo "❌ Error al crear schema"
  exit 1
fi

echo ""
echo "2️⃣  Ejecutando seed.sql (datos iniciales)..."
psql "$DATABASE_URL" -f seed.sql

if [ $? -eq 0 ]; then
  echo "✅ Datos iniciales insertados exitosamente"
else
  echo "❌ Error al insertar datos iniciales"
  exit 1
fi

echo ""
echo "✨ ¡Base de datos configurada exitosamente!"
echo ""
echo "📋 Credenciales de Admin:"
echo "   Email: admin@artefact.com"
echo "   Password: admin123"
echo ""
echo "⚠️  IMPORTANTE: Actualiza tu archivo backend/.env con:"
echo "   DATABASE_URL=$DATABASE_URL"
