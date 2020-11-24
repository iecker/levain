import * as log from "https://deno.land/std/log/mod.ts";

import Command from "./command.ts";
import Config from "../lib/config.ts";
import FileSystemPackage from "../lib/package/file_system_package.ts";
import Loader from '../lib/loader.ts';

export default class Install implements Command {
    constructor(private config: Config) {
    }

    async execute(args: string[]) {
        if (!args || args.length == 0) {
            log.error(`install - Nothing to install. Aborting...`);
            Deno.exit(1);
        }

        log.info(`install ${JSON.stringify(args)} - BEGIN`);

        let pkgs: FileSystemPackage[] | null = this.config.packageManager.resolvePackages(args);

        if (!pkgs) {
            log.error(`install - Nothing to install. Aborting...`);
            Deno.exit(1);
        }

        log.info("");
        log.info("-----------------");
        for (let pkg of pkgs) {
            await this.installPackage(pkg);
        }

        log.info("");
        log.info("-----------------");

        log.info(`install ${JSON.stringify(args)} - FINISH`);
    }

    private async installPackage(pkg: FileSystemPackage) {
        if (!this.config) {
            return;
        }

        let shouldInstall = true;
        let verb = 'INSTALL'
        if (pkg.installed) {
            if (pkg.updateAvailable) {
                verb = 'UPDATE';
            } else {
                verb = 'ENV (already installed)';
                shouldInstall = false;
            }
        }

        log.info("");
        log.info(`=== ${verb} ${pkg.name} - ${pkg.version}`);
        let actions = [];

        if (shouldInstall) {
            let installActions = pkg.yamlItem("cmd.install");
            if (installActions) {
                if (!pkg.yamlItem("levain.config.noBaseDir")) {
                    installActions.unshift("mkdir ${baseDir}");
                }
            }
            // Standard actions - At the head (unshift), they are in reverse order (like a STACK)
            actions.unshift("mkdir " + this.config.levainSafeTempDir);
            actions.unshift("mkdir " + this.config.levainRegistry);
            actions.unshift("mkdir --compact ${levainHome}");

            Array.prototype.push.apply(actions, installActions);
        }

        // Standard actions - Env - At the rear (push), they are in normal order (like a QUEUE)
        let envActions = pkg.yamlItem("cmd.env");
        if (envActions) {
            Array.prototype.push.apply(actions, envActions);
        }

        if (shouldInstall) {
            // Standard actions - At the rear (push), they are in normal order (like a QUEUE)
            actions.push(`copy --verbose ${pkg.filePath} ${this.config.levainRegistry}`);
        }

        const loader = new Loader(this.config);
        for (let action of actions) {
            await loader.action(pkg, action);
        }
    }
}
