# Leone Dev RPG — Design System

**Direction:** Ficha Viva *(Character Sheet Terminal)*  
**Status:** Approved  
**Version:** 1.0  
**Date:** 2026-09-14

---

## 1. Essência

Leone Dev RPG não é um dashboard de tarefas — é a **ficha operacional de um personagem profissional**. A interface combina legibilidade de ferramenta de dev com metáforas contidas de RPG (XP, level, mastery, missões).

**Princípios**

| Princípio | Significado |
|-----------|-------------|
| Ficha, não SaaS | Painéis com borda, não cards flutuantes com sombra |
| Dados em mono | XP, stats, logs, status → `font-mono` |
| Ganho, não punição | Ouro para XP; vermelho só para erro técnico |
| Densidade útil | Informação visível; sem hero decorativo |
| Uma assinatura | Barra de XP segmentada + stat block do personagem |

**Evitar**

Inter, Roboto, gradiente roxo, glassmorphism, `rounded-xl` em tudo, sombras SaaS, confetti, tom infantil.

---

## 2. Tokens de cor

Implementados em `apps/web/src/styles/tokens.css` e expostos via Tailwind.

**Identidade:** neon verde cyber — fundo escuro profundo, acentos em verde primário, XP em amarelo-limão, info em ciano.

### Superfície e texto

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `bg-base` | `#F0F7F2` | `#070A08` | fundo da página |
| `bg-surface` | `#FFFFFF` | `#0D120F` | painéis |
| `bg-muted` | `#E8F5EC` | `#131A15` | tracks, inputs, hover |
| `text-primary` | `#070A08` | `#E8F5EC` | corpo, títulos |
| `text-muted` | `#7D9484` | `#7D9484` | meta, labels |
| `border-default` | `#7D9484` @ 30% | `#7D9484` @ 30% | bordas 1px |

### Marca e semântica

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `primary` / `accent` | `#00B84A` | `#00FF66` | links, IN_PROGRESS, ações primárias |
| `primary-hover` | `#00FF66` | `#33FF85` | hover de botões primários |
| `primary-dark` / `success` | `#008C3A` | `#00B84A` | COMPLETED, unlocked, confirmar |
| `xp` | `#8FC800` | `#B6FF00` | XP, streak, level progress |
| `warning` | `#B6FF00` | `#B6FF00` | stale, soft limits |
| `danger` | `#FF3B30` | `#FF3B30` | erros técnicos |
| `info` / `mastery-high` | `#00B4D4` | `#00D9FF` | TEACH mastery, quests BOSS |

**Contraste em botões:** fundo `primary` usa texto `base` (escuro) para legibilidade no verde neon.

### Quest status (borda lateral)

| Status | Cor |
|--------|-----|
| TODO | `text-muted` + borda tracejada |
| IN_PROGRESS | `accent` |
| COMPLETED | `success` |
| CANCELLED | `text-muted` sólido |
| BOSS | `info` + peso visual 2× |

---

## 3. Tipografia

| Papel | Família | Tailwind | Uso |
|-------|---------|----------|-----|
| UI | IBM Plex Sans | `font-sans` | navegação, títulos, body |
| Dados | IBM Plex Mono | `font-mono` | XP, level, logs, badges, stats |
| Flavor | Literata Italic | `font-flavor` | descrições de achievement (raro) |

### Escala

| Token | Size | Weight | Line-height | Uso |
|-------|------|--------|-------------|-----|
| `text-stat` | 2rem (32px) | 600 mono | 1.1 | level, streak hero |
| `text-h1` | 1.75rem (28px) | 600 sans | 1.2 | título de página |
| `text-h2` | 1.25rem (20px) | 600 sans | 1.3 | título de painel |
| `text-h3` | 1rem (16px) | 600 sans | 1.4 | sub-seção |
| `text-body` | 0.875rem (14px) | 400 sans | 1.5 | conteúdo |
| `text-small` | 0.75rem (12px) | 400 sans | 1.5 | meta |
| `text-micro` | 0.6875rem (11px) | 500 mono | 1.4 | status, sourceType |

**Regras:** max-width de prosa 65ch; sentence case; sem ALL CAPS decorativo.

---

## 4. Espaçamento

Base **4px**. Escala Tailwind padrão: 1=4, 2=8, 3=12, 4=16, 6=24, 8=32, 12=48.

| Contexto | Token |
|----------|-------|
| Padding de painel | `p-6` (24px) |
| Gap entre painéis | `gap-6` |
| Gap entre itens de lista | `gap-3` / `gap-4` |
| Padding de botão | `px-3 py-2` ou `px-4 py-2` |

---

