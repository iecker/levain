import * as log from "https://deno.land/std/log/mod.ts";
import {envChain, promptSecret} from './utils.ts';
import Config from './config.ts';
import StringUtils from './string_utils.ts';

export function askEmail(config: Config, emailDomain:string|undefined = undefined): void {
    log.debug(`Asking for email`)

    let defaultEmail = config.email;
    if (!defaultEmail) {
        if (config.username && emailDomain) {
            defaultEmail = config.username + ( emailDomain.startsWith("@") ? "" : "@" ) + emailDomain;
            log.debug(`defaultEmail = ${defaultEmail}`);    
        } else {
            if (!config.username) {
                log.debug("No username for defaultEmail");
            }
    
            if (!emailDomain) {
                log.debug("No emailDomain for defaultEmail");    
            }
        }
    }

    let email = prompt("    Email: ", defaultEmail);
    if (!email) {
        throw new Error(`Unable to collect email`);
    }

    // TODO: Validate email

    config.email = email;
}

export function askUsername(config: Config): void {
    log.debug(`Asking for username`)

    let username: string | null = prompt(" Username: ", envChain("user", "username")?.toLowerCase());
    if (!username) {
        throw new Error(`Unable to collect username`);
    }

    config.username = username;
}

export function askFullName(config: Config): void {
    log.debug(`Asking for full name`)

    console.log("What's your full name?");
    let fullname: string | null = prompt("Full name: ", envChain("user", "fullname") || "");
    if (!fullname) {
        throw new Error(`Unable to collect full name`);
    }

    config.fullname = fullname;
}

export async function askPassword(config: Config) {
    const forbiddenPasswordChars = '^&'

    let tries = 0;
    do {
        tries++;
        log.debug(`Asking for password, try ${tries}`)

        console.log('')
        console.log(' ========================================================================================')
        console.log(' === ATTENTION PLEASE! The characters below are known to cause problems with passwords')
        console.log(' === If you use one of them, please change your password and come back.')
        console.log(' === Do not use:')
        console.log(` === ${forbiddenPasswordChars}`)
        console.log(' ========================================================================================')
        console.log('')
        const password = await promptSecret(" Password: ");
        console.log("");
        const pw2 = await promptSecret("  Confirm: ");
        console.log("");

        if (password == pw2) {
            if (StringUtils.textContainsAtLeastOneChar(password || '', forbiddenPasswordChars)) {
                throw '****** INVALID CHAR IN PASSWORD. Please change your password and try again.'
            }

            console.log("");
            console.log("Double checked password, but we did NOT validate it with the server");
            console.log("");
            config.password = password;
            return;
        }

        console.log("Password mismatch... Please, inform again.");
        console.log("");
    } while (tries < 3);

    throw new Error(`Unable to collect password after ${tries} attempts`);
}
