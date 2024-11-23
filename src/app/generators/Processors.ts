import type { CollectionRegistry, SchemaRegistry } from '@mcschema/core'
import { BooleanNode, Case, ChoiceNode, ListNode, MapNode, Mod, NumberNode, ObjectNode, Opt, Reference as RawReference, StringNode as RawStringNode, Switch } from '@mcschema/core'
import { HolderSet, IntProvider } from './Common.js'

export function initProcessors(schemas: SchemaRegistry, collections: CollectionRegistry) {
	const Reference = RawReference.bind(undefined, schemas)
	const StringNode = RawStringNode.bind(undefined, collections)

  let RandomSettings = ChoiceNode([
    {
      type: 'string',
      node: StringNode({ enum: ['per_block', 'per_piece'] })
    },
    {
      type: 'object',
      node: ObjectNode({
        mode: Opt(StringNode({ enum: ['per_block', 'per_piece'] })),
        name: StringNode()
      })
    }
  ])


  let processorTypes = [
    'lithostitched:apply_random',
		...collections.get('worldgen/structure_processor'),
    'lithostitched:schedule_tick',
    'lithostitched:set_block',
	]

  processorTypes.splice(11, 0, 'lithostitched:reference')
  processorTypes.splice(6, 0, 'lithostitched:discard_input')
  processorTypes.splice(6, 0, 'lithostitched:condition')
  processorTypes.splice(4, 0, 'lithostitched:block_swap')

	collections.register(`worldgen/structure_processor`, processorTypes)
  
  schemas.register('processor', Mod(ObjectNode({
    processor_type: StringNode({ validator: 'resource', params: { pool: 'worldgen/structure_processor' } }),
    [Switch]: [{ push: 'processor_type' }],
    [Case]: {
      'lithostitched:apply_random': {
        mode: RandomSettings,
        processor_lists: ListNode(ObjectNode({
          weight: NumberNode({ integer: true, min: 1 }),
          data: ChoiceNode([
            {
              type: 'string',
              node: StringNode({ validator: 'resource', params: { pool: '$worldgen/processor_list' }})
            },
            {
              type: 'object',
              node: Reference('processor_list')
            }
          ]),
        }))
      },
      'lithostitched:block_swap': {
        blocks: MapNode(
          StringNode({ validator: 'resource', params: { pool: 'block' } }),
          StringNode({ validator: 'resource', params: { pool: 'block' } })
        ),
      },
      'lithostitched:condition': {
        random_mode: Opt(RandomSettings),
        if_true: ChoiceNode([
          {
            type: 'object',
            node: Reference('lithostitched:processor_condition'),
            change: v => Array.isArray(v) && v.length > 0 ? v[0] : ""
          },
          {
            type: 'list',
            node: ListNode(Reference('lithostitched:processor_condition')),
            change: v => typeof v === 'object' ? [v] : []
          }
        ]),
        then: ChoiceNode([
          {
            type: 'object',
            node: Reference('processor'),
            change: v => Array.isArray(v) && v.length > 0 ? v[0] : ""
          },
          {
            type: 'list',
            node: ListNode(Reference('processor')),
            change: v => typeof v === 'object' ? [v] : []
          }
        ]),
      },
      'lithostitched:reference': {
        processor_lists: HolderSet({ resource: '$worldgen/processor_list' }),
      },
      'lithostitched:set_block': {
        state_provider: Reference('block_state_provider'),
        preserve_state: Opt(BooleanNode()),
        random_mode: Opt(StringNode({ enum: ['per_block', 'per_piece'] })),
        block_entity_modifier: Opt(Reference('rule_block_entity_modifier'))
			},



      'minecraft:block_age': {
        mossiness: NumberNode()
      },
      'minecraft:block_ignore': {
        blocks: ListNode(
          Reference('block_state')
        )
      },
      'minecraft:block_rot': {
        integrity: NumberNode({ min: 0, max: 1 }),
        rottable_blocks: Opt(HolderSet({ resource: 'block' }))
      },
      'minecraft:capped': {
        limit: IntProvider({ min: 1 }),
        delegate: Reference('processor')
      },
      'minecraft:gravity': {
        heightmap: StringNode({ enum: 'heightmap_type' }),
        offset: NumberNode({ integer: true })
      },
      'minecraft:protected_blocks': {
        value: StringNode({ validator: 'resource', params: { pool: 'block', requireTag: true } })
      },
      'minecraft:rule': {
        rules: ListNode(
          Reference('processor_rule')
        )
      }
    }
  }, { category: 'function', context: 'processor' }), {
    default: () => ({
      processor_type: 'minecraft:rule',
      rules: [{
        location_predicate: {
          predicate_type: 'minecraft:always_true'
        },
        input_predicate: {
          predicate_type: 'minecraft:always_true'
        }
      }]
    })
  }))

  // Processor conditions
  
  collections.register(`lithostitched:processor_condition_type`, [
		'lithostitched:all_of',
		'lithostitched:any_of',
		'lithostitched:matching_blocks',
		'lithostitched:not',
		'lithostitched:position',
		'lithostitched:random_chance',
		'lithostitched:true',
	])

	schemas.register(`lithostitched:processor_condition`, ObjectNode({
		type: StringNode({ validator: 'resource', params: { pool: `lithostitched:processor_condition_type` as any } }),
		[Switch]: [{ push: 'type' }],
		[Case]: {
			'lithostitched:all_of': {
				conditions: ListNode(Reference(`lithostitched:processor_condition`)),
			},
			'lithostitched:any_of': {
				conditions: ListNode(Reference(`lithostitched:processor_condition`)),
			},
      'lithostitched:matching_blocks': {
        blocks: HolderSet({ resource: 'block' }),
        properties: Opt(MapNode(
          StringNode(),
          StringNode()
        )),
        match_type: Opt(StringNode({ enum: ['input', 'location'] }))
			},
			'lithostitched:not': {
				condition: Reference(`lithostitched:processor_condition`),
			},
			'lithostitched:position': {
				predicate: Reference('pos_rule_test')
			},
      'lithostitched:random_chance': {
				chance: NumberNode({ min: 0, max: 1 })
			},
		},
	}, {
		context: `lithostitched.structure_condition`, disableSwitchContext: true,
	}))

  // Block entity modifiers

	collections.register(`rule_block_entity_modifier`, [
    'lithostitched:apply_all',
    'lithostitched:apply_random',
		...collections.get('rule_block_entity_modifier'),
	])
  
  schemas.register('rule_block_entity_modifier', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'rule_block_entity_modifier' } }),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'lithostitched:apply_all': {
        modifiers: ListNode(Reference('rule_block_entity_modifier'))
      },
      'lithostitched:apply_random': {
        modifiers: ListNode(ObjectNode({
          weight: NumberNode({ integer: true, min: 1 }),
          data: Reference('rule_block_entity_modifier'),
        }))
      },

      'minecraft:append_loot': {
        loot_table: StringNode({ validator: 'resource', params: { pool: '$loot_table' } })
      },
      'minecraft:append_static': {
        data: ObjectNode({}) // TODO: any nbt compound
      }
    }
  }, { context: 'rule_block_entity_modifier' }), {
    default: () => ({
      type: 'minecraft:passthrough',
    })
  }))

}
