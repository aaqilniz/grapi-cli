import { Command, Flags } from '@oclif/core'

import {processOptions} from '../../utils/index.js';

export default class UpdateModel extends Command {

  static override description = 'enable updating loopoback 4 models'

  static override flags = {
    config: Flags.string({ char: 'c', description: 'Config JSON object' }),
    name: Flags.string({ char: 'n', description: 'name of the argument' }),
    type: Flags.string({ char: 't', description: 'type of the argument' }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(UpdateModel);
    const options = processOptions(flags);
    console.log(options);
  }
}
