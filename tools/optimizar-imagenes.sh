#!/bin/sh
# Genera img/<nombre>-1920.jpg y img/<nombre>-960.jpg desde imagenes/<nombre>.jpg (macOS: usa sips).
set -e
cd "$(dirname "$0")/.."
mkdir -p img
for n in aperol-spritz campari-spritz limoncello-spritz tres-spritz mimosas cafe-frio capuchino pasteleria tabla-picar salon tazas-momentos; do
  for t in 1920 960; do
    out="img/$n-$t.jpg"
    sips -Z "$t" -s format jpeg -s formatOptions 78 "imagenes/$n.jpg" --out "$out" >/dev/null
    if [ "$(stat -f %z "$out")" -ge 600000 ]; then
      sips -Z "$t" -s format jpeg -s formatOptions 70 "imagenes/$n.jpg" --out "$out" >/dev/null
    fi
  done
done
# Copas: foto con fondo (se corta en la tarjeta). Encima va img/copa-<n>-recorte.png, la misma copa
# sin fondo en un lienzo de 1200x1607 (recorte hecho a mano; tools/recortar-copa.swift --marco da uno automático).
for n in aperol-spritz campari-spritz limoncello-spritz mimosa; do
  sips -Z 1607 -s format jpeg -s formatOptions 70 "imagenes/copa-$n.jpg" --out "img/copa-$n-fondo.jpg" >/dev/null
done
ls -l img/*.jpg | awk '{print $5, $9}'
