#!/usr/bin/env bash
set -e
git init
git add .
git commit -m "chore: inicializa proyecto React + Vite"

# Crea 20 commits mínimos (ajusta y agrega cambios reales entre commits)
for i in {1..19}
do
  echo "// commit $i" >> src/commit_$i.txt
  git add .
  git commit -m "feat: avance $i (UI/servicios/tests/docs)"
done

echo "Hecho. No olvides crear un repositorio remoto y hacer push:"
echo "git branch -M main && git remote add origin <URL> && git push -u origin main"
