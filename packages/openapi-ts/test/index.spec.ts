import { readFileSync } from 'node:fs';

import { sync } from 'glob';
import { describe, expect, it } from 'vitest';

import { createClient } from '../';
import type { UserConfig } from '../src/types/config';

const V2_SPEC_PATH = './test/spec/v2.json';
const V3_SPEC_PATH = './test/spec/v3.json';
const V3_TRANSFORMS_SPEC_PATH = './test/spec/v3-transforms.json';

const OUTPUT_PREFIX = './test/generated/';

const toOutputPath = (name: string) => `${OUTPUT_PREFIX}${name}/`;
const toSnapshotPath = (file: string) =>
  `./__snapshots__/${file.replace(OUTPUT_PREFIX, '')}.snap`;

describe('OpenAPI v2', () => {
  it.each([
    {
      config: {
        client: 'fetch',
        exportCore: true,
        input: '',
        output: '',
        schemas: true,
        services: {
          asClass: true,
        },
        types: {
          enums: 'javascript',
        },
        useOptions: true,
      } as UserConfig,
      description: 'generate fetch client',
      name: 'v2',
    },
  ])('$description', async ({ name, config }) => {
    const output = toOutputPath(name);
    await createClient({
      ...config,
      input: V2_SPEC_PATH,
      output,
    });
    sync(`${output}**/*.ts`).forEach((file) => {
      const content = readFileSync(file, 'utf8').toString();
      expect(content).toMatchFileSnapshot(toSnapshotPath(file));
    });
  });
});

