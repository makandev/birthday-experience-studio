# Experience Engine

A generated gift is an ordered composition of reusable Experience Blocks.

Initial candidate block types include intro, greeting, memory, appreciation, story, photo, timeline, humor, insider, letter, birthday wish, future wish, surprise reveal, hidden message, interactive choice, gallery and finale.

Each block type should define:
- stable type ID
- version
- typed recipient-visible data
- editor metadata
- renderer/runtime contract
- capability requirements where relevant

Composition may recommend blocks/order/intensity based on creator signals, but the creator retains control.

Themes style blocks without owning their semantic content.
