import esbuild from 'esbuild';
import {replace} from 'esbuild-plugin-replace';
import copyPlugin from 'esbuild-plugin-copy';
import process from 'node:process';
import {spawn} from 'node:child_process';

const args = process.argv;
const port = 8080;
const NODE_ENV = JSON.stringify(process.env.NODE_ENV || 'production');

const config = {
  platform: 'browser',
  format: 'iife',
  logLevel: 'info',
  loader: {'.js': 'jsx', '.css': 'css', '.ttf': 'file', '.woff': 'file', '.woff2': 'file'},
  entryPoints: ['src/main.js'],
  outfile: 'dist/bundle.js',
  bundle: true,
  define: {
    NODE_ENV,
    'process.env.MapboxAccessToken': JSON.stringify('')
  },
  plugins: [
    replace({
      __PACKAGE_VERSION__: '3.1.10',
      include: /constants\/src\/default-settings\.ts/
    }),
    copyPlugin({
      resolveFrom: 'cwd',
      assets: {from: ['index.html'], to: ['dist/index.html']}
    })
  ]
};

function openURL(url) {
  const cmd = {darwin: ['open'], linux: ['xdg-open'], win32: ['cmd', '/c', 'start']};
  const command = cmd[process.platform];
  if (command) spawn(command[0], [...command.slice(1), url]);
}

(async () => {
  if (args.includes('--start')) {
    await esbuild
      .context({
        ...config,
        minify: false,
        sourcemap: true,
        banner: {js: `new EventSource('/esbuild').addEventListener('change', () => location.reload());`}
      })
      .then(async ctx => {
        await ctx.watch();
        await ctx.serve({servedir: 'dist', port, fallback: 'dist/index.html'});
        console.info(`\n\n  ✅ Sistema APS rodando em: http://localhost:${port}\n`);
        openURL(`http://localhost:${port}`);
      })
      .catch(e => { console.error(e); process.exit(1); });
  } else if (args.includes('--build')) {
    await esbuild.build({...config, minify: true}).catch(e => { console.error(e); process.exit(1); });
  }
})();
