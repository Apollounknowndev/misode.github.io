import type { CollectionRegistry, SchemaRegistry } from '@mcschema/core'
import { ChoiceNode, ListNode, NumberNode, ObjectNode, StringNode as RawStringNode } from '@mcschema/core'


const ID = 'expedition'

export function initPlanetTypes(schemas: SchemaRegistry, collections: CollectionRegistry) {
	const StringNode = RawStringNode.bind(undefined, collections)



  const Range = ChoiceNode([
    {
      type: 'number',
      node: NumberNode({ min: 0, max: 1 }),
      change: (v: any) => Array.isArray(v) ? (v[0] ?? 0) : (v?.min_inclusive ?? 0)
    },
    {
      type: 'list',
      node: ListNode(
        NumberNode({ min: 0, max: 1 }),
        { minLength: 2, maxLength: 2 },
      ),
      change: (v: any) => typeof v === 'number' ? [v, v] : [v?.min_inclusive ?? 0, v?.max_inclusive ?? 0]
    },
    {
      type: 'object',
      node: ObjectNode({
				min_inclusive: NumberNode({ min: 0, max: 1 }),
				max_inclusive: NumberNode({ min: 0, max: 1 })
			}),
      change: (v: any) => Array.isArray(v) ? {min_inclusive: v[0] ?? 0, max_inclusive: v[1] ?? 0} : {min_inclusive: v ?? 0, max_inclusive: v ?? 0}
    }
  ])

	const Bonus = ObjectNode({
		amount: NumberNode({ integer: true }),
		atmosphere: StringNode(),
		size: Range,
		temperature: Range,
		gravity: Range
	})

	schemas.register(`${ID}:planet_type`, ObjectNode({
		biomes: ListNode(ObjectNode({
			biome: StringNode({ validator: 'resource', params: { pool: '$worldgen/biome' } }),
			weight: ObjectNode({
				base: NumberNode({ integer: true }),
				bonus: ChoiceNode([
					{
						type: 'object',
						node: Bonus,
						change: (v: any) => v[0],
					},
					{
						type: 'list',
						node: ListNode(Bonus),
						change: (v: any) => Array(v),
					},
				]),
			})
		}))
	}))
}
