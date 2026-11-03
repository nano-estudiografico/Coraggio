#!/bin/sh
# Genera las imágenes web (WebP) en img/ desde los originales de imagenes/ (macOS: usa sips y cwebp).
set -e
cd "$(dirname "$0")/.."
mkdir -p img
tmp=$(mktemp -d)
# Fotos: solo los tamaños que usan las páginas (nombre-lado mayor).
for nt in capuchino-960 pasteleria-960 \
          dia-capuchino-960 dia-capuchino-1920 dia-cafe-frio-960 dia-cafe-frio-1920 \
          dia-pasteleria-960 dia-pasteleria-1920 dia-tabla-picar-960 dia-tabla-picar-1920 \
          dia-capuchino-v-1280 dia-capuchino-v-1920 dia-cafe-frio-v-1280 dia-cafe-frio-v-1920 dia-tabla-picar-v-1280 dia-tabla-picar-v-1920 dia-pasteleria-v-1280 dia-pasteleria-v-1920 tazas-momentos-1920 hero-loop-poster-1280; do
  n=${nt%-*}; t=${nt##*-}
  sips -Z "$t" -s format png "imagenes/$n.jpg" --out "$tmp/$n.png" >/dev/null
  out="img/$n-$t.webp"; [ "$n" = hero-loop-poster ] && out="img/$n.webp"
  cwebp -quiet -q 80 "$tmp/$n.png" -o "$out"
done
# Copas: fondo común y recortes con transparencia, hechos a mano en un lienzo de 1200x1607
# (tools/recortar-copa.swift --marco da un recorte automático).
cwebp -quiet -q 80 imagenes/tarjetas-fondo.jpg -o img/tarjetas-fondo.webp
for n in aperol-spritz campari-spritz limoncello-spritz mimosa; do
  cwebp -quiet -q 85 -alpha_q 90 "imagenes/copa-$n-recorte.png" -o "img/copa-$n-recorte.webp"
done
# Vista previa para redes (og:image): JPG, que todas las redes muestran.
sips -Z 1920 -s format jpeg -s formatOptions 78 imagenes/tres-spritz.jpg --out img/tres-spritz-1920.jpg >/dev/null
rm -r "$tmp"
ls -l img/*.webp | awk '{print $5, $9}'
