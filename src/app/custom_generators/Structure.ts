import type { CollectionRegistry, ResourceType, SchemaRegistry } from '@mcschema/core'
import { Case, ChoiceNode, ListNode, Mod, NumberNode, ObjectNode, Opt, Reference as RawReference, StringNode as RawStringNode, Switch } from '@mcschema/core'


const ID = 'lithostitched'

export function initStructure(schemas: SchemaRegistry, collections: CollectionRegistry) {
	const Reference = RawReference.bind(undefined, schemas)
	const StringNode = RawStringNode.bind(undefined, collections)

	const Tag = (id: Exclude<ResourceType, `$tag/${string}`>) =>
		ChoiceNode(
			[
				{
					type: 'string',
					node: StringNode({
						validator: 'resource',
						params: { pool: id, allowTag: true },
					}),
					change: (v: unknown) => {
						if (
							Array.isArray(v) &&
							typeof v[0] === 'string' &&
							!v[0].startsWith('#')
						) {
							return v[0]
						}
						return undefined
					},
				},
				{
					type: 'list',
					node: ListNode(
						StringNode({ validator: 'resource', params: { pool: id } })
					),
					change: (v: unknown) => {
						if (typeof v === 'string' && !v.startsWith('#')) {
							return [v]
						}
						return []
					},
				},
			],
			{ choiceContext: 'tag' }
	)

	const Structure = ChoiceNode([
    {
      type: 'string',
      node: StringNode({ validator: 'resource', params: { pool: '$worldgen/structure' } })
    },
    {
      type: 'object',
      node: Reference('structure')
    }
  ], { choiceContext: 'feature' })

	collections.register(`${ID}:structure_type`, [
		'lithostitched:delegating',
	])

	collections.register(`${ID}:structure_condition_type`, [
		'lithostitched:all_of',
		'lithostitched:any_of',
		'lithostitched:height_filter',
		'lithostitched:in_biome',
		'lithostitched:not',
		'lithostitched:offset',
		'lithostitched:sample_density',
		'lithostitched:true',
	])

	schemas.register(`${ID}:structure`, Mod(ObjectNode({
		type: StringNode({ validator: 'resource', params: { pool: `${ID}:structure_type` as any } }),
		delegate: Structure,
		spawn_condition: Reference(`${ID}:structure_condition`)
	}, { context: `${ID}.structure`, disableSwitchContext: true }), {
		default: () => ({
			type: 'lithostitched:delegating'
		}),
	}))

	schemas.register(`${ID}:structure_condition`, ObjectNode({
		type: StringNode({ validator: 'resource', params: { pool: `${ID}:structure_condition_type` as any } }),
		[Switch]: [{ push: 'type' }],
		[Case]: {
			'lithostitched:all_of': {
				conditions: ListNode(Reference(`${ID}:structure_condition`)),
			},
			'lithostitched:any_of': {
				conditions: ListNode(Reference(`${ID}:structure_condition`)),
			},
			'lithostitched:height_filter': {
				min_inclusive: Opt(Reference('vertical_anchor')),
				max_inclusive: Opt(Reference('vertical_anchor'))
			},
			'lithostitched:not': {
				condition: Reference(`${ID}:structure_condition`),
			},
			'lithostitched:in_biome': {
				biomes: Tag('$worldgen/biome'),
			},
			'lithostitched:offset': {
				condition: Reference(`${ID}:structure_condition`),
				offset: ListNode(
					NumberNode({ integer: true, min: -16, max: 16 }),
					{ minLength: 3, maxLength: 3 }
				)
			},
			'lithostitched:sample_density': {
				density_function: StringNode({ validator: 'resource', params: { pool: '$worldgen/density_function' }}),
				min_inclusive: Opt(NumberNode()),
				max_inclusive: Opt(NumberNode())
			},
		},
	}, {
		context: `${ID}.structure_condition`, disableSwitchContext: true,
	}))
}
