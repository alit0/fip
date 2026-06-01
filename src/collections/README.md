# Payload collections (Phase 3)

Payload CMS is **not wired yet** — it lands in Phase 3 to avoid forcing a Postgres
dependency on the empty skeleton.

Each entity from the data model becomes one file here (one `CollectionConfig` per file):

`Editions.ts`, `Rubros.ts`, `Categories.ts`, `Jurors.ts`, `Winners.ts`,
`HallOfFame.ts`, `RankingEntries.ts`, `Sponsors.ts`, `DownloadFiles.ts`,
`PageContents.ts`, `Users.ts`, `AgencyEntries.ts`, `JurorAssignments.ts`, `Votes.ts`,
plus `globals/SiteConfig.ts`.

Translatable fields (es/pt) are declared per-field with `localized: true`.