describe('OpenAPI v3', () => {
  const config: UserConfig = {
    client: 'fetch',
    exportCore: true,
    input: '',
    output: '',
    schemas: true,
    services: {},
    types: {
      enums: 'javascript',
    },
    useOptions: true,
  };

  const createConfig = (userConfig?: Partial<UserConfig>): UserConfig => ({
    ...config,
    ...userConfig,
  });

  const clientScenarios = [
    {
      config: createConfig({
        services: {
          asClass: true,
        },
      }),
      description: 'generate fetch client',
      name: 'v3',
    },
    {
      config: createConfig({
        client: 'angular',
        services: {
          asClass: true,
        },
        types: {},
      }),
      description: 'generate angular client',
      name: 'v3_angular',
    },
    {
      config: createConfig({
        client: 'node',
        services: {
          asClass: true,
        },
      }),
      description: 'generate node client',
      name: 'v3_node',
    },
    {
      config: createConfig({
        client: 'axios',
        services: {
          asClass: true,
        },
      }),
      description: 'generate axios client',
      name: 'v3_axios',
    },
    {
      config: createConfig({
        client: '@hey-api/client-axios',
      }),
      description: 'generate Axios client',
      name: 'v3_hey-api_client-axios',
    },
    {
      config: createConfig({
        client: {
          bundle: true,
          name: '@hey-api/client-axios',
        },
      }),
      description: 'generate bundled Axios client',
      name: 'v3_hey-api_client-axios_bundle',
    },
    {
      config: createConfig({
        client: '@hey-api/client-fetch',
      }),
      description: 'generate Fetch API client',
      name: 'v3_hey-api_client-fetch',
    },
    {
      config: createConfig({
        client: '@hey-api/client-fetch',
        plugins: ['@tanstack/react-query'],
        schemas: false,
      }),
      description: 'generate Fetch API client with TanStack React Query plugin',
      name: 'v3_hey-api_client-fetch_plugin_tanstack-react-query',
    },
    {
      config: createConfig({
        client: {
          bundle: true,
          name: '@hey-api/client-fetch',
        },
      }),
      description: 'generate bundled Fetch API client',
      name: 'v3_hey-api_client-fetch_bundle',
    },
    {
      config: createConfig({
        client: 'xhr',
        services: {
          asClass: true,
        },
      }),
      description: 'generate xhr client',
      name: 'v3_xhr',
    },
    {
      config: createConfig({
        name: 'ApiClient',
        schemas: false,
        types: {
          dates: true,
        },
      }),
      description: 'generate client',
      name: 'v3_client',
    },
  ];

  const allScenarios = [
    {
      config: createConfig({
        exportCore: false,
        schemas: false,
        services: false,
        types: {
          dates: true,
          include: '^ModelWithPattern',
        },
      }),
      description: 'generate Date types',
      name: 'v3_date',
    },
    {
      config: createConfig({
        schemas: false,
        services: {
          asClass: true,
          include: '^Defaults',
        },
        types: {
          dates: true,
          include: '^ModelWithString',
        },
        useOptions: false,
      }),
      description: 'generate legacy positional arguments',
      name: 'v3_legacy_positional_args',
    },
    {
      config: createConfig({
        schemas: false,
        services: {
          asClass: true,
          include: '^Defaults',
        },
        types: {
          dates: true,
          include: '^ModelWithString',
        },
      }),
      description: 'generate optional arguments',
      name: 'v3_options',
    },
    {
      config: createConfig({
        schemas: false,
        services: {
          asClass: true,
        },
        types: {
          enums: 'typescript',
        },
      }),
      description: 'generate TypeScript enums',
      name: 'v3_enums_typescript',
    },
    {
      config: createConfig({
        schemas: false,
        services: {
          asClass: true,
        },
        types: {
          enums: 'typescript+namespace',
        },
      }),
      description: 'generate TypeScript enums',
      name: 'v3_enums_typescript_namespace',
    },
    {
      config: createConfig({
        exportCore: false,
        schemas: false,
        services: false,
        types: {
          include: '^(CamelCaseCommentWithBreaks|ArrayWithProperties)',
          name: 'PascalCase',
        },
      }),
      description: 'generate pascalcase types',
      name: 'v3_pascalcase',
    },
    {
      config: createConfig({
        exportCore: false,
        schemas: {
          type: 'json',
        },
        services: false,
        types: false,
      }),
      description: 'generate JSON Schemas',
      name: 'v3_schemas_json',
    },
    {
      config: createConfig({
        exportCore: false,
        schemas: {
          type: 'form',
        },
        services: false,
        types: false,
      }),
      description: 'generate form validation schemas',
      name: 'v3_schemas_form',
    },
    {
      config: createConfig({
        exportCore: false,
        schemas: false,
        services: {
          asClass: true,
          include: '^(Simple|Parameters)',
          name: 'myAwesome{{name}}Api',
        },
        types: false,
      }),
      description: 'generate services with custom name',
      name: 'v3_services_name',
    },
    {
      config: createConfig({
        exportCore: false,
        schemas: false,
        services: {
          filter: '^\\w+ /api/v{api-version}/simple$',
        },
        types: false,
      }),
      description: 'generate services with specific endpoints',
      name: 'v3_services_filter',
    },
    {
      config: createConfig({
        exportCore: false,
        schemas: false,
        services: true,
      }),
      description: 'generate tree-shakeable services',
      name: 'v3_tree_shakeable',
    },
    {
      config: createConfig({
        exportCore: false,
        schemas: false,
        services: false,
        types: {},
      }),
      description: 'generate only types with default settings',
      name: 'v3_types',
    },
    {
      config: createConfig({
        exportCore: false,
        schemas: false,
        services: false,
        types: {
          tree: false,
        },
      }),
      description: 'generate only types without tree',
      name: 'v3_types_no_tree',
    },
  ];

  it.each(clientScenarios.concat(allScenarios))(
    '$description',
    async ({ name, config }) => {
      const output = toOutputPath(name);
      await createClient({
        ...config,
        input: V3_SPEC_PATH,
        output,
      });
      sync(`${output}**/*.ts`).forEach((file) => {
        const content = readFileSync(file, 'utf8').toString();
        expect(content).toMatchFileSnapshot(toSnapshotPath(file));
      });
    },
  );

  it.each(clientScenarios)(
    'transforms $description',
    async ({ name, config }) => {
      const output = toOutputPath(name + '_transform');

      await createClient({
        ...config,
        input: V3_TRANSFORMS_SPEC_PATH,
        output,
        types: {
          dates: 'types+transform',
        },
      });

      sync(`${output}**/*.ts`).forEach((file) => {
        const content = readFileSync(file, 'utf8').toString();
        expect(content).toMatchFileSnapshot(toSnapshotPath(file));
      });
    },
  );
});
