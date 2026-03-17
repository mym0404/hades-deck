# <div align="center">Hades Deck</div>

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=280&color=0:160707,20:3a0d0d,45:7a1414,70:c08b2c,100:f8e7a1&text=Hades%20Deck&fontColor=fff6d6&fontSize=64&animation=twinkling&fontAlignY=36&desc=%EC%98%81%EC%96%B4%20Hades%EB%A5%BC%20%EC%BC%B0%EB%8D%94%EB%8B%88%20%EC%96%B4%ED%9C%98%EA%B0%80%20%EB%82%B4%20%EC%98%81%ED%98%BC%EC%9D%84%20%EC%88%98%EA%B1%B0%ED%95%B4%EA%B0%94%EB%8B%A4&descAlignY=58" width="100%" alt="Hades Deck banner" />
</div>

<div align="center">
  <img src="./assets/readme/official/Hades_Logo.png" width="560" alt="Hades logo" />
</div>

<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Russo+One&weight=700&size=28&duration=2800&pause=900&color=F4D06F&center=true&vCenter=true&repeat=true&width=980&height=110&lines=%EC%98%81%EC%96%B4%EB%A1%9C+Hades%EB%A5%BC+%ED%95%98%EA%B3%A0+%EC%8B%B6%EC%97%88%EB%8B%A4.;%EA%B7%B8%EB%9F%B0%EB%8D%B0+%EB%8C%80%EC%82%AC%EA%B0%80+%EC%9E%90%EA%BE%B8+%EB%82%98%EB%A5%BC+%ED%8F%AD%ED%96%89%ED%96%88%EB%8B%A4.;%EA%B7%B8%EB%9E%98%EC%84%9C+Anki+Deck%EB%A1%9C+%EB%90%98%EA%B0%9A%EC%95%84+%EC%A4%AC%EB%8B%A4." alt="Animated typing banner" />
</div>

<div align="center">
  <a href="https://github.com/mym0404/hades-deck"><img src="https://img.shields.io/badge/repo-mym0404%2Fhades--deck-2b0d0d?style=for-the-badge&logo=github&logoColor=f7f3e9" alt="Repository badge" /></a>
  <a href="./cards/hades-anki.csv"><img src="https://img.shields.io/badge/anki%20csv-150%20cards-b53a2d?style=for-the-badge&logo=anki&logoColor=fff4dc" alt="Anki CSV badge" /></a>
  <img src="https://img.shields.io/badge/TypeScript-CLI-c7922c?style=for-the-badge&logo=typescript&logoColor=1a0d0d" alt="TypeScript badge" />
  <img src="https://img.shields.io/badge/pnpm-powered-8f4f19?style=for-the-badge&logo=pnpm&logoColor=fff4dc" alt="pnpm badge" />
  <img src="https://img.shields.io/badge/dialogue-Hades%20English-521111?style=for-the-badge" alt="Dialogue badge" />
  <img src="https://img.shields.io/badge/filter-B2%20cut%20%2B%20mythic%20bias-cd9f3b?style=for-the-badge&logoColor=1a0d0d" alt="Filter badge" />
</div>

<br />

<div align="center">
  <table>
    <tr>
      <td align="center"><a href="./cards/hades-anki.csv"><strong>Deck 바로 받기</strong></a></td>
      <td align="center"><a href="https://raw.githubusercontent.com/mym0404/hades-deck/main/cards/hades-anki.csv"><strong>Raw CSV 다운로드</strong></a></td>
      <td align="center"><a href="#어떻게-쓰는가"><strong>바로 쓰는 법</strong></a></td>
      <td align="center"><a href="#파이프라인"><strong>선별 방식 보기</strong></a></td>
    </tr>
  </table>
</div>

---

> Hades를 영어로 켰다.  
> 그리고 곧 깨달았다.  
> 내가 로그라이크를 하는 건지, 고전풍 어휘에게 두들겨 맞는 건지 구분이 안 간다.
>
> 그래서 이 저장소를 만들었다.  
> 모르는 단어를 그냥 참는 대신, 대사 전체를 긁어와서,  
> 너무 쉬운 단어는 덜어내고, 신화풍이고 문학적이고 게임 이해에 중요한 것만 골라  
> Anki 카드 CSV로 정리해 버리는 프로젝트다.

<div align="center">
  <img src="./assets/readme/official/Hades_PackArt.jpg" width="78%" alt="Hades pack art" />
