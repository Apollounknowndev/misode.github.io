import type { CollectionRegistry, NodeChildren, SchemaRegistry } from '@mcschema/core'
import { BooleanNode, Case, ChoiceNode, ListNode, Mod, NumberNode, ObjectNode, Opt, Reference as RawReference, StringNode as RawStringNode, Switch } from '@mcschema/core'
import type { VersionId } from '../services/Schemas.js'
import { HolderSet, MobCategorySpawnSettings } from './Common.js'
import { DensityFunction } from './DensityFunctions.js'

export function initWorldgenModifiers(schemas: SchemaRegistry, collections: CollectionRegistry, version: VersionId) {
	const Reference = RawReference.bind(undefined, schemas)
	const StringNode = RawStringNode.bind(undefined, collections)

	collections.register(`lithostitched:modifier_type`, [
		'lithostitched:add_biome_spawns',
		'lithostitched:add_features',
		'lithostitched:add_processor_list_processors',
		'lithostitched:add_structure_set_entries',
		'lithostitched:add_surface_rule',
		'lithostitched:add_template_pool_elements',
		'lithostitched:no_op',
		'lithostitched:redirect_feature',
		'lithostitched:remove_biome_spawns',
		'lithostitched:remove_features',
		'lithostitched:remove_structures_from_structure_set',
		'lithostitched:replace_climate',
		'lithostitched:replace_effects',
		...(version === '1.21') ? ['lithostitched:set_pool_aliases']: [],
		'lithostitched:wrap_density_function',
		'lithostitched:wrap_noise_router',
	])

  const Conditions: NodeChildren = version === '1.21' ? {
    'fabric:load_conditions': Opt(ListNode(Reference('fabric:load_condition'))), 
    'neoforge:conditions': Opt(ListNode(Reference('neoforge:load_condition'))), 
  } : {
		predicate: Opt(Reference(`lithostitched:modifier_predicate`))
	}

	schemas.register(`lithostitched:worldgen_modifier`, Mod(ObjectNode({
		...Conditions,
		type: StringNode({ validator: 'resource', params: { pool: `lithostitched:modifier_type` as any } }),
		[Switch]: [{ push: 'type' }],
		[Case]: {
			'lithostitched:add_biome_spawns': {
				biomes: HolderSet({ resource: '$worldgen/biome' }),
				spawners: ChoiceNode([
					{
						type: 'object',
						node: MobCategorySpawnSettings,
						change: (v: any) => v[0],
					},
					{
						type: 'list',
						node: ListNode(MobCategorySpawnSettings),
						change: (v: any) => Array(v),
					},
				]),
			},
			'lithostitched:add_features': {
				biomes: HolderSet({ resource: '$worldgen/biome' }),
				features: HolderSet({ resource: '$worldgen/placed_feature', inlineSchema: 'placed_feature' }),
				step: StringNode({ enum: 'decoration_step' }),
			},
			'lithostitched:add_processor_list_processors': {
				processor_list: StringNode({ validator: 'resource', params: { pool: '$worldgen/processor_list' } }),
				processors: ListNode(Reference('processor')),
			},
			'lithostitched:add_structure_set_entries': {
				structure_set: StringNode({ validator: 'resource', params: { pool: '$worldgen/structure_set' } }),
				entries: ListNode(
					ObjectNode({
						structure: StringNode({ validator: 'resource', params: { pool: '$worldgen/structure' } }),
						weight: NumberNode({ integer: true, min: 1 }),
					})
				),
			},
			'lithostitched:add_surface_rule': {
				levels: ListNode(StringNode({ validator: 'resource', params: { pool: '$dimension' } })),
				surface_rule: Reference('material_rule'),
			},
			'lithostitched:add_template_pool_elements': {
				template_pool: StringNode({ validator: 'resource', params: { pool: '$worldgen/template_pool' } }),
				elements: ListNode(
					Reference('template_weighted_element')
				),
			},
			'lithostitched:redirect_feature': {
				placed_feature: StringNode({ validator: 'resource', params: { pool: '$worldgen/placed_feature' } }),
				redirect_to: StringNode({ validator: 'resource', params: { pool: '$worldgen/configured_feature' } }),
			},
			'lithostitched:remove_biome_spawns': {
				biomes: HolderSet({ resource: '$worldgen/biome' }),
				mobs: HolderSet({ resource: 'entity_type' }),
			},
			'lithostitched:remove_features': {
				biomes: HolderSet({ resource: '$worldgen/biome' }),
				features: HolderSet({ resource: '$worldgen/placed_feature', inlineSchema: 'placed_feature' }),
				step: StringNode({ enum: 'decoration_step' }),
			},
			'lithostitched:remove_structures_from_structure_set': {
				structure_set: StringNode({ validator: 'resource', params: { pool: '$worldgen/structure_set' } }),
				structures: ListNode(
					StringNode({ validator: 'resource', params: { pool: '$worldgen/structure' } })
				),
			},
			'lithostitched:replace_climate': {
				biomes: HolderSet({ resource: '$worldgen/biome' }),
				climate: ObjectNode({
					temperature: NumberNode(),
					downfall: NumberNode(),
					has_precipitation: BooleanNode(),
					temperature_modifier: Opt(StringNode({ enum: ['none', 'frozen'] })),
				}),
			},
			'lithostitched:replace_effects': {
				biomes: HolderSet({ resource: '$worldgen/biome' }),
				effects: ObjectNode({
					sky_color: Opt(NumberNode({ color: true })),
					fog_color: Opt(NumberNode({ color: true })),
					water_color: Opt(NumberNode({ color: true })),
					water_fog_color: Opt(NumberNode({ color: true })),
					grass_color: Opt(NumberNode({ color: true })),
					foliage_color: Opt(NumberNode({ color: true })),
					grass_color_modifier: Opt(StringNode({ enum: ['none', 'dark_forest', 'swamp'] })),
					ambient_sound: Opt(StringNode()),
					mood_sound: Opt(ObjectNode({
						sound: StringNode(),
						tick_delay: NumberNode({ integer: true }),
						block_search_extent: NumberNode({ integer: true }),
						offset: NumberNode(),
					})),
					additions_sound: Opt(ObjectNode({
						sound: StringNode(),
						tick_chance: NumberNode({ min: 0, max: 1 }),
					})),
					music: Opt(ObjectNode({
						sound: StringNode(),
						min_delay: NumberNode({ integer: true, min: 0 }),
						max_delay: NumberNode({ integer: true, min: 0 }),
						replace_current_music: BooleanNode(),
					})),
					particle: Opt(ObjectNode({
						options: ObjectNode({
							type: StringNode(),
						}),
						probability: NumberNode({ min: 0, max: 1 }),
					})),
				}),
			},
			'lithostitched:set_pool_aliases': {
				structure: StringNode({ validator: 'resource', params: { pool: '$worldgen/structure' } }),
				pool_aliases: Reference('pool_alias_binding'),
				append: BooleanNode()
			},
			'lithostitched:wrap_density_function': {
				priority: Opt(NumberNode({ integer: true, min: 0 })),
				target_function: StringNode({ validator: 'resource', params: { pool: '$worldgen/density_function' }}),
				wrapper_function: DensityFunction,
			},
			'lithostitched:wrap_noise_router': {
				priority: Opt(NumberNode({ integer: true, min: 0 })),
				target: StringNode({ enum: ['barrier', 'fluid_level_floodedness', 'fluid_level_spread', 'lava', 'temperature', 'vegetation', 'continents', 'erosion', 'depth', 'ridges', 'initial_density_without_jaggedness', 'final_density', 'vein_toggle', 'vein_ridged', 'vein_gap'] }),
				wrapper_function: DensityFunction,
			},
		},
	}, { context: `lithostitched.worldgen_modifier`, disableSwitchContext: true }), {
		default: () => ({
			type: `lithostitched:add_features`,
			biomes: '#minecraft:is_overworld',
			features: 'example:ore_ruby',
			step: 'underground_ores',
		}),
	}))

	// Lithostitched

	collections.register(`lithostitched:modifier_predicate_type`, [
		'lithostitched:all_of',
		'lithostitched:any_of',
		'lithostitched:mod_loaded',
		'lithostitched:not',
		'lithostitched:true',
	])

	schemas.register(`lithostitched:modifier_predicate`, ObjectNode({
		type: StringNode({ validator: 'resource', params: { pool: `lithostitched:modifier_predicate_type` as any } }),
		[Switch]: [{ push: 'type' }],
		[Case]: {
			'lithostitched:all_of': {
				predicates: ListNode(Reference(`lithostitched:modifier_predicate`)),
			},
			'lithostitched:any_of': {
				predicates: ListNode(Reference(`lithostitched:modifier_predicate`)),
			},
			'lithostitched:mod_loaded': {
				mod_id: StringNode(),
			},
			'lithostitched:not': {
				predicate: Reference(`lithostitched:modifier_predicate`),
			},
		},
	}, {
		context: `lithostitched.modifier_predicate`, disableSwitchContext: true,
	}))

	// Fabric

	collections.register(`fabric:load_condition`, [
		'fabric:and',
		'fabric:or',
		'fabric:not',
		'fabric:true',
		'fabric:all_mods_loaded',
		'fabric:any_mods_loaded',
		'fabric:features_enabled',
		'fabric:registry_contains',
		'fabric:tags_populated',
	])

	schemas.register(`fabric:load_condition`, ObjectNode({
		condition: StringNode({ validator: 'resource', params: { pool: `fabric:load_condition` as any } }),
		[Switch]: [{ push: 'condition' }],
		[Case]: {
			'fabric:and': {
				value: ListNode(Reference(`fabric:load_condition`)),
			},
			'fabric:or': {
				values: ListNode(Reference(`fabric:load_condition`)),
			},
			'fabric:not': {
				value: Reference(`fabric:load_condition`),
			},
			'fabric:all_mods_loaded': {
				values: ListNode(StringNode()),
			},
			'fabric:any_mods_loaded': {
				values: ListNode(StringNode()),
			},
			'fabric:features_enabled': {
				features: ListNode(StringNode()),
			},
			'fabric:registry_contains': {
				registry: StringNode(),
				values: ListNode(StringNode()),
			},
			'fabric:tags_populated': {
				registry: StringNode(),
				values: ListNode(StringNode()),
			},
		},
	}, {
		context: `fabric.load_condition`, disableSwitchContext: true,
	}))

	// Neoforge

	collections.register(`neoforge:load_condition`, [
		'neoforge:true',
		'neoforge:false',
		'neoforge:and',
		'neoforge:or',
		'neoforge:not',
		'neoforge:mod_loaded',
		'neoforge:item_exists',
		'neoforge:tag_empty',
	])

	schemas.register(`neoforge:load_condition`, ObjectNode({
		type: StringNode({ validator: 'resource', params: { pool: `neoforge:load_condition` as any } }),
		[Switch]: [{ push: 'type' }],
		[Case]: {
			'neoforge:and': {
				value: ListNode(Reference(`neoforge:load_condition`)),
			},
			'neoforge:or': {
				values: ListNode(Reference(`neoforge:load_condition`)),
			},
			'neoforge:not': {
				value: Reference(`neoforge:load_condition`),
			},
			'neoforge:mod_loaded': {
				modid: StringNode(),
			},
			'neoforge:item_exists': {
				item: StringNode(),
			},
			'neoforge:tag_empty': {
				tag: StringNode({ validator: 'resource', params: { pool: '$tag/item' } }),
			},
		},
	}, {
		context: `neoforge.load_condition`, disableSwitchContext: true,
	}))
}
