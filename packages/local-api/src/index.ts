import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { createCellsRouter } from './routes/cells';

export const serve = (
  port: number,
  filename: string,
  dir: string,
  useProxy: boolean
) => {
  const app = express();

  // wire up the cells router
  app.use('/cells', createCellsRouter(filename, dir));

  if (useProxy) {
    // used to allow development in local machine
    app.use(
      createProxyMiddleware({
        target: 'http://127.0.0.1:3000',
        ws: true,
        //logLevel: 'silent',
      })
    );
  } else {
    // grab build files for users to access react app when running the cli
    const packagePath = require.resolve(
      '@jsketch/local-client/dist/index.html'
    );
    app.use(express.static(path.dirname(packagePath)));
  }

  return new Promise<void>((resolve, reject) => {
    app.listen(port, resolve).on('error', reject);
  });
};
