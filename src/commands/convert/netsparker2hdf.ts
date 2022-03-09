import BaseCommand from '../../utils/base-command'
import {OutputFlags} from '@oclif/parser'
import {flags} from '@oclif/command'
import fs from 'fs'
import {NetsparkerMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {getHDFSummary} from '../../utils/logging'

export default class Netsparker2HDF extends BaseCommand {
  static usage = 'convert netsparker2hdf -i, --input=XML -o, --output=OUTPUT'

  static description = 'Translate a Netsparker XML results file into a Heimdall Data Format JSON file\nThe current iteration only works with Netsparker Enterprise Vulnerabilities Scan.'

  static examples = ['saf convert:netsparker2hdf -i netsparker_results.xml -o output-hdf-name.json']

  static flags = {
    ...BaseCommand.flags,
    input: flags.string({char: 'i', required: true}),
  }

  async run() {
    const flags = this.parsedFlags as OutputFlags<typeof Netsparker2HDF.flags>

    // Read Data
    this.logger.verbose(`Reading Netsparker Scan: ${flags.input}`)
    const inputDataText = fs.readFileSync(flags.input, 'utf-8')

    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    this.logger.verbose(`Output Filename: ${fileName}`)

    // Convert the data
    const converter = new Mapper(inputDataText)
    this.logger.info('Starting conversion from Netsparker to HDF')
    const converted = converter.toHdf()

    // Write to file
    this.logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
    fs.writeFileSync(fileName, JSON.stringify(converted))
    this.logger.verbose(`HDF successfully written to ${fileName}`)
  }
}
