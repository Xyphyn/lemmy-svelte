interface ParsedBlock {
  type: string
  name: string
  items: BlockItem[]
}

type BlockItem = { key: string; value: string }

export function parseListBlock(
  content: string,
  splitter: string = '. '
): ParsedBlock | null {
  const regex = /:::\s*(\w+)\s+(\w+)\n([\s\S]*?)\n:::/
  const match = content.match(regex)

  if (!match) return null

  const [_, type, name, itemsContent] = match

  if (typeof itemsContent === 'undefined') return null

  const items: BlockItem[] = itemsContent
    .trim()
    .split('\n')
    .map((line) => {
      const [key, value] = line.split(splitter)
      return {
        key: key,
        value: value?.trim(),
      }
    })

  return {
    type,
    name,
    items,
  }
}
