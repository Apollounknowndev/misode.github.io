import type { CollectionRegistry, INode, NestedNodeChildren, NodeChildren, ResourceType, SchemaRegistry } from '@mcschema/core'
import { Case, ChoiceNode, ListNode, Mod, NumberNode, ObjectNode, Opt, Reference as RawReference, StringNode as RawStringNode, Switch } from '@mcschema/core'

type MinMaxConfig = {
  min?: number
  max?: number
}
export let FloatProvider: (config?: MinMaxConfig) => INode
export let IntProvider: (config?: MinMaxConfig) => INode

type InclusiveRangeConfig = {
  integer?: boolean
  min?: number
  max?: number
}
export let InclusiveRange: (config?: InclusiveRangeConfig) => INode

type NonTagResources = Exclude<ResourceType, `$tag/${string}`>

type HolderSetConfig = {
  resource: NonTagResources,
  inlineSchema?: string,
}
export let HolderSet: (config: HolderSetConfig) => INode

export let MobCategorySpawnSettings: INode


export function initCommon(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const StringNode = RawStringNode.bind(undefined, collections)
  const Reference = RawReference.bind(undefined, schemas)
	
  const ObjectWithType = (pool: ResourceType, directType: string, directPath: string, directDefault: string, objectDefault: string | null, context: string, cases: NestedNodeChildren) => {
    let defaultCase: NodeChildren = {}
    if (objectDefault) {
      Object.keys(cases[objectDefault]).forEach(k => {
        defaultCase[k] = Mod(cases[objectDefault][k], {
          enabled: path => path.push('type').get() === undefined
        })
      })
    }
    const provider = ObjectNode({
      type: Mod(Opt(StringNode({ validator: 'resource', params: { pool } })), {
        hidden: () => true
      }),
      [Switch]: [{ push: 'type' }],
      [Case]: cases,
      ...defaultCase
    }, { context, disableSwitchContext: true })

    const choices: any[] = [{
      type: directType,
      node: cases[directDefault][directPath]
    }]
    if (objectDefault) {
      choices.push({
        type: 'object',
        priority: -1,
        node: provider
      })
    }
    Object.keys(cases).forEach(k => {
      choices.push({
        type: k,
        match: (v: any) => {
          const type = 'minecraft:' + v?.type?.replace(/^minecraft:/, '')
          if (type === k) return true
          const keys = v ? Object.keys(v) : []
          return typeof v === 'object' && (keys?.length === 0 || (keys?.length === 1 && keys?.[0] === 'type'))
        },
        node: provider
      })
    })
    return ChoiceNode(choices, { context, choiceContext: `${context}.type` })
  }
	
	FloatProvider = (config?: MinMaxConfig) => ObjectWithType(
    'float_provider_type',
    'number', 'value', 'minecraft:constant',
    null,
    'float_provider',
    {
      'minecraft:constant': {
        value: NumberNode(config)
      },
      'minecraft:uniform': {
        min_inclusive: NumberNode(config),
        max_exclusive: NumberNode(config)
      },
      'minecraft:clamped_normal': {
        min: NumberNode(),
        max: NumberNode(),
        mean: NumberNode(),
        deviation: NumberNode()
      },
      'minecraft:trapezoid': {
        min: NumberNode(),
        max: NumberNode(),
        plateau: NumberNode()
      }
    }
  )

  IntProvider = (config?: MinMaxConfig) => ObjectWithType(
    'int_provider_type',
    'number', 'value', 'minecraft:constant',
    null,
    'int_provider',
    {
      'minecraft:constant': {
        value: NumberNode({ integer: true, ...config })
      },
      'minecraft:uniform': {
        min_inclusive: NumberNode({ integer: true, ...config }),
        max_inclusive: NumberNode({ integer: true, ...config })
      },
      'minecraft:biased_to_bottom': {
        min_inclusive: NumberNode({ integer: true, ...config }),
        max_inclusive: NumberNode({ integer: true, ...config })
      },
      'minecraft:clamped': {
        min_inclusive: NumberNode({ integer: true, ...config }),
        max_inclusive: NumberNode({ integer: true, ...config }),
        source: Reference('int_provider')
      },
      'minecraft:clamped_normal': {
        min_inclusive: NumberNode({ integer: true, ...config }),
        max_inclusive: NumberNode({ integer: true, ...config }),
        mean: NumberNode(),
        deviation: NumberNode()
      },
      'minecraft:weighted_list': {
        distribution: ListNode(
          ObjectNode({
            weight: NumberNode({ integer: true }),
            data: Reference('int_provider'),
          })
        )
      }
    }
  )

	HolderSet = (config: HolderSetConfig) => ChoiceNode([
    {
      type: 'string',
      node: StringNode({ validator: 'resource', params: { pool: config.resource, allowTag: true } }),
      change: (v: unknown) => {
        if (Array.isArray(v) && typeof v[0] === 'string' && !v[0].startsWith('#')) {
          return v[0]
        }
        return undefined
      }
    },
    {
      type: 'list',
      node: ListNode(
        config.inlineSchema
          ? ChoiceNode([
            {
              type: 'string',
              node: StringNode({ validator: 'resource', params: { pool: config.resource } })
            },
            {
              type: 'object',
              node: Reference(config.inlineSchema)
            }
          ], { choiceContext: 'tag.list' })
          : StringNode({ validator: 'resource', params: { pool: config.resource } })
      ),
      change: (v: unknown) => {
        if (typeof v === 'string' && !v.startsWith('#')) {
          return [v]
        }
        return []
      }
    },
  ], { choiceContext: 'tag' })

	MobCategorySpawnSettings = ObjectNode({
    type: StringNode({
      validator: 'resource',
      params: { pool: 'entity_type' },
    }),
    weight: NumberNode({ integer: true }),
    minCount: NumberNode({ integer: true }),
    maxCount: NumberNode({ integer: true }),
  })
}
