import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve } from 'path'
import { exit } from 'process';
import config from '../config'
import logger from './logger';

type inscription = {
    explorer: string,
    inscription: string,
    location: string
}

type balance = {
    cardinal: number
}

type ordTransactions = {
    transaction: string,
    confirmations: number
}

type mnemonic = {
    mnemonic: string
}

type receive =
    {
        address: string
    }

const walletStorage = config.ORD_TOOLS_WALLET_STORAGE_FULLPATH;
const regexVerify = new RegExp(config.ORD_WALLET_NAME_REGEX_VERIFY)

function verifyWalletName(walletName: string, exists: boolean) {
    if (!regexVerify.test(walletName)) {
        throw `Wrong wallet name=${walletName} regex=${regexVerify}`
    }
    const walletFolderPath = resolve(walletStorage, walletName);
    if (existsSync(walletFolderPath) !== exists) {
        throw `Wrong wallet path=${walletFolderPath} wallet name=${walletName} `
    }
}

export class OrdWallet {

    static createWallet(walletName): mnemonic {
        verifyWalletName(walletName, false)
        const walletFolderPath = resolve(walletStorage, walletName);
        if (existsSync(walletFolderPath)) {
            throw `createWallet: Wrong wallet path=${walletFolderPath} wallet name=${walletName} exists `
        }
        const result = execSync(`ord --wallet ${walletName} wallet create`).toString('utf-8')
        try {
            return JSON.parse(result) as mnemonic;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    static index() {
        const result = execSync(`ord index`).toString('utf-8');
        return result;
    }

    constructor(private walletName: string) {
        verifyWalletName(this.walletName, true)
        const walletFolderPath = resolve(walletStorage, this.walletName);
        if (!existsSync(walletFolderPath)) {
            throw `Wrong wallet path=${walletFolderPath} wallet name=${this.walletName} `
        }
    }

    // do
    inscribe(file_path: String, fee_rate: number) {
        OrdWallet.index();
        // I don't know how to do this yet.
        execSync("ord")
    };

    send(destination_wallet: string, fee_rate: number) {
        OrdWallet.index();
        // This should only be one.
        const inscriptions = this.inscriptions();
        if (inscriptions.length > 1) {
            throw `inscription list is greater than one, this is unexpected. ${this.walletName}`
        }
        const inscription = inscriptions.at(0) as inscription;
        const id = inscription.inscription;
        const command = `ord --wallet ${this.walletName} wallet send --fee-rate ${fee_rate} ${destination_wallet} ${id}`;
        const result = execSync(command).toString('utf-8')
        console.log(`Sent inscription from ${this.walletName} to ${destination_wallet} with command ${command}, result ${result}`)
    }

    //get
    inscriptions(): inscription[] | string {
        OrdWallet.index();
        const result = execSync(`ord --wallet ${this.walletName} wallet inscriptions`).toString('utf-8')
        try {
            return JSON.parse(result) as inscription[]
        } catch (e) {
            logger.warn(e, result);
            return result;
        }
    }

    balance(): balance | string {
        OrdWallet.index();
        const result = execSync(`ord --wallet ${this.walletName} wallet balance`).toString('utf-8')
        try {
            return JSON.parse(result) as balance;
        } catch (e) {
            logger.warn(e, result);
            return result;
        }
    }

    transactions(): ordTransactions[] | string {
        OrdWallet.index();
        const result = execSync(`ord --wallet ${this.walletName} wallet transactions`).toString('utf-8')
        try {
            return JSON.parse(result) as ordTransactions[];
        } catch (e) {
            logger.warn(e, result);
            return result;
        }
    }

    receiveAddress(): receive {
        OrdWallet.index();
        const result = execSync(`ord --wallet ${this.walletName} wallet receive`).toString('utf-8')
        try {
            return JSON.parse(result) as receive;
        } catch (e) {
            logger.warn(e, result);
            throw e;
        }
    }
}