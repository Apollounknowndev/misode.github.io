import type { CollectionRegistry, SchemaRegistry } from '@mcschema/core'
import type { VersionId } from '../services/Schemas.js'
import { initCommon } from './Common.js'
import { initConfiguredFeatures } from './ConfiguredFeatures.js'
import { initProcessors } from './Processors.js'
import { initStructures } from './Structures.js'
import { initTemplateElements } from './TemplateElements.js'
import { initWorldgenModifiers } from './WorldgenModifiers.js'

export * from './ConfiguredFeatures.js'
export * from './Processors.js'
export * from './Structures.js'
export * from './TemplateElements.js'
export * from './WorldgenModifiers.js'

export function initGenerators(schemas: SchemaRegistry, collections: CollectionRegistry, version: VersionId) {
	initCommon(schemas, collections)
	initConfiguredFeatures(schemas, collections, version)
	initProcessors(schemas, collections)
	initStructures(schemas, collections, version)
	initTemplateElements(schemas, collections)
	initWorldgenModifiers(schemas, collections, version)
}