## 5. Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `rounded-panel` | 6px | painéis, inputs, botões |
| `rounded-boss` | 8px | cards de boss |
| `rounded-badge` | 9999px | pills de status |

Evitar `rounded-xl` (12px+) como padrão global.

---

## 6. Sombras

| Token | Valor | Uso |
|-------|-------|-----|
| `shadow-none` | — | default (dark e light) |
| `shadow-elevated` | `0 1px 2px rgba(31,35,40,0.08)` | dropdown, modal (light only) |

Profundidade por **borda**, não elevation.

---

## 7. Componentes

Classes em `apps/web/src/styles/components.css`. Componentes React em `apps/web/src/components/design/`.

### Panel (`.ds-panel`)

Painel de ficha: borda 1px, fundo surface, radius 6px, header com título H2.

### Stat block (`.ds-stat`)

Label muted small + valor `font-mono` grande. Usado para level, streak, totais.

### Badge (`.ds-badge`)

Pill mono micro. Variantes: `--accent`, `--success`, `--warning`, `--muted`.

### Quest item (`.ds-quest-item`)

Lista com **borda lateral 3px** colorida por status (`--todo`, `--progress`, `--done`, `--boss`).

### XP bar (`.ds-xp-track` / `.ds-xp-fill`)

Track muted; fill `xp`. Transição width 400ms.

### Segmented XP bar (`SegmentedProgressBar`)

**Elemento assinatura.** Blocos = tiers de level; fill ouro no segmento atual. Ver componente React.

### Log row (`.ds-log-row`)

Item de histórico: descrição sans + meta mono; valor `+N` em success/xp.

### Empty state (`.ds-empty`)

Ícone muted + uma frase + CTA opcional. Sem ilustração genérica.

### Error banner (`.ds-error`)

Borda danger, fundo danger/10, copy técnica direta.

---

## 8. Tratamentos por domínio

### XP

- Cor `xp` (ouro)
- Prefixo `+` em transações
- Barra segmentada no level progress
- Animação: pulse 200ms no complete (respeita `prefers-reduced-motion`)

### Level

- Stat hero mono 32px
- Subtexto: XP restante para próximo level
- Sem badges circulares estilo Duolingo

### Skills

- Tabela de atributos + barra mastery
- Stale: badge warning + ícone ○
- Mastery traduzido na UI; cor progressiva até `mastery-high`

### Quests

- Meta linha mono: `TYPE · DIFFICULTY · XP`
- Botões verbos claros: Iniciar / Concluir
- Warning soft limit: banner warning

### Bosses

- Card 2× altura, `rounded-boss`, borda accent
- Label BOSS em mono micro
- Evidência expandida por default no complete

### Achievements

- Locked: opacidade 50%, borda tracejada
- Unlocked: borda success, data mono
- Reward: selo `+N XP` no canto

---

## 9. Ícones

**Lucide** stroke 1.5px. Uso mínimo: nav, streak, stale, boss, achievement. Status preferencialmente texto + cor.

---

## 10. Motion

| Tipo | Regra |
|------|-------|
| Page enter | fade 150ms no main |
| XP fill | width 400ms ease-out |
| Button | background 100ms |
| Reduced motion | desliga animações |

Sem stagger por card; sem confetti.

---

## 11. Estados

| Estado | Padrão |
|--------|--------|
| Loading | skeleton mono 3 linhas |
| Empty | `.ds-empty` |
| Error | `.ds-error` |
| Success | toast bottom-right 3s |

---

## 12. Responsividade

- Nav desktop: horizontal
- Nav mobile: bottom bar, ícone + label 10px
- Dashboard: stack vertical; character primeiro
- Touch target ≥ 44px

---

## 13. Acessibilidade

- Contraste WCAG AA
- Focus: `ring-2 ring-accent ring-offset-2 ring-offset-base`
- Status sempre com texto, não só cor
- `prefers-reduced-motion` respeitado

---

## 14. Implementação

```
apps/web/src/
├── styles/
│   ├── tokens.css       # CSS custom properties
│   └── components.css   # classes ds-*
├── components/design/
│   ├── Panel.tsx
│   ├── StatBlock.tsx
│   ├── SegmentedProgressBar.tsx
│   └── Badge.tsx
└── index.css            # imports + base
```

**Theme toggle:** `gamefication:theme` → classe `.dark` no `<html>`.  
**i18n:** UI traduzida; API permanece em inglês.

---

## 15. Checklist de adoção (por tela)

- [x] Dashboard — stat block + segmented XP
- [ ] Quests — quest items com borda lateral
- [ ] Skills — attribute rows
- [ ] History — log rows mono
- [ ] Achievements — trophy grid
- [ ] AppLayout — nav + toggles com tokens novos
