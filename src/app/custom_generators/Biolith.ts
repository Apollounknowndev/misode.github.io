import type { CollectionRegistry, SchemaRegistry } from '@mcschema/core'
import { Case, ListNode, Mod, NumberNode, ObjectNode, Opt, Reference as RawReference, StringNode as RawStringNode, Switch } from '@mcschema/core'


const ID = 'biolith'

export function initBiolith(schemas: SchemaRegistry, collections: CollectionRegistry) {
	const Reference = RawReference.bind(undefined, schemas)
	const StringNode = RawStringNode.bind(undefined, collections)

	schemas.register(`${ID}:biome_placement`, Mod(ObjectNode({
		additions: Opt(ListNode(ObjectNode({
			dimension: StringNode({ validator: 'resource', params: { pool: '$dimension' } }),
			biome: StringNode({ validator: 'resource', params: { pool: '$worldgen/biome' } }),
			noise: Reference('parameter_point'),
		}))),

		removals: Opt(ListNode(ObjectNode({
			dimension: StringNode({ validator: 'resource', params: { pool: '$dimension' } }),
			biome: StringNode({ validator: 'resource', params: { pool: '$worldgen/biome' } }),
		}))),

		replacements: Opt(ListNode(ObjectNode({
			dimension: StringNode({ validator: 'resource', params: { pool: '$dimension' } }),
			target: StringNode({ validator: 'resource', params: { pool: '$worldgen/biome' } }),
			biome: StringNode({ validator: 'resource', params: { pool: '$worldgen/biome' } }),
			proportion: Opt(NumberNode({ min: 0, max: 1 })),
		}))),

		sub_biomes: Opt(ListNode(Mod(ObjectNode({
			dimension: StringNode({ validator: 'resource', params: { pool: '$dimension' } }),
			target: StringNode({ validator: 'resource', params: { pool: '$worldgen/biome' } }),
			biome: StringNode({ validator: 'resource', params: { pool: '$worldgen/biome' } }),
			criterion: Reference(`${ID}:sub_biome_matcher`),
		}), {
			default: () => ({
				dimension: 'minecraft:overworld'
			}),
		}))),

	}, { context: `${ID}.biome_placement`, disableSwitchContext: true }), {
		default: () => ({}),
	}))
	
	schemas.register(`${ID}:sub_biome_matcher`, ObjectNode({
		type: StringNode({ enum: ['biolith:not', 'biolith:all_of', 'biolith:any_of', 'biolith:deviation', 'biolith:value', 'biolith:ratio', 'biolith:original', 'biolith:neighbor', 'biolith:alternate'] }),
		[Switch]: [{ push: 'type' }],
		[Case]: {
			'biolith:not': {
				criterion: Reference(`${ID}:sub_biome_matcher`),
			},
			'biolith:all_of': {
				criteria: ListNode(Reference(`${ID}:sub_biome_matcher`)),
			},
			'biolith:any_of': {
				criteria: ListNode(Reference(`${ID}:sub_biome_matcher`)),
			},
			'biolith:deviation': {
				parameter: StringNode({ enum: ['continentalness', 'depth', 'erosion', 'humidity', 'peaks_valleys', 'temperature', 'weirdness'] }),
				min: Opt(NumberNode()),
				max: Opt(NumberNode()),
			},
			'biolith:value': {
				parameter: StringNode({ enum: ['continentalness', 'depth', 'erosion', 'humidity', 'peaks_valleys', 'temperature', 'weirdness'] }),
				min: Opt(NumberNode()),
				max: Opt(NumberNode()),
			},
			'biolith:ratio': {
				target: StringNode({ enum: ['center', 'edge'] }),
				min: Opt(NumberNode()),
				max: Opt(NumberNode()),
			},
			'biolith:original': {
				biome_target: StringNode({ validator: 'resource', params: { pool: '$worldgen/biome', allowTag: true } })
			},
			'biolith:neighbor': {
				biome_target: StringNode({ validator: 'resource', params: { pool: '$worldgen/biome', allowTag: true } })
			},
			'biolith:alternate': {
				biome_target: StringNode({ validator: 'resource', params: { pool: '$worldgen/biome', allowTag: true } }),
				alternate: StringNode({ validator: 'resource', params: { pool: '$worldgen/biome' } })
			}
		}
	}))
}
