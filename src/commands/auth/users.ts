import path from 'path';
import fs from 'fs';
import { Command, Flags } from '@oclif/core'
import chalk from 'chalk';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

import { processOptions } from '../../utils/index.js';

export default class Auth extends Command {

  static override description = 'adding auth to loopback 4 application.'

  static override flags = {
    config: Flags.string({ char: 'c', description: 'Config JSON object' }),
    users: Flags.string({ char: 'i', description: 'users list.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(Auth);
    let options = processOptions(parsed.flags);
    const { users } = options;

    // create new users if provided in configs.
    if (users && users.length) {
      console.log(chalk.bold(chalk.green('generating users.')));
      const authUsers: any = {
        ids: { User: 0, UserCredentials: 0 },
        models: { User: {}, UserCredentials: {}, }
      };

      for (let i = 0; i < users.length; i++) {
        const userId = uuid();
        const userCredsId = uuid();
        const userProfile = users[i];
        const { username, email, password, realm } = userProfile;

        ++authUsers.ids.User;
        ++authUsers.ids.UserCredentials;

        authUsers.models.User[userId] = {
          id: userId,
          username,
          email,
          realm,
          emailVerified: true
        };

        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt());
        authUsers.models.UserCredentials[userCredsId] = {
          id: userCredsId,
          password: hashedPassword,
          userId,
        }
        fs.writeFileSync(path.join('./auth.json'), JSON.stringify({ ...authUsers }), { encoding: 'utf8' })
      }
    }
    process.exit(0);
  }
}
