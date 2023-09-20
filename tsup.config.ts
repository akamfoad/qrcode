import { Options, defineConfig } from 'tsup';

export default defineConfig((options) => {
  const commonOptions: Partial<Options> = {
    entry: {
      qrcode: 'src/index.ts',
    },
    dts: true,
    clean: true,
    ...options,
  };

  return [
    {
      ...commonOptions,
      platform: 'neutral',
      outDir: 'dist',
      format: 'esm',
      outExtension: () => ({ js: '.mjs' }),
    },
    {
      ...commonOptions,
      format: 'cjs',
      outDir: 'dist/cjs/',
      outExtension: () => ({ js: '.cjs' }),
    },
  ];
});
