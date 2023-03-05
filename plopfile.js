module.exports = (plop) => {
    plop.setGenerator('module', {
        prompts: [
            {
                type: 'input',
                name: 'moduleName',
                message() {
                    return 'module name';
                },
                validate(value) {
                    if (/.+/.test(value)) {
                        return true;
                    }
                    return 'module name is required';
                },
            },
        ],
        actions: ({ moduleName }) => [
            {
                type: 'add',
                path: `src/api/v2/modules/${moduleName}s/${moduleName}.controller.ts`,
            },
            {
                type: 'add',
                path: `src/api/v2/modules/${moduleName}s/${moduleName}.interface.ts`,
            },
            {
                type: 'add',
                path: `src/api/v2/modules/${moduleName}s/${moduleName}.route.ts`,
            },
            {
                type: 'add',
                path: `src/api/v2/modules/${moduleName}s/${moduleName}.serializer.ts`,
            },
            {
                type: 'add',
                path: `src/api/v2/modules/${moduleName}s/${moduleName}.services.ts`,
            },
            {
                type: 'add',
                path: `src/api/v2/modules/${moduleName}s/${moduleName}.validate.ts`,
            },
        ],
    });
};
