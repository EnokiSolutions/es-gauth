import {main} from './main';
import {createServer} from 'http';
import {settings} from './settings';
import {exitPromise} from './exit';
import {requestHandler} from './request_handler';

// istanbul ignore next
async function server(): Promise<void> {
  const server = createServer(requestHandler);

  server.listen(settings.port, settings.host, () => {
    console.log(settings);
  });

  await exitPromise;
}

// istanbul ignore next
main(server);
