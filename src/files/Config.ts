import { randomBytes } from 'crypto';
import { IConfig } from '../global';
import { File } from './File';

export class Config extends File {
  readonly data: IConfig;

  constructor() {
    super(File.getPath('config.json'));

    this.data = Object.freeze(super.load() as IConfig);

    // Write current config (+ missing default values) into file
    this.save();
  }

  protected getData(): object {
    return this.data;
  }

  protected getDefaults(): IConfig {
    return {
      oauth: {
        github: {
          client_id: '',
          client_secret: ''
        }
      },

      postgreSQL: {
        enabled: false,
        host: '127.0.0.1',
        port: 5432,
        ssl: true,

        user: 'nas_web',
        password: 's3cr3t!',
        database: 'nas_web'
      },


      web: {
        listen: {
          usePath: false,
          path: '/tmp/.node-unix-sockets/NasWeb.socket',
          host: 'localhost',
          port: 8092
        },

        serveStatic: true,

        urlPrefix: {
          https: false,
          dynamicContentHost: 'auto',
          staticContentHost: 'auto'
        }
      },

      cookies: {
        secure: false
      },

      secret: randomBytes(1024).toString('base64')
    };
  }
}
