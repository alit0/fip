# Modelo de trabajo en Git — Equipo de 5 agentes (FIP Festival)

> Instructivo para los 5 agentes (Cloe, Gepeto, Chano, Geni, Opi). Conecta Git con
> el tablero de Plane (proyecto **Agentes Operativo**). Las cards referencian estas
> convenciones, así que esto se lee ANTES de tomar una card.

## TL;DR (el flujo en 6 líneas)

1. Cada agente trabaja en **su propio worktree** (carpeta aparte, mismo repo).
2. **Una rama por card**, sacada de `develop`: `feat/<CARD-ID>-<slug-corto>`.
3. **Todo commit arranca con el ID de la card**: `<CARD-ID>: <mensaje>`.
4. El implementador deja la **compuerta verde** y mueve la card a **Ready for QA**.
5. **Chano** audita en **QA** y, si aprueba, **mergea a `develop` Y mueve la card** en el mismo momento.
6. `main` es **sagrada**: solo releases, solo el **tech lead** (humano).

---

## 1. Aislamiento por worktree

Cada agente tiene una carpeta física separada que comparte el mismo repositorio Git.
Así dos agentes pueden estar en ramas distintas en paralelo **sin pisarse** al cambiar
de rama.

### Convención de carpetas

Las worktrees viven **al lado** del repo principal, una por agente:

```
C:/Users/Ale/Documents/
├─ FipFestival/        ← repo principal (lo maneja el tech lead; queda en develop)
├─ fip-cloe/           ← worktree de Cloe
├─ fip-gepeto/         ← worktree de Gepeto
├─ fip-chano/          ← worktree de Chano
├─ fip-geni/           ← worktree de Geni
└─ fip-opi/            ← worktree de Opi
```

### Crear el worktree de un agente (con su primera card)

Una worktree no puede tener `develop` checkouteada si ya está en el repo principal
(Git no deja la misma rama en dos lados). Por eso la worktree se crea **directo sobre
la rama de la card**, sacada de `develop`:

```bash
git fetch origin
git worktree add -b feat/AGENTESOPE-31-tarifario-global ../fip-cloe origin/develop
```

Eso crea la carpeta `../fip-cloe/` ya parada en la rama de la card.

### Tomar la siguiente card (dentro de la misma worktree)

Cuando el agente termina una card y arranca otra, **desde su carpeta**:

```bash
cd ../fip-cloe
git fetch origin
git switch -c feat/AGENTESOPE-42-premios-global origin/develop
```

> La worktree del agente nunca se queda parada en `develop`. `develop` vive en el
> repo principal. La worktree siempre está en una rama de card.

### Destruir / limpiar una worktree

```bash
git worktree remove ../fip-cloe      # borra la carpeta (debe estar limpia)
git worktree prune                   # limpia referencias de worktrees ya borradas a mano
git worktree list                    # ver qué hay montado
```

Si la worktree tiene cambios sin commitear, `remove` se niega. No forzar: avisar al
tech lead.

---

## 2. Ramas por card

- **Una rama por card.** Nada de meter dos cards en una rama.
- Se saca **siempre de `develop`** (actualizado: `git fetch` antes).
- Nombre: **`feat/<CARD-ID>-<slug-corto>`**
  - Ej.: `feat/AGENTESOPE-31-tarifario-global`
  - El `<slug-corto>` son 2-4 palabras en kebab-case que describen la card.
- La rama vive **dentro de la worktree** del agente que tomó la card.

---

## 3. Commits que referencian la card

- **Todo commit arranca con el ID de la card**, dos puntos, y el mensaje:
  - `AGENTESOPE-31: agrega collection TarifarioGlobal`
  - `AGENTESOPE-31: reescribe getTarifario con fallback mock`
- **Una cosa por commit** (unidades limpias y reviewables). Si un commit necesita un
  "y" en el mensaje, probablemente sean dos commits.
- El cuerpo del mensaje (opcional) explica el *por qué*, no el *qué*.

