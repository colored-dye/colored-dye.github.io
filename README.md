# colored-dye's blog

## Memo for myself

1. jekyll does not publish posts in the future, so set the front matter properly.
   For example, if I am in UTC+8 timezone, the `date` field of the front matter should contain:
   ```yaml
   date: 2026-02-18 01:06:00 +0800
   ```
2. Citation in Distill-style posts.
   Add bibliography to the front matter:
   ```yaml
   bibliography: 2026-02-18-concept-das.bib
   ```
   Use `<d-cite>` tag for hoverable citation (`[1]`), and separate bibtex keys with commas for citing multiple articles (`[1,2]`):
   ```html
   <d-cite key="john2000foo,doe2001bar"></d-cite>
   ```
3. Generate citation info for the current post.
   Add option to the front matter:
   ```yaml
   citation: true
   ```
