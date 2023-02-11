import { FeeOptions, InscriptionQueueItemState, PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { writeFileSync } from "fs"
import { resolve } from "path"
import {
    Controller,
    FormField,
    Post,
    Route,
    Tags,
    UploadedFile
} from "tsoa";
import { OrdWallet } from "../common/ord";
import { estimateCost } from "../common/utils";
import config from "../config";
import { validate } from 'bitcoin-address-validation';





@Tags("Inscriptions")
@Route("inscriptions")
export class InscriptionController extends Controller {
    private prismaClient = new PrismaClient()
    @Post("/queue")
    public async uploadFileInscription(
        @UploadedFile() file: Express.Multer.File,
        @FormField() fee_option: FeeOptions,
        @FormField() destination_address: string
    ): Promise<any | string[]> {
        // check file
        let error_messages = [];
        if (file.size > 40000) {
            error_messages.push(`file size cannot be greater than 40,000 bytes. Actual size ${file.buffer.length}`);
        }

        const feeOption = FeeOptions[fee_option];
        if (!feeOption) {
            error_messages.push('invalid fee option');
        }

        if (!validate(destination_address)) {
            error_messages.push('invalid bitcoin address');
        }

        if (!/bc1p/.test(destination_address)) {
            error_messages.push('bitcoin address must be a taproot');
        }

        if (error_messages.length === 0) {
            const basePath = config.INSCRIPTIONS_IMAGE_FOLDER;
            const fileName = `${randomUUID()}.${file.originalname.split('.').pop()}`
            const filePath = resolve(basePath, fileName)
            // save file.
            writeFileSync(filePath, file.buffer);

            // queue inscriptions 
            const walletName = randomUUID();
            const cost = await estimateCost(file.size, feeOption);
            const result = OrdWallet.createWallet(walletName);
            const wallet = new OrdWallet(walletName);
            const receiveAddress = wallet.receiveAddress()
            const new_wallet = await this.prismaClient.wallet.create({
                data: {
                    id: walletName,
                    mnemonic: result.mnemonic,
                    receiving_address: receiveAddress.address,
                }
            });
            
            await this.prismaClient.inscriptionQueueItem.create({
                data: {
                    walletId: new_wallet.id,
                    inscription_cost: cost.inscriptionCost,
                    fee_sats: cost.feeSats,
                    total_sat: cost.total,
                    state: InscriptionQueueItemState.PENDING_PAYMENT,
                    file_path: filePath,
                    mime_type: file.mimetype,

                    fee_option: feeOption,
                    destination_address: destination_address,
                }
            })

            return {
                receiveAddress: receiveAddress.address,
                total: cost.total,
                timeoutSeconds: config.INSCRIPTION_QUEUE_ITEM_EXPIRY_SECONDS
            };
        } else {
            this.setStatus(400);
            return error_messages;
        }
    }
}