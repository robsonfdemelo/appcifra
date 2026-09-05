# App Cifra V6 — Ambient Pads

Nesta versão os Pads passam a usar texturas atmosféricas por tonalidade.

## Novidades
- Pad Atmosférico / Ambient como padrão
- 12 tons: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
- Samples estéreo novos com tônica, quinta, oitava, swell e movimento lento
- Fade ao iniciar/parar
- Crossfade suave ao trocar de tom
- Controle de intensidade
- UI atualizada para uso ao vivo

## Ajustes técnicos incluídos
- `expo-audio ~57.0.4`
- React Native 0.86.3
- `@react-native/debugger-frontend 0.86.3`
- TypeScript `~6.0.3`
- `nodeLinker: hoisted` e `shamefullyHoist: true` em `pnpm-workspace.yaml`
- correção das Promises do Audio Session para TypeScript 6
- tipagem de `AudioStreamBuffer` no afinador

## Instalação
Na raiz do projeto:

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\mobile\node_modules -ErrorAction SilentlyContinue
pnpm install --force
pnpm --filter @app-cifra/mobile exec tsc --noEmit
pnpm --filter @app-cifra/mobile start
```