</div>

---

## 이 저장소가 하는 일

<table>
  <tr>
    <td width="33%" align="center">
      <strong>대사 전체 분석</strong>
      <br />
      Hades 전체 대사를 긁어와서 section, speaker, sentence 단위로 구조화한다.
    </td>
    <td width="33%" align="center">
      <strong>쓸모없는 카드 제거</strong>
      <br />
      B2 이하 일반어, 고유명사, 잡음 토큰, 낭비 카드 후보를 최대한 걷어낸다.
    </td>
    <td width="33%" align="center">
      <strong>균형판 150장 제공</strong>
      <br />
      고전풍, 신화풍, 드라마틱한 어휘를 중심으로 바로 넣을 수 있는 CSV를 제공한다.
    </td>
  </tr>
</table>

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&color=0:2b0d0d,50:b88a2d,100:2b0d0d&height=5&section=footer" width="100%" alt="Divider" />
</div>

## 무엇이 들어 있나

| 항목 | 설명 |
| --- | --- |
| `cards/hades-anki.csv` | 최종 균형판 Anki Deck CSV |
| `src/data/curated-cards.ts` | 코어 카드 + 확장 카드 합본 export |
| `src/data/balanced-cards.ts` | 150장 균형판을 만드는 추가 카드 데이터 |
| `src/core/analyzer.ts` | 대사 후보 추출, 필터링, 점수화 |
| `src/cli/main.ts` | `rank`, `sample`, `export-anki`, `validate-anki` CLI |

---

## 갤러리

<div align="center">
  <table>
    <tr>
      <td align="center" width="50%">
        <img src="./assets/readme/official/4K_OpeningChamber.jpg" width="100%" alt="Opening chamber screenshot" />
      </td>
      <td align="center" width="50%">
        <img src="./assets/readme/official/4K_Hades_BowCombat.jpg" width="100%" alt="Bow combat screenshot" />
      </td>
    </tr>
    <tr>
      <td align="center" width="50%">
        <img src="./assets/readme/official/4K_Hades_HouseOfHades.jpg" width="100%" alt="House of Hades screenshot" />
      </td>
      <td align="center" width="50%">
        <img src="./assets/readme/official/4K_Hades_MegaeraDialogue.jpg" width="100%" alt="Megaera dialogue screenshot" />
      </td>
    </tr>
  </table>
</div>

<details>
  <summary><strong>벽지처럼 더 깔아두기</strong></summary>
  <br />
  <div align="center">
    <img src="./assets/readme/official/Wallpaper_Chaos.jpg" width="32%" alt="Chaos wallpaper" />
    <img src="./assets/readme/official/Wallpaper_Hermes.png" width="32%" alt="Hermes wallpaper" />
    <img src="./assets/readme/official/Wallpaper_Thanatos.png" width="32%" alt="Thanatos wallpaper" />
  </div>
  <br />
  <div align="center">
    <img src="./assets/readme/official/Wallpaper_Heroes.png" width="80%" alt="Heroes wallpaper" />
  </div>
</details>

---

## 왜 굳이 Anki냐

<table>
  <tr>
    <td width="50%">
      Hades 대사는 분위기가 좋다. 문제는 분위기만 좋은 게 아니라 단어도 아주 세게 들어온다는 점이다.
      <br />
      <br />
      `wrath`, `denizen`, `transpire`, `chthonic`, `deference` 같은 단어를 그냥 넘기면 스토리의 뉘앙스가 통째로 흐려진다.
    </td>
    <td width="50%">
      그래서 이 프로젝트는 “단어장을 만드는 도구”가 아니라, “영어 Hades를 제대로 즐기기 위한 구조적 복수”에 가깝다.
      <br />
      <br />
      한 번 맞고 끝내지 않고, CSV로 뽑아 외우고, 다시 들어가서 대사를 이해한다.
    </td>
  </tr>
</table>

