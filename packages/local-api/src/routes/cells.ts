import express from 'express';
import fs from 'fs/promises';
import path from 'path';

interface Cell {
  id: string;
  content: string;
  type: 'text' | 'code';
}

interface LocalApiError {
  code: string;
}

export const createCellsRouter = (filename: string, dir: string) => {
  const router = express.Router();
  //Body parsing middleware
  router.use(express.json());

  const fullPath = path.join(dir, filename);

  router.get('/', async (req, res) => {
    const isLocalApiError = (err: any): err is LocalApiError => {
      return typeof err.code === 'string';
    };

    try {
      // Read the file
      const result = await fs.readFile(fullPath, { encoding: 'utf-8' });
      // parse a list of cells
      // send list of cells back to browser
      res.send(JSON.parse(result));
    } catch (err) {
      // If read throws an error
      // Inspect the error, see if it says that the file doesn't exist
      if (isLocalApiError(err)) {
        if (err.code === 'ENOENT') {
          // create the file and add default cells
          await fs.writeFile(fullPath, '[]', 'utf-8');
          res.send([]);
        }
      } else {
        throw err;
      }
    }
  });

  router.post('/', async (req, res) => {
    // Take the list of cells from the request obj
    // serialize them
    const { cells }: { cells: Cell[] } = req.body;

    // Write the cells into the file
    await fs.writeFile(fullPath, JSON.stringify(cells), 'utf-8');

    res.send({ status: 'ok' });
  });

  return router;
};
