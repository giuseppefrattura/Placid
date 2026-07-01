#!/bin/bash
echo "====================================================="
echo "  Plugin: Selettore RAW + JPEG per Apple Foto"
echo "====================================================="
echo "Questo script analizzerà la tua libreria e creerà un"
echo "nuovo album contenente tutte le coppie RAW + JPEG."
echo ""

# Cartella nascosta nella home dell'utente per l'ambiente virtuale Python
VENV_DIR="$HOME/.apple_foto_plugin_venv"

# Se l'ambiente non esiste, lo creiamo e installiamo osxphotos
if [ ! -d "$VENV_DIR" ]; then
    echo "[1/3] Configurazione dell'ambiente per il plugin (richiede qualche secondo)..."
    python3 -m venv "$VENV_DIR"
    "$VENV_DIR/bin/pip" install --upgrade pip > /dev/null 2>&1
    "$VENV_DIR/bin/pip" install osxphotos > /dev/null 2>&1
else
    echo "[1/3] Ambiente plugin già configurato."
fi

echo "[2/3] Scansione della libreria di Apple Foto in corso..."
echo "      (Apple Foto potrebbe aprirsi in background. Concedi i permessi se richiesto dal Mac)"

# Esegue la query per trovare foto che hanno il RAW associato e crea l'album
"$VENV_DIR/bin/osxphotos" query --has-raw --add-to-album "Coppie RAW + JPEG"

echo ""
echo "[3/3] Finito! Apri Apple Foto: troverai un nuovo album chiamato 'Coppie RAW + JPEG'."
echo "====================================================="
