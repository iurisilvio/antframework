/* eslint-disable no-console */

/**
 * @fileoverview Defines and exports the {@link AntCli} class.
 */

const fs = require('fs');
const yargs = require('yargs');
const { logger } = require('@back4app/ant-util');
const { yargsHelper } = require('@back4app/ant-util-yargs');
const { Ant, Config } = require('@back4app/ant');

const demandCommandMinMsg = 'You missed the command';
const demandCommandMinMax = 'You can run only one command per call';

/**
 * @class ant-cli/AntCli
 * Represents the Ant Framework CLI - Command Line Interface.
 * @example
 * <caption>Usage</caption>
 * (new AntCli()).execute()
 */
class AntCli {
  /**
   * @throws {AntError} If the local config file cannot be read.
   */
  constructor() {
    /**
     * Contains the Ant framework local config.
     * @type {Config}
     * @private
     */
    this._config = this._getAntConfig();

    /**
     * Contains the {@link Ant} instance created during the CLI initilization.
     * @type {Ant}
     * @private
     */
    this._ant = new Ant(this._config ? this._config.config : null);

    this._loadYargs();
  }

  /**
   * Gets the config object to be used for the Ant Framework loading.
   * @returns {Object} The config to be used for loading the Ant Framework.
   * @throws {AntError} If the local config file cannot be read.
   * @private
   */
  _getAntConfig() {
    let configPath = null;
    let config = null;
    let configPathIndex = null;
    configPathIndex = process.argv.indexOf('--config') + 1;
    if (!configPathIndex) {
      configPathIndex = process.argv.indexOf('-c') + 1;
    }
    if (configPathIndex) {
      if (process.argv.length <= configPathIndex) {
        yargsHelper.handleErrorMessage('Config option requires path argument');
      } else {
        configPath = process.argv[configPathIndex];
      }
    } else {
      configPath = Config.GetLocalConfigPath();
      if (!fs.existsSync(configPath)) {
        configPath = null;
      }
    }
    if (configPath) {
      try {
        config = new Config(configPath);
      } catch (e) {
        yargsHelper.handleErrorMessage(
          `Could not load config file ${configPath}`,
          e
        );
      }
    }
    return config;
  }

  /**
  * Loads the Yargs object.
  * @private
  */
  _loadYargs() {
    /**
     * Contains the Yargs object created during the CLI initilization.
     * @type {Object}
     * @private
     */
    this._yargs = yargs.usage(
      'Usage: $0 [--help] [--version] [--config <path>] [--verbose] <command> [<args>] \
[<options>]'
    )
      .strict()
      .demandCommand(1, 1, demandCommandMinMsg, demandCommandMinMax)
      .recommendCommands()
      .help().alias('help', 'h')
      .version()
      .config('config', 'Path to YAML config file', () => {
        return { configPath: this._config ? this._config._path : null };
      }).alias('config', 'c')
      .options('configPath', {
        describe: 'Set the CLI configuration settings',
        default: this._config ? this._config._path : null,
        hidden: true
      })
      .options('verbose', {
        alias: 'v',
        describe: 'Show execution logs and error stacks',
        type: 'boolean',
        default: false
      })
      .locale('en');

    this._loadYargsMiddlewares();

    this._loadYargsEpilogue();

    this._loadYargsFailHandler();

    this._loadPluginsYargsSettings();
  }

  /**
   * Loads the Yargs middlewares.
   * @private
   */
  _loadYargsMiddlewares() {
    this._yargs = this._yargs.middleware([argv => {
      if (argv.verbose) {
        logger.attachHandler(console.log);
        logger.attachErrorHandler(console.error);
      }
    }]);
  }

  /**
  * Loads the Yargs' epilogue message.
  * @private
  */
  _loadYargsEpilogue() {
    let epilogue =
      'For more information, visit https://github.com/back4app/antframework';

    let plugins = this._ant.pluginController.plugins.map(
      plugin => this._ant.pluginController.getPluginName(plugin)
    ).join(', ');

    if (
      this._ant.pluginController.loadingErrors &&
      this._ant.pluginController.loadingErrors.length
    ) {
      let loadingErrors = this._ant.pluginController.loadingErrors;

      if (yargsHelper.isVerboseMode()) {
        loadingErrors = loadingErrors.map(loadingError => loadingError.stack);
      }

      loadingErrors = loadingErrors.join('\n');

      plugins = plugins.concat(`

There were some errors when loading the plugins:
${loadingErrors}`);

      if (!yargsHelper.isVerboseMode()) {
        plugins = plugins.concat(
          '\n\nFor getting the error stack, use --verbose option'
        );
      }
    }

    if (plugins) {
      epilogue =
`Plugins:
  ${plugins}

${epilogue}`;
    }

    this._yargs = this._yargs.epilogue(epilogue);
  }

  /**
   * Loads the Yargs fail handler.
   * @private
   */
  _loadYargsFailHandler() {
    this._yargs = this._yargs.fail((msg, err, yargs) => {
      if (err) {
        if (
          err.name === 'YError' &&
          err.message.indexOf('Not enough arguments following: ') === 0
        ) {
          msg = err.message;
        } else {
          throw err;
        }
      }

      if (msg === demandCommandMinMsg) {
        console.log(yargs.help());
        process.exit(0);
      } else {
        if (msg.indexOf('Unknown argument: ') === 0) {
          msg = msg.replace('argument', 'command');
        }
        yargsHelper.handleErrorMessage(msg, err);
      }
    });
  }

  /**
  * Loads the Yargs settings specific of each loaded plugin.
  * @private
  */
  _loadPluginsYargsSettings() {
    for (const plugin of this._ant.pluginController.plugins) {
      this._ant.pluginController.loadPluginYargsSettings(plugin, this._yargs);
    }
  }

  /**
  * Executes the CLI program.
  */
  execute() {
    this._yargs.argv;
  }
}

module.exports = AntCli;
