import type { CollectionRegistry, NodeChildren, SchemaRegistry } from '@mcschema/core'
import { Case, ChoiceNode, ListNode, Mod, NumberNode, ObjectNode, Opt, Reference as RawReference, StringNode as RawStringNode, Switch } from '@mcschema/core'
import { HolderSet, IntProvider } from './Common.js'


export function initMisc(schemas: SchemaRegistry, collections: CollectionRegistry) {
	const Reference = RawReference.bind(undefined, schemas)
	const StringNode = RawStringNode.bind(undefined, collections)


  
  schemas.register('lithostitched:integer_range', ChoiceNode([
    {
      type: 'number',
      node: NumberNode({ integer: true }),
      change: (v: any) => Array.isArray(v) ? (v[0] ?? 0) : (v?.min_inclusive ?? 0)
    },
    {
      type: 'list',
      node: ListNode(
        NumberNode({ integer: true }),
        { minLength: 2, maxLength: 2 },
      ),
      change: (v: any) => typeof v === 'number' ? [v, v] : [v?.min_inclusive ?? 0, v?.max_inclusive ?? 0]
    },
    {
      type: 'object',
      node: ObjectNode({
        min_inclusive: NumberNode({ integer: true }),
        max_inclusive: NumberNode({ integer: true })
      }),
      change: (v: any) => Array.isArray(v) ? {min_inclusive: v[0] ?? 0, max_inclusive: v[1] ?? 0} : {min_inclusive: v ?? 0, max_inclusive: v ?? 0}
    }
  ]))



  // Block state providers



  let stateProviderTypes = [
		...collections.get('worldgen/block_state_provider_type')
	]

  stateProviderTypes.splice(6, 0, 'lithostitched:weighted')
  stateProviderTypes.splice(3, 0, 'lithostitched:random_block')

	collections.register(`worldgen/block_state_provider_type`, stateProviderTypes)

  const NoiseProvider: NodeChildren = {
    seed: NumberNode({ integer: true }),
    noise: Reference('noise_parameters'),
    scale: Mod(NumberNode({ min: Number.MIN_VALUE }), { default: () => 1 })
  }

  schemas.register('block_state_provider', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'worldgen/block_state_provider_type' } }),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'lithostitched:random_block': {
        blocks: HolderSet({ resource: 'block' })
      },
      'lithostitched:weighted': {
        entries: ListNode(
          ObjectNode({
            data: Reference('block_state_provider'),
            weight: NumberNode({ integer: true, min: 1 })
          })
        )
      },

      'minecraft:dual_noise_provider': {
        ...NoiseProvider,
        variety: Reference('lithostitched:integer_range'),
        slow_noise: Reference('noise_parameters'),
        slow_scale: Mod(NumberNode({ min: Number.MIN_VALUE }), { default: () => 1 }),
        states: ListNode(
          Reference('block_state')
        )
      },
      'minecraft:noise_threshold_provider': {
        ...NoiseProvider,
        threshold: NumberNode({ min: -1, max: 1 }),
        high_chance: NumberNode({ min: 0, max: 1 }),
        default_state: Reference('block_state'),
        low_states: ListNode(
          Reference('block_state')
        ),
        high_states: ListNode(
          Reference('block_state')
        )
      },
      'minecraft:noise_provider': {
        ...NoiseProvider,
        states: ListNode(
          Reference('block_state')
        )
      },
      'minecraft:randomized_int_state_provider': {
        property: StringNode(),
        values: IntProvider(),
        source: Reference('block_state_provider')
      },
      'minecraft:rotated_block_provider': {
        state: Reference('block_state')
      },
      'minecraft:simple_state_provider': {
        state: Reference('block_state')
      },
      'minecraft:weighted_state_provider': {
        entries: ListNode(
          Mod(ObjectNode({
            weight: NumberNode({ integer: true, min: 1 }),
            data: Reference('block_state')
          }), {
            default: () => ({
              data: {}
            })
          })
        )
      }
    }
  }, { context: 'block_state_provider' }), {
    default: () => ({
      type: 'minecraft:simple_state_provider'
    })
  }))



  // Block predicates



  let blockPredicateTypes = [
		...collections.get('block_predicate_type')
	]

  blockPredicateTypes.splice(8, 0, 'lithostitched:random_chance')
  blockPredicateTypes.splice(7, 0, 'lithostitched:multiple_of')

	collections.register(`block_predicate_type`, blockPredicateTypes)

  const Offset: NodeChildren = {
    offset: Opt(ListNode(
      NumberNode({ integer: true, min: -16, max: 16 }),
      { minLength: 3, maxLength: 3 }
    ))
  }

  schemas.register('block_predicate_worldgen', Mod(ObjectNode({
    type: StringNode({ validator: 'resource', params: { pool: 'block_predicate_type' } }),
    [Switch]: [{ push: 'type' }],
    [Case]: {
      'lithostitched:random_chance': {
				chance: NumberNode({ min: 0, max: 1 })
      },
      'lithostitched:multiple_of': {
        predicates: ListNode(
          Reference('block_predicate_worldgen')
        ),
        allowed_count: Reference('lithostitched:integer_range')
      },

      'minecraft:all_of': {
        predicates: ListNode(
          Reference('block_predicate_worldgen')
        )
      },
      'minecraft:any_of': {
        predicates: ListNode(
          Reference('block_predicate_worldgen')
        )
      },
      'minecraft:has_sturdy_face': {
        ...Offset,
        direction: StringNode({ enum: 'direction' })
      },
      'minecraft:inside_world_bounds': {
        ...Offset,
      },
      'minecraft:matching_block_tag': {
        ...Offset,
        tag: StringNode({ validator: 'resource', params: { pool: '$tag/block' } })
      },
      'minecraft:matching_blocks': {
        ...Offset,
        blocks: HolderSet({ resource: 'block' })
      },
      'minecraft:matching_fluids': {
        ...Offset,
        fluids: HolderSet({ resource: 'fluid' })
      },
      'minecraft:not': {
        predicate: Reference('block_predicate_worldgen')
      },
      'minecraft:unobstructed': {
        ...Offset,
      },
      'minecraft:would_survive': {
        ...Offset,
        state: Reference('block_state')
      }
    }
  }, { context: 'block_predicate' }), {
    default: () => ({
      type: 'minecraft:true'
    })
  }))
}