---

## 4. Merge a `develop` = lo hace Chano tras auditar

**El agente que implementa NUNCA mergea su propio código.** El merge a `develop` es
un acto de QA, no de implementación.

### Flujo

1. **Implementador** (Cloe / Gepeto / quien tomó la card):
   - Deja la **compuerta verde** en su worktree:
     ```bash
     npm run build && npm run typecheck && npm test
     ```
   - Pushea su rama: `git push -u origin feat/<CARD-ID>-<slug>`
   - Mueve la card a **Ready for QA** en Plane.
2. **Chano**:
   - Toma la card en **QA**.
   - Audita el diff Y corre la compuerta de QA en su worktree.
   - **Si aprueba** → mergea la rama a `develop` **y** mueve la card a **Ready for Docs**.
   - **Si rechaza** → devuelve al implementador (**Ready for Dev**) con el detalle, o
     a **Blocked** si lo que falta es una decisión.

### Regla dura: merge y estado son el MISMO momento

> El merge de la rama a `develop` y el cambio de estado de la card en Plane ocurren
> **juntos, en el mismo momento**. Nunca puede quedar:
> - código mergeado en `develop` con la card sin mover, ni
> - una card avanzada con el código sin integrar.
>
> Si uno de los dos falla, se revierte el otro. La verdad del código y la verdad del
> tablero no se separan.

El merge lo hace Chano así (desde su worktree o el repo principal, sobre `develop`):

```bash
git switch develop && git pull origin develop
git merge --no-ff feat/<CARD-ID>-<slug>     # --no-ff conserva la traza de la card
git push origin develop
# inmediatamente: mover la card en Plane a Ready for Docs
git branch -d feat/<CARD-ID>-<slug>          # limpiar rama local ya integrada
git push origin --delete feat/<CARD-ID>-<slug>   # limpiar la remota
```

---

## 5. `main` es sagrada

- **Nadie mergea a `main` automáticamente.** Ningún agente, nunca.
- `main` **solo recibe releases**, y **solo los hace el tech lead** (humano).
- El trabajo diario vive en `develop`. Los agentes integran a `develop` vía Chano;
  el tech lead decide cuándo `develop` se vuelve un release a `main`.

---

## 6. Trazabilidad Git ↔ Plane

El `<CARD-ID>` es el hilo que cose las dos puntas. Tiene que poder recorrerse en
ambos sentidos:

| Quiero saber… | Lo encuentro en… |
|---|---|
| La **rama** de una card | El nombre de rama está escrito **en la card** (campo/cuerpo) |
| La **card** de una rama | El `<CARD-ID>` es el prefijo del nombre de rama |
| La **card** de un commit | El `<CARD-ID>` es el prefijo del mensaje del commit |
| Los **commits** de una card | `git log --oneline --all --grep "<CARD-ID>:"` |

### Cómo se mantiene cuando la card avanza de estado

- Al **crear la card** → se le escribe el nombre de rama previsto
  (`feat/<CARD-ID>-<slug>`).
- Al **pasar a In Dev** → el implementador confirma/ajusta el nombre de rama real en
  la card si cambió el slug.
- Al **pasar a Ready for QA** → la card apunta a la rama pusheada (lista para auditar).
- Al **mergear (Ready for Docs)** → Chano deja en la card el commit de merge a
  `develop` (la rama se borra, pero el ID queda en el historial de `develop`).

Regla: **el nombre de rama y el ID nunca se inventan ni se cambian a mano sin reflejarlo
en la card.** Si la card y la rama no coinciden, gana lo que diga el tech lead.

---

## Reglas de método que se mantienen

- Una tarea por card; territorios de archivo que no se pisen.
- Sitio en vivo manda sobre docs viejos.
- Toda card de código cierra con `npm run build && npm run typecheck && npm test` en verde.
- Ante una decisión crítica nueva: no inventar → **Blocked** + avisar al tech lead.
