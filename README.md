# Objekt Back Image Generator

> Back image generator for Modhaus Objekt : **tripleS**, **ARTMS**, and **idntt**. Powered by **Bun** & **Skia Canvas**

[![License: MIT](https://img.shields.io/badge/License-MIT-pink.svg)](./LICENSE)
[![Runtime: Bun](https://img.shields.io/badge/Runtime-Bun%201.4+-black?logo=bun)](https://bun.sh)
[![Engine: Skia](https://img.shields.io/badge/Canvas-Skia%20Native-blue)](https://skia.org)
[![Groups: tripleS · ARTMS · idntt](https://img.shields.io/badge/Groups-tripleS%20%7C%20ARTMS%20%7C%20idntt-purple)](https://cosmo.fans)
[![Metadata: objekt.top](https://img.shields.io/badge/Data-objekt.top-orange)](https://objekt.top)
[![Assets: objektify.xyz](https://img.shields.io/badge/Assets-objektify.xyz-cyan)](https://objektify.xyz)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://objekt-back-image.vercel.app/)

A tool to generate photocard back images for **tripleS**, **ARTMS**, and **idntt** Objekts. It uses assets from [objektify.xyz](https://objektify.xyz/) and color data from the [objekt.top](https://objekt.top/) API.

You can use this tool to complete your Objekts that are missing back images, as well as automatically generate back images whenever new Objekts are released.

**Live Demo**: [https://objekt-back-image.vercel.app/](https://objekt-back-image.vercel.app/)

---

## Features

- **Collection Series Batching**: Download all members that exist in a collection series (e.g. `Cream02 372Z`).
- **Sorted by Latest Release**: Collections are automatically sorted from newest release to oldest.
- **Fast Rendering**: Renders directly via Skia in ~30-50ms per card.
- **Accurate Details**:
  - Embedded Modhaus fonts (`CardBold`, `CardMedium`, `CardOutline`, `CardNumber`, `CardSerial`).
  - Pre-mapped signature coordinates for all members across tripleS, ARTMS, and idntt.
  - Authentic top & side logos for all groups.
  - Special, Premier, and Unit class textures.
- **Multi-Format Support**: WebP, PNG, or JPEG.
- **3 Ways to Use**:
  1. **CLI**: Commands to generate single cards or batch-download real collection series.
  2. **TypeScript / JavaScript Library**: Direct module import into your apps and automated scripts.
  3. **Local Web App**: Interactive collection browser and one-click ZIP batch downloads.

---

## Quick Start

### Installation

Requires [Bun](https://bun.sh) installed.

```bash
git clone https://github.com/raya3211/Objekt-Back-Image-Generator.git
cd Objekt-Back-Image-Generator
bun install
```

---

## CLI Usage

### 1. Batch Download a Collection Series

Automatically look up the members of a collection and batch-generate all cards:

```bash
# Downloads the 10 members of Cream02 372Z
bun run src/cli.ts recover -g tripleS -s Cream02 -n 372Z -o ./output

# Custom output format
bun run src/cli.ts recover -g tripleS -s Cream02 -n 372Z -f png -o ./output-png
```

### 2. Generate Single Cards

```bash
# tripleS: SeoAh (Cream02 Double 372Z)
bun run src/cli.ts generate -m SeoAh -s Cream02 -c Double -n 372Z -o ./seoah.webp

# ARTMS: HeeJin (Ever01 Double 101Z)
bun run src/cli.ts generate -m HeeJin -s Ever01 -c Double -n 101Z -o ./heejin.webp

# idntt: DoHun (Summer25 Basic 101)
bun run src/cli.ts generate -m DoHun -s Summer25 -c Basic -n 101 -o ./dohun.webp
```

---

## Local Web App

Start the built-in server:

```bash
bun run serve
```

Open your browser at [http://localhost:3001](http://localhost:3001).

The web interface provides:
- **Collection Series** dropdown, sorted from newest release to oldest (e.g. `372Z (10 members)`).
- **Members in this Collection** dropdown dynamically listing only the members in that release.
- One-click **Download Batch (.zip)** button generating all members in that collection.

### REST API Endpoints

```http
# 1. List Collection Series (Newest first)
GET http://localhost:3001/api/series?group=tripleS&season=Cream02

# 2. Collection Info (List members in collection)
GET http://localhost:3001/api/collections?group=tripleS&season=Cream02&number=372Z

# 3. Batch Download ZIP of a Collection (e.g. 10 members)
GET http://localhost:3001/api/batch?group=tripleS&season=Cream02&number=372Z&format=webp

# 4. Single Card
GET http://localhost:3001/api/generate?group=tripleS&member=SeoAh&season=Cream02&class=Double&number=372Z&format=webp
```

---

## Supported Groups & Members

| Group | Members | Seasons |
| --- | --- | --- |
| **tripleS** (24) | SeoYeon, HyeRin, JiWoo, ChaeYeon, YooYeon, SooMin, NaKyoung, YuBin, Kaede, DaHyun, Kotone, YeonJi, Nien, SoHyun, Xinyu, Mayu, Lynn, JooBin, HaYeon, ShiOn, ChaeWon, Sullin, SeoAh, JiYeon | Atom01, Atom02, Binary01, Binary02, Cream01, Cream02, Divine01, Ever01 |
| **ARTMS** (5) | HeeJin, KimLip, JinSoul, Choerry, HaSeul | Atom01, Atom02, Binary01, Cream01, Divine01, Ever01 |
| **idntt** (15) | DoHun, HeeJu, TaeIn, JaeYoung, JuHo, JiWoon, HwanHee, CheongMyeong, Towa, KyuHyuk, NuRi, SeongJun, YeJoon, GyeongBeen, EunSoo | Spring25, Summer25, Autumn25, Winter26, Spring26, Summer26, Autumn26 |

---

## Testing

Run automated tests:

```bash
bun test
```

---

## Credits & Acknowledgments

- [**objektify.xyz**](https://objektify.xyz/): Special thanks to **Objektify** for providing and curating the core graphical assets. All member signatures (24 tripleS members, 5 ARTMS members, 15 idntt members), original card typography fonts (`CardBold`, `CardMedium`, `CardOutline`, `CardNumber`), official wordmark logos, and holographic card textures used in this generator originate from their reverse-engineered asset library.
- [**objekt.top**](https://objekt.top/): Powered by the **objekt.top API** (`https://objekt.top/api/v1/collections?artist={triples|artms|idntt}`) to dynamically retrieve authentic `backgroundColor` and `textColor` metadata for each photocard collection slug, ensuring 100% color accuracy matching Cosmo.

---

## License

MIT © Antigravity & Community. Feel free to use in your own projects!
