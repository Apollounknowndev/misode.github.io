import type { CollectionRegistry, SchemaRegistry } from '@mcschema/core'
import { Case, ChoiceNode, ListNode, Mod, NumberNode, ObjectNode, Opt, Reference as RawReference, StringNode as RawStringNode, Switch } from '@mcschema/core'

export function initTemplateElements(schemas: SchemaRegistry, collections: CollectionRegistry) {
	const Reference = RawReference.bind(undefined, schemas)
	const StringNode = RawStringNode.bind(undefined, collections)

  const Processors = ChoiceNode([
    {
      type: 'string',
      node: StringNode({ validator: 'resource', params: { pool: '$worldgen/processor_list' }}),
    },
    {
      type: 'list',
      node: ListNode(
        Reference('processor')
      ),
      change: v => (typeof v === 'object' && v !== null && Array.isArray(v.processors))
        ? v.processors
        : [{ processor_type: 'minecraft:nop' }]
    },
    {
      type: 'object',
      node: Reference('processor_list'),
      change: v => ({
        processors: Array.isArray(v)
          ? v
          : [{ processor_type: 'minecraft:nop' }]
      })
    }
  ])

  schemas.register('template_weighted_element', Mod(ObjectNode({
    weight: NumberNode({ integer: true, min: 1, max: 150 }),
    element: Reference('lithostitched:root_template_element')
  }, { category: 'pool' }), {
    default: () => ({
      weight: 1,
      element: {
        element_type: 'minecraft:single_pool_element',
        projection: 'rigid',
        processors: 'minecraft:empty'
      }
    })
  }))

  let elementTypes = [
    'lithostitched:guaranteed',
    'lithostitched:limited',
		...collections.get('worldgen/structure_pool_element'),
	]

	collections.register(`lithostitched:root_element_type`, elementTypes)

  schemas.register('lithostitched:root_template_element', Mod(ObjectNode({
    element_type: StringNode({ validator: 'resource', params: { pool: 'lithostitched:root_element_type' as any } }),
    [Switch]: [{ push: 'element_type' }],
    [Case]: {
      'lithostitched:guaranteed': {
        delegate: Reference('template_element'),
        count: NumberNode({ integer: true, min: 1 }),
        min_depth: NumberNode({ integer: true, min: 0 }),
      },
      'lithostitched:limited': {
        delegate: Reference('template_element'),
        limit: NumberNode({ integer: true, min: 1 }),
      },

      'minecraft:feature_pool_element': {
        projection: StringNode({ enum: ['rigid', 'terrain_matching'] }),
        feature: StringNode({ validator: 'resource', params: { pool: '$worldgen/placed_feature' } })
      },
      'minecraft:legacy_single_pool_element': {
        projection: StringNode({ enum: ['rigid', 'terrain_matching'] }),
        location: StringNode({ validator: 'resource', params: { pool: '$structure' }}),
        override_liquid_settings: Opt(StringNode({ enum: ['apply_waterlogging', 'ignore_waterlogging'] })),
        processors: Processors
      },
      'minecraft:list_pool_element': {
        projection: StringNode({ enum: ['rigid', 'terrain_matching'] }),
        elements: ListNode(
          Reference('template_element')
        )
      },
      'minecraft:single_pool_element': {
        projection: StringNode({ enum: ['rigid', 'terrain_matching'] }),
        location: StringNode({ validator: 'resource', params: { pool: '$structure' }}),
        override_liquid_settings: Opt(StringNode({ enum: ['apply_waterlogging', 'ignore_waterlogging'] })),
        processors: Processors
      }
    }
  }, { context: 'template_element', disableSwitchContext: true }), {
    default: () => ({
      element_type: 'minecraft:single_pool_element',
      projection: 'rigid',
      processors: 'minecraft:empty'
    })
  }))
}
