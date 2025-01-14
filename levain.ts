import * as log from "https://deno.land/std/log/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";

import t from './src/lib/i18n.ts'

import ConsoleAndFileLogger from './src/lib/logger/console_and_file_logger.ts'
import {parseArgs} from "./src/lib/parse_args.ts";
import {Timer} from "./src/lib/timer.ts";

import LevainCli from "./src/levain_cli.ts";

export default class Levain {
    static get levainRootFile(): string {
        // https://stackoverflow.com/questions/61829367/node-js-dirname-filename-equivalent-in-deno
        return path.fromFileUrl(import.meta.url)
    }

    static get levainRootDir(): string {
        // https://stackoverflow.com/questions/61829367/node-js-dirname-filename-equivalent-in-deno
        return path.dirname(Levain.levainRootFile)
    }


    logFiles: string[] = [];
    timer = new Timer()
    logger: ConsoleAndFileLogger | undefined;

    myArgs: any;
    error = false;

    async runLevinWithLog(cmdArgs: string[] = []): Promise<ConsoleAndFileLogger | undefined> {
        try {
            this.myArgs = parseArgs(cmdArgs, {
                stringOnce: [
                    "email-domain",
                    "levainCache",
                    "shellPath"
                ],
                stringMany: [
                    "levainHome",
                    "addRepo",
                    "tempRepo",
                    "add-log",
                    "add-log-dir",
                ],
                boolean: [
                    "ask-fullname",
                    "ask-login",
                    "ask-email",
                    "ask-password",
                    "wait-to-begin",
                    "wait-after-end",
                    "skip-levain-updates",
                    "levain-upgrade"
                ]
            });

            await this.prepareLogs(this.myArgs);

            log.info("");
            log.info(`levain ${cmdArgs.join(' ')}`)
            log.info("==================================");
            await new LevainCli().execute(this.myArgs);

        } catch (err) {

            log.error("");
            log.error("********************************************************************************");
            log.error("");
            log.error(err);
            log.error("");
            log.error("********************************************************************************");
            log.error("");

            this.error = true;
        } finally {

            this.logger?.showLogFiles(this.logFiles);

            log.info("");
            const timed = this.timer.humanize()
            log.info(t("levain.levainRan", { timer: timed }))
            this.logger?.flush()

            if (this.error) {
                log.error(t("levain.executionFailed"))
            } else {
                log.debug(t("levain.executionSuccess"))
            }

            if (this.error || (this.myArgs && this.myArgs["wait-after-end"])) {
                console.log("");
                prompt(t("enterFinish"));
            }
        }

        return this.logger
    }

    async prepareLogs(myArgs: any): Promise<ConsoleAndFileLogger> {
        this.logFiles = this.getLogFiles(myArgs['add-log'], myArgs['add-log-dir'])
        this.logger = await ConsoleAndFileLogger.setup(this.logFiles);
        this.logger.showLogFiles(this.logFiles);
        return this.logger
    }

    getLogFiles(
        extraLogFiles: string[] = [],
        extraLogDirs: string[] = [],
    ): string[] {
        let logFiles = []
        logFiles.push(ConsoleAndFileLogger.getLogFileInHomeFolder())
        logFiles.push(ConsoleAndFileLogger.getLogFileInTempFolder())
        logFiles = logFiles.concat(extraLogFiles)
        log.debug(`extraLogFiles [${extraLogFiles}] ${logFiles.length}`)
        extraLogDirs.forEach(extraDir => {
            logFiles.push(ConsoleAndFileLogger.getLogFileInExtraDir(extraDir))
        })
        log.debug(`extraLogDirs ${extraLogDirs} ${logFiles.length}`)
        log.debug(`logFiles.length ${logFiles.length}`)
        return logFiles
    }

}

// https://deno.land/manual/tools/script_installer
if (import.meta.main) {
    await new Levain().runLevinWithLog(Deno.args);
}
