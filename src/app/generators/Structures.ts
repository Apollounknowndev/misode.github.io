import type { CollectionRegistry, NodeChildren, SchemaRegistry } from '@mcschema/core'
import { BooleanNode, Case, ChoiceNode, ListNode, MapNode, Mod, NumberNode, ObjectNode, Opt, Reference as RawReference, StringNode as RawStringNode, Switch } from '@mcschema/core'
import { VersionId } from '../services/Schemas.js'
import { HolderSet, IntProvider, MobCategorySpawnSettings } from './Common.js'

export function initStructures(schemas: SchemaRegistry, collections: CollectionRegistry, version: VersionId) {
	const Reference = RawReference.bind(undefined, schemas)
	const StringNode = RawStringNode.bind(undefined, collections)

  const SharedSettings: NodeChildren = {
    biomes: HolderSet({ resource: '$worldgen/biome' }),
    step: StringNode({ enum: 'decoration_step' }),
    spawn_overrides: MapNode(
      StringNode({ enum: 'mob_category' }),
      ObjectNode({
        bounding_box: StringNode({ enum: ['piece', 'full'] }),
        spawns: ListNode(MobCategorySpawnSettings),
      })
    ),
    terrain_adaptation: Opt(StringNode({ enum: ['none', 'beard_thin', 'beard_box', 'bury', ...(version === '1.21') ? ['encapsulate']: []]})),
  }

  const OneTwentyOneJigsawSettings: NodeChildren = version === '1.21' ? {
    liquid_settings: Opt(StringNode({ enum: ['apply_waterlogging', 'ignore_waterlogging'] })),
    dimension_padding: Opt(Reference('dimension_padding')),
    pool_aliases: Opt(ListNode(Reference('pool_alias_binding')))
  } : {}

  const Structure = ChoiceNode([
    {
      type: 'string',
      node: StringNode({ validator: 'resource', params: { pool: '$worldgen/structure' } })
    },
    {
      type: 'object',
      node: Reference('structure')
    }
  ], { choiceContext: 'structure' })

  let structureTypes = [
    'lithostitched:delegating',
		...collections.get('worldgen/structure_type'),
	]
  structureTypes.splice(7, 0, 'lithostitched:jigsaw')
	collections.register(`worldgen/structure_type`, structureTypes)

  
  schemas.register('structure', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'worldgen/structure_type' } }),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'lithostitched:delegating': {
        delegate: Structure,
        spawn_condition: Reference('lithostitched:structure_condition')
      },
      'minecraft:buried_treasure': {
        ...SharedSettings,
      },
      'minecraft:desert_pyramid': {
        ...SharedSettings,
      },
      'minecraft:end_city': {
        ...SharedSettings,
      },
      'minecraft:fortress': {
        ...SharedSettings,
      },
      'minecraft:igloo': {
        ...SharedSettings,
      },
      'minecraft:jigsaw': {
        ...SharedSettings,
        start_pool: StringNode({ validator: 'resource', params: { pool: '$worldgen/template_pool'}}),
        size: NumberNode({ integer: true, min: 0, max: 20}),
        start_height: Reference('height_provider'),
        start_jigsaw_name: Opt(StringNode()),
        project_start_to_heightmap: Opt(StringNode({ enum: 'heightmap_type' })),
        max_distance_from_center: Mod(NumberNode({ integer: true, min: 1, max: 128 }), { default: () => 80 }),
        use_expansion_hack: BooleanNode(),
        ...OneTwentyOneJigsawSettings
      },
      'lithostitched:jigsaw': {
        ...SharedSettings,
        start_pool: StringNode({ validator: 'resource', params: { pool: '$worldgen/template_pool'}}),
        size: IntProvider({ min: 0, max: 20 }),
        start_height: Reference('height_provider'),
        start_jigsaw_name: Opt(StringNode()),
        project_start_to_heightmap: Opt(StringNode({ enum: 'heightmap_type' })),
        max_distance_from_center: Mod(NumberNode({ integer: true, min: 1, max: 128 }), { default: () => 80 }),
        use_expansion_hack: BooleanNode(),
        ...OneTwentyOneJigsawSettings
      },
      'minecraft:jungle_temple': {
        ...SharedSettings,
      },
      'minecraft:mineshaft': {
        ...SharedSettings,
        mineshaft_type: StringNode({ enum: ['normal', 'mesa'] }),
      },
      'minecraft:nether_fossil': {
        ...SharedSettings,
        height: Reference('height_provider')
      },
      'minecraft:ocean_monument': {
        ...SharedSettings,
      },
      'minecraft:ocean_ruin': {
        ...SharedSettings,
        biome_temp: StringNode({ enum: ['cold', 'warm'] }),
        large_probability: NumberNode({ min: 0, max: 1 }),
        cluster_probability: NumberNode({ min: 0, max: 1 })
      },
      'minecraft:ruined_portal': {
        ...SharedSettings,
        setups: ListNode(
          ObjectNode({
            placement: StringNode({ enum: ['on_land_surface', 'partly_buried', 'on_ocean_floor', 'in_mountain', 'underground', 'in_nether'] }),
            air_pocket_probability: NumberNode({ min: 0, max: 1 }),
            mossiness: NumberNode({ min: 0, max: 1 }),
            overgrown: BooleanNode(),
            vines: BooleanNode(),
            can_be_cold: BooleanNode(),
            replace_with_blackstone: BooleanNode(),
            weight: NumberNode({ min: 0 })
          })
        )
      },
      'minecraft:shipwreck': {
        ...SharedSettings,
        is_beached: Opt(BooleanNode())
      },
      'minecraft:stronghold': {
        ...SharedSettings,
      },
      'minecraft:swamp_hut': {
        ...SharedSettings,
      },
      'minecraft:woodland_mansion': {
        ...SharedSettings,
      },
    }
  }, { context: 'structure_feature' }), {
    default: () => ({
      type: 'lithostitched:jigsaw',
      step: 'surface_structures',
      size: 6,
      max_distance_from_center: 80,
    })
  }))

  collections.register(`lithostitched:structure_condition_type`, [
		'lithostitched:all_of',
		'lithostitched:any_of',
		'lithostitched:height_filter',
		'lithostitched:in_biome',
		'lithostitched:not',
		'lithostitched:offset',
		'lithostitched:sample_density',
		'lithostitched:true',
	])

	schemas.register(`lithostitched:structure_condition`, ObjectNode({
		type: StringNode({ validator: 'resource', params: { pool: `lithostitched:structure_condition_type` as any } }),
		[Switch]: [{ push: 'type' }],
		[Case]: {
			'lithostitched:all_of': {
				conditions: ListNode(Reference(`lithostitched:structure_condition`)),
			},
			'lithostitched:any_of': {
				conditions: ListNode(Reference(`lithostitched:structure_condition`)),
			},
      'lithostitched:height_filter': {
        heightmap: Opt(StringNode({ enum: 'heightmap_type' })),
        min_inclusive: Opt(Reference('vertical_anchor')),
        max_inclusive: Opt(Reference('vertical_anchor')),
			},
      'lithostitched:in_biome': {
        biomes: HolderSet({ resource: '$worldgen/biome' })
      },
			'lithostitched:not': {
				condition: Reference(`lithostitched:structure_condition`),
			},
			'lithostitched:offset': {
				condition: Reference(`lithostitched:structure_condition`),
				offset: Opt(ListNode(
					NumberNode({ integer: true }),
					{ minLength: 3, maxLength: 3 }
				))
			},
      'lithostitched:sample_density': {
				density_function: Mod(ChoiceNode([
          {
            type: 'number',
            node: NumberNode(),
            change: () => 0
          },
          {
            type: 'string',
            priority: 1,
            node: StringNode({ validator: 'resource', params: { pool: '$worldgen/density_function' }}),
            change: () => undefined
          },
          {
            type: 'object',
            node: Reference('density_function'),
            change: () => ({})
          }
        ], { choiceContext: 'density_function' }), {
          default: () => 0
        }),
        min_inclusive: Opt(NumberNode()),
        max_inclusive: Opt(NumberNode()),
			},
		},
	}, {
		context: `lithostitched.structure_condition`, disableSwitchContext: true,
	}))
}
