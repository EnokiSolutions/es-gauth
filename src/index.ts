// istanbul ignore file
// -- bootstrap

import {main} from './main';
import {createServer} from 'http';
import {settings} from './settings';
import {exitPromise} from './exit';
import {requestHandler} from './request_handler';

async function server(): Promise<void> {
  const server = createServer(requestHandler);

  server.listen(settings.port, settings.host, () => {
    console.log(settings);
  });

  await exitPromise;
}

main(server);