<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Chakra+Petch&weight=700&size=22&duration=3200&pause=1200&color=E8C25B&center=true&vCenter=true&repeat=true&width=980&height=70&lines=%EC%8A%A4%ED%86%A0%EB%A6%AC%EA%B0%80+%EC%95%88+%EB%93%A4%EC%96%B4%EC%98%A4%EB%A9%B4+%EB%8B%A8%EC%96%B4%EB%B6%80%ED%84%B0+%EC%A0%95%EB%A6%AC%ED%95%9C%EB%8B%A4.;%EB%8B%A8%EC%96%B4%EA%B0%80+%EC%A0%95%EB%A6%AC%EB%90%98%EB%A9%B4+%EB%8C%80%EC%82%AC%EA%B0%80+%EB%93%A4%EB%A6%B0%EB%8B%A4.;%EB%8C%80%EC%82%AC%EA%B0%80+%EB%93%A4%EB%A6%AC%EB%A9%B4+%EB%93%9C%EB%94%94%EC%96%B4+%EB%82%B4%EA%B0%80+%EC%95%88+%EB%A7%9E%EB%8A%94%EB%8B%A4." alt="Animated quote" />
</div>

---

## 파이프라인

```mermaid
flowchart LR
    A["Hades 전체 대사"] --> B["파서: section / speaker / sentence 분리"]
    B --> C["후보 추출: 단일 단어 + 구 표현"]
    C --> D["필터링: B2 일반어 / 고유명사 / 노이즈 제거"]
    D --> E["점수화: 희소성 / 문체성 / 학습가치"]
    E --> F["균형판 150장 선별"]
    F --> G["Anki CSV 내보내기"]
    G --> H["영어 Hades 재도전"]
```

<details open>
  <summary><strong>선별 기준 요약</strong></summary>
  <br />

  | 기준 | 설명 |
  | --- | --- |
  | 희소성 | CEFR 바깥 + 일반 빈도 낮은 단어 우선 |
  | 문체성 | 신화풍, 고전풍, 문학적 톤에 가산점 |
  | 학습가치 | 예문이 선명하고 카드로 만들었을 때 기억에 남는 단어 우선 |
  | 실전성 | 실제 캐릭터 대사에서 힘을 발휘하는 단어에 가산점 |
  | 절제 | 이름, 지명, 쉬운 일반어, 어정쩡한 카드 후보는 최대한 제거 |
</details>

---

## 어떻게 쓰는가

1. [균형판 CSV](./cards/hades-anki.csv) 또는 [raw 다운로드 링크](https://raw.githubusercontent.com/mym0404/hades-deck/main/cards/hades-anki.csv)로 파일을 받는다.
2. Anki에서 `파일 가져오기`로 `cards/hades-anki.csv`를 넣는다.
3. Hades를 영어로 켠다.
4. 다시 단어에게 맞는다.
5. 이번에는 복습으로 반격한다.

---

## CLI

<details>
  <summary><strong>직접 다시 뽑고 싶다면</strong></summary>

```bash
pnpm install
pnpm cli rank --output out/ranked-candidates.csv
pnpm cli sample --text "Hades: I expect for you to show deference to her, at all times!"
pnpm cli export-anki --output cards/hades-anki.csv
pnpm cli validate-anki --input cards/hades-anki.csv
```

</details>

---

## 프로젝트 성격

이 저장소는 학술 프로젝트도 아니고, 순한 단어장도 아니다.

이건 대충 이런 흐름이다.

<table>
  <tr>
    <td align="center" width="33%"><strong>1. 맞는다</strong></td>
    <td align="center" width="33%"><strong>2. 뽑는다</strong></td>
    <td align="center" width="33%"><strong>3. 외운다</strong></td>
  </tr>
  <tr>
    <td align="center">영어 Hades가 생각보다 훨씬 난폭하다.</td>
    <td align="center">대사를 분석해서 진짜 필요한 카드만 남긴다.</td>
    <td align="center">이제 스토리를 이해하면서 다시 플레이한다.</td>
  </tr>
</table>

---

## 출처

- 카드 대상 대사는 Hades 대사 텍스트를 기반으로 분석했다.
- README 시각 자산은 [Supergiant Games의 Hades 공식 페이지](https://www.supergiantgames.com/games/hades/)에서 제공되는 공식 미디어 자산을 사용했다.
- 이 저장소의 최종 목표는 Hades를 영어로 즐기되, 모르는 단어 때문에 스토리가 증발하지 않게 만드는 것이다.

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=180&section=footer&color=0:160707,20:3a0d0d,45:7a1414,70:c08b2c,100:f8e7a1&text=Now%20Go%20Back%20to%20the%20Underworld&fontSize=34&fontColor=fff6d6&animation=fadeIn&fontAlignY=68" width="100%" alt="Footer banner" />
</div>
