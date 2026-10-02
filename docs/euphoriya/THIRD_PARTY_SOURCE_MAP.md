# Third-party source map

Track imported source trees and every future cross-project code reuse here. ZIP root directory names are stripped during extraction; paths below are relative to each archive root. Source-project files remain in their own directory and retain their source license files and copyright notices.

| sourceProject | originalPath | destinationPath | license | modifications | reasonForReuse |
| --- | --- | --- | --- | --- | --- |
| Fantasia Archive 2.4.16 | `fantasia-archive-master/**` | repository root `/**` | GPL-3.0 (`LICENSE.md`) | None at import; files preserved in place. | Existing desktop application shell and baseline source project. |
| Narra 0.1.0 | `narra-main/**` | `narra/**` | MIT (`narra/LICENSE`) | None at import; files preserved in place. | Isolated reference/import source for narrative, graph, knowledge, and semantic-search capabilities. |
| Loreum | `loreum-main/**` | `loreum/**` | AGPL-3.0 (`loreum/LICENSE`) | None at import; files preserved in place. | Isolated reference/import source for entity, graph, timeline, story, wiki, and MCP capabilities. |

**Cross-project implementation reuse to date:** none. The convergence documents and new Euphoriya design/foundation are original work; no Narra or Loreum implementation modules have been copied into Fantasia application modules.

For each future implementation reuse, add a separate row with a specific file/range (not just a project directory), upstream URL/revision if available, precise destination path, license/SPDX identifier, copyright notices retained, modifications, and reason. Keep original license/notice files. Reimplementations inspired by behavior still require clear provenance notes; do not label a port as newly authored. Obtain legal review before combining or distributing AGPL-3.0 implementation code with the GPL-3.0 desktop application. This table is provenance tracking, not a compatibility determination or license grant.
