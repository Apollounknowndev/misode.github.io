import type { CollectionRegistry, SchemaRegistry } from '@mcschema/core'
import { initBiolith } from './Biolith.js'
import { initPlanetTypes } from './PlanetType.js'
import { initStructure } from './Structure.js'
import { initWorldgenModifiers } from './WorldgenModifier.js'

export * from './Biolith.js'
export * from './PlanetType.js'
export * from './Structure.js'
export * from './WorldgenModifier.js'

export function initCustomGenerators(schemas: SchemaRegistry, collections: CollectionRegistry) {
	initWorldgenModifiers(schemas, collections)
	initStructure(schemas, collections)
	initBiolith(schemas, collections)
	initPlanetTypes(schemas, collections)
}
