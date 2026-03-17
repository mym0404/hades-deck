# hades-deck

`Hades` 대사에서 학습 가치가 높은 어휘 후보를 추출해 Anki 제작용 CSV를 준비하는 CLI입니다.

## Commands

```bash
pnpm cli rank --output out/ranked-candidates.csv
pnpm cli sample --text "Hades: I expect for you to show deference to her, at all times!"
pnpm cli export-anki --output cards/hades-anki.csv
pnpm cli validate-anki --input cards/hades-anki.csv
```

## Notes

- `rank` 기본 입력은 공식 `@All.txt` raw URL입니다.
- 검토용 후보 CSV는 `headword,type,lemma,total_score,reason_flags,corpus_freq,source_sentence,source_clause,speaker,section`를 포함합니다.
- 최종 카드 내용은 저장소 안의 curated 카드 데이터에서 직접 생성합니다.
