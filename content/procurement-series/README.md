# Five procurement articles — maintained source

The five English articles and twenty locale articles live here as UTF-8 Markdown.
Only text between `ARTICLE START` and `ARTICLE END` is published. Frontmatter
supplies search titles, descriptions and localized closing button text.

Run `npm run i18n:prepare-series` after editing these sources. It parses the supplied
prose, generates the language-specific article datasets and SEO metadata, and adds
missing registered URLs to the sitemap while retaining existing image entries.
It does not translate text or contact an external translation service.

Use the terminology and tone guidance in `scripts/localization/adapters/` when
writing locale prose. English is the source revision. The recorded source and target
hashes are checked by `npm run verify`, including English edits that leave the
section structure unchanged. Preparation retains the old accepted English hash when
the target is unchanged. Update the affected translation before preparing again;
an edited target is treated as an explicit acceptance of the current English source.
This tracks revisions, not translation accuracy or semantic equivalence.

`src/content/procurement-series.js` registers the five route families and catalog
entries. Each existing language chunk imports only its own dataset. The shared
renderer maintains localized product links, form context and visible FAQ markup.

Release: run `npm run verify` once for the batch. No upload, Git commit or PUSH is
performed by preparation or verification. `content/` and `scripts/` are local/build
sources; only generated website copy and existing assets enter the public site.
