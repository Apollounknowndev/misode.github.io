import type { CollectionRegistry, SchemaRegistry } from '@mcschema/core'
import { Case, ChoiceNode, ListNode, MapNode, Mod, NumberNode, ObjectNode, Opt, Reference as RawReference, StringNode as RawStringNode, Switch } from '@mcschema/core'
import { HolderSet, IntProvider } from './Common.js'

export function initProcessors(schemas: SchemaRegistry, collections: CollectionRegistry) {
	const Reference = RawReference.bind(undefined, schemas)
	const StringNode = RawStringNode.bind(undefined, collections)


  let processorTypes = [
    'lithostitched:apply_random',
		...collections.get('worldgen/structure_processor'),
	]
  processorTypes.splice(4, 0, 'lithostitched:block_swap')
  processorTypes.splice(7, 0, 'lithostitched:reference')
	collections.register(`worldgen/structure_processor`, processorTypes)
  
  schemas.register('processor', Mod(ObjectNode({
    processor_type: StringNode({ validator: 'resource', params: { pool: 'worldgen/structure_processor' } }),
    [Switch]: [{ push: 'processor_type' }],
    [Case]: {
      'lithostitched:apply_random': {
        mode: StringNode({ enum: ['per_block', 'per_piece'] }),
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
      'lithostitched:reference': {
        processor_lists: HolderSet({ resource: '$worldgen/processor_list' }),
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

  // Rule tests

  let ruleTestTypes = collections.get('rule_test')

  ruleTestTypes.splice(3, 0, 'lithostitched:matching_blocks')
	collections.register(`rule_test`, ruleTestTypes)
  
  schemas.register('rule_test', ObjectNode({
    predicate_type: StringNode({ validator: 'resource', params: { pool: 'rule_test' } }),
    [Switch]: [{ push: 'predicate_type' }],
    [Case]: {
      'lithostitched:matching_blocks': {
        blocks: HolderSet({ resource: 'block' }),
        properties: Opt(MapNode(
          StringNode(),
          StringNode()
        )),
        chance: Opt(NumberNode({ min: 0, max: 1 }))
      },

      'minecraft:block_match': {
        block: StringNode({ validator: 'resource', params: { pool: 'block' } })
      },
      'minecraft:blockstate_match': {
        block_state: Reference('block_state')
      },
      'minecraft:random_block_match': {
        block: StringNode({ validator: 'resource', params: { pool: 'block' } }),
        probability: NumberNode({ min: 0, max: 1 })
      },
      'minecraft:random_blockstate_match': {
        block_state: Reference('block_state'),
        probability: NumberNode({ min: 0, max: 1 })
      },
      'minecraft:tag_match': {
        tag: StringNode({ validator: 'resource', params: { pool: '$tag/block' }})
      }
    }
  }, { context: 'rule_test', disableSwitchContext: true }))

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
