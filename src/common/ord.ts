import { existsSync } from 'fs'
import { resolve } from 'path'
import { exit } from 'process';
import config from '../config'
import logger from './logger';
import { CommandQueue as CommandQueueExecuter } from './utils';

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
    private static queueExecuter = new CommandQueueExecuter(1);
    static indexBlock = false;
    static async createWallet(walletName): Promise<mnemonic> {
        verifyWalletName(walletName, false)
        const walletFolderPath = resolve(walletStorage, walletName);
        if (existsSync(walletFolderPath)) {
            throw `createWallet: Wrong wallet path=${walletFolderPath} wallet name=${walletName} exists `
        }
        const result = await OrdWallet.queueExecuter.execute(`ord --wallet ${walletName} wallet create`)
        try {
            return JSON.parse(result) as mnemonic;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    static async index(walletName = "ord") {
        if (OrdWallet.indexBlock) return;
        OrdWallet.indexBlock = true;
        const result = await OrdWallet.queueExecuter.execute(`ord --wallet ${walletName} index`)
        OrdWallet.indexBlock = false;
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
    async inscribe(file_path: String, fee_rate: number) {
        await OrdWallet.index();
        // I don't know how to do this yet.
        return await OrdWallet.queueExecuter.execute(`ord --wallet ${this.walletName} wallet inscribe ${file_path} --fee-rate ${fee_rate}`)
    };

    async send(destination_wallet: string, fee_rate: number) {
        await OrdWallet.index();
        
        // This should only be one.
        const inscriptions = await this.inscriptions();
        if (inscriptions.length > 1) {
            throw `inscription list is greater than one, this is unexpected. ${this.walletName}`
        }
        const inscription = inscriptions.at(0) as inscription;
        const id = inscription.inscription;
        const command = `ord --wallet ${this.walletName} wallet send --fee-rate ${fee_rate} ${destination_wallet} ${id}`;
        const result = await OrdWallet.queueExecuter.execute(command)
        console.log(`Sent inscription from ${this.walletName} to ${destination_wallet} with command ${command}, result ${result}`)
    }

    //get
    private async inscriptions() {
        await OrdWallet.index();
        const result = await OrdWallet.queueExecuter.execute(`ord --wallet ${this.walletName} wallet inscriptions`)
        try {
            return JSON.parse(result) as inscription[]
        } catch (e) {
            logger.warn(e, result);
            return result;
        }
    }

    async balance() {
        await OrdWallet.index();
        const result = await OrdWallet.queueExecuter.execute(`ord --wallet ${this.walletName} wallet balance`)
        try {
            return JSON.parse(result) as balance;
        } catch (e) {
            logger.warn(e, result);
            return result;
        }
    }

    async transactions() {
        await OrdWallet.index();
        const result = await OrdWallet.queueExecuter.execute(`ord --wallet ${this.walletName} wallet transactions`)
        try {
            return JSON.parse(result) as ordTransactions[];
        } catch (e) {
            logger.warn(e, result);
            return result;
        }
    }

    async receiveAddress() {
        // await OrdWallet.index();
        const result = await OrdWallet.queueExecuter.execute(`ord --wallet ${this.walletName} wallet receive`)
        try {
            return JSON.parse(result) as receive;
        } catch (e) {
            logger.warn(e, result);
            throw e;
        }
    }
}