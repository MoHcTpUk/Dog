const { defineConfig } = require("orval");

module.exports = defineConfig({
  gateway: {
    input: {
      target: "https://api.dogappa.local:8443/openapi/v1.json",
    },

    output: {
      mode: "tags-split",
      target: "./src/shared/api/generated",
      schemas: "./src/shared/api/generated/types",
      client: "react-query",
      packageJson: false,
      override: {
        mutator: {
          path: "./src/shared/api/client.ts",
          name: "customInstance",
        },
        query: {
          useQuery: true,
          useInfinite: true,
          useSuspenseQuery: true,
          useMutation: true,
        },

        components: {
          schemas: {
            suffix: "Type",
          },
          responses: {
            suffix: "Response",
          },
          parameters: {
            suffix: "Params",
          },
        },
      },
    },

    hooks: {
      afterAllFilesWrite: [
        "prettier --write ./src/shared/api/generated/**/*.ts",
        "eslint --fix ./src/shared/api/generated/**/*.ts",
      ],
    },
  },
});
