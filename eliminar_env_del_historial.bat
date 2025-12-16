@echo off
echo ========================================
echo ELIMINANDO .env DEL HISTORIAL DE GIT
echo ========================================
echo.
echo ADVERTENCIA: Esto reescribira el historial de Git
echo Si trabajas con otros, coordina primero!
echo.
pause

echo Verificando commits con .env...
git log --all --full-history --oneline -- .env

echo.
echo Eliminando .env del historial...
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env" --prune-empty --tag-name-filter cat -- --all

echo.
echo Limpiando referencias...
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now

echo.
echo ========================================
echo COMPLETADO
echo ========================================
echo.
echo Ahora puedes hacer:
echo   git push origin --force --all
echo.
echo ADVERTENCIA: El --force reescribe el historial remoto
pause

