import {
	ChoiceNode,
	CollectionRegistry,
	INode,
	Mod,
	NumberNode,
	Reference as RawReference,
	StringNode as RawStringNode,
	SchemaRegistry
} from '@mcschema/core'

export let DensityFunction: INode

export function initDensityFunctions(schemas: SchemaRegistry, collections: CollectionRegistry) {
  const StringNode = RawStringNode.bind(undefined, collections)
  const Reference = RawReference.bind(undefined, schemas)

	DensityFunction = Mod(ChoiceNode([
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
	})

  let dfTypes = [
		...collections.get('worldgen/density_function_type'),
	]

  dfTypes.splice(21, 0, 'lithostitched:original_marker')
  dfTypes.splice(32, 0, 'lithostitched:wrapped_marker')

	collections.register(`worldgen/density_function_type`, dfTypes)
}
