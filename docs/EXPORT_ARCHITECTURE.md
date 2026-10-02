# Export Architecture

Primary early target: a single portable offline HTML file.

Pipeline:
CreatorProject → validate → recipient-safe projection → resolve blocks/theme/media → bundle minimal Experience Runtime → embed required assets → generate HTML → post-export validation.

Requirements:
- no Creator UI
- no hidden creator answers
- no API keys
- no mandatory network resources
- graceful handling of large media
- deterministic/reproducible where practical
- safe text/HTML handling
- recipient can open the file without installing software

Single HTML is an output artifact; source code remains modular.
