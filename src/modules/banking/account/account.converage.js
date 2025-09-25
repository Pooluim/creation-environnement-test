export default defineConfig({
    test: {
        converage: {
            provider: 'v8',
            reporter: ['test', 'json', 'html'],
            exclude: [
                'node_modules/',
                'tests/',
                'src/**/*.d.ts',
            ]
        }
    }
})