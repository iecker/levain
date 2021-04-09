import * as log from "https://deno.land/std/log/mod.ts";
import { ArrayUtils } from "../utils/array_utils.ts";
import {envChain} from "../utils/utils.ts";
import {Powershell} from "./powershell.ts";

export default class OsUtils {

    static get tempDir(): string {
        const tempDirEnvVars = ['TEMP', 'TMPDIR', 'TMP'];
        const tempDir = envChain(...tempDirEnvVars);
        if (!tempDir) {
            //throw `TempDir not found. Looked for env vars ${tempDirEnvVars.join()}`
            return "/tmp";
        }

        return tempDir
    }

    static get login(): string {
        const userEnvStrings = ['USERID', "USER", "user", "username"];
        const userFromEnv = envChain(...userEnvStrings);
        if (!userFromEnv) {
            throw `User not found. Looked for env vars ${userEnvStrings.join()}`
        }
        return userFromEnv
    }

    static get homeDir(): string {
        const homeEnvStrings = ['HOME', 'USERPROFILE'];
        const folderFromEnv = envChain(...homeEnvStrings);
        if (!folderFromEnv) {
            throw `Home folder not found. Looked for env vars ${homeEnvStrings.join()}`
        }
        return folderFromEnv
    }

    static get hostname(): string | undefined {
        const hostEnvStrings = ['COMPUTERNAME', "HOSTNAME"]
        const hostFromEnv = envChain(...hostEnvStrings)
        if (!hostFromEnv) {
            log.debug(`Hostname not found. Looked for env vars ${hostEnvStrings.join()}`)
            return undefined
        }

        return hostFromEnv
    }

    static onlyInWindows(isError = true) {
        if (!OsUtils.isWindows()) {
            const message = `${OsUtils.getOs()} not supported`
            if (isError) {
                throw new Error(message)
            } else {
                log.warning(message)
            }
        }
    }

    static isWindows(): boolean {
        return this.getOs() === "windows"
    }

    static getOs(): string {
        return Deno.build.os;
    }

    static async setEnvPermanent(key: string, value: string) {
        OsUtils.onlyInWindows()
        this.setEnv(key, value);

        await this.runAndLog(`setx ${key} ${value}`)
    }

    static setEnv(key: string, value: string) {
        Deno.env.set(key, value)
    }

    static async addPathPermanent(newPathItem: string) {
        OsUtils.onlyInWindows()

        const path = await this.getUserPath();
        let newPath = ArrayUtils.remove(path, newPathItem)

        newPath.unshift(newPathItem);

        this.setUserPath(newPath);
    }   

    static async removePathPermanent(itemToRemove:string) { 
        const path = await this.getUserPath();
        let newPath = ArrayUtils.remove(path, itemToRemove)
        this.setUserPath(newPath);
    }


    static async isInUserPath(pathItem:string) { 
        const path = await this.getUserPath();
        return path.includes(pathItem);
    }


    static async runAndLog(command: string): Promise<void> {
        log.debug(`runAndLog\n${command}`)
        let args = command.split(" ");

        // https://github.com/denoland/deno/issues/4568
        const proc = Deno.run({
            cmd: args,
            // stderr: 'piped',
            stdout: 'piped',
        });

        const [
            // stderr,
            stdout,
            status
        ] = await Promise.all([
            // proc.stderrOutput(),
            proc.output(),
            proc.status()
        ]);

        proc.close()

        log.debug(`status ${JSON.stringify(status)}`)

        if (status.success) {
            const output = new TextDecoder().decode(stdout)
            log.debug(`stdout ${output}`)
        } else {
            // const errorString = new TextDecoder().decode(stderr)
            // log.error(`stderr ${errorString}`)

            throw `Error ${status.code} running "${command}"`;
        }
    }

    static async clearConsole() {
        const cmdLine = OsUtils.isWindows() ? 'cmd /c cls' : 'clear';
        const cmd = cmdLine.split(' ')
        let proc = Deno.run({cmd})
        await proc.status();
        proc.close();
    }

    static makeReadOnly(path: string) {
        Deno.chmodSync(path, 0o444)
    }

    static makeReadWrite(path: string) {
        Deno.chmodSync(path, 0o777)
    }

    static async getUserPath(): Promise<string[]> {
        this.onlyInWindows()
        const rawPath = await Powershell.run('extra-bin/windows/os-utils/getUserPath.ps1', true)
        return rawPath.split(';')
    }

    static async setUserPath(newPath:string[]) { 
        const newPathString = newPath.join(';');
        const setUserPathScript = "extra-bin/windows/os-utils/setUserPath.ps1"
        await Powershell.run(setUserPathScript, false, false, [newPathString]);
    }
}
