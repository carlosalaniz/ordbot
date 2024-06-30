import * as express from "express";
import * as jwt from "jsonwebtoken";
import config from "./config";

export class Reseller {
    resellerId: string

}

export class HotspotPointOfSale {
    username: string;
    firstName:string;
    lastName:string;
}

export type AuthenticatedResellerRequest = Request & { user: Reseller };
export type AuthenticatedHotspotRequest = Request & { user: HotspotPointOfSale };

export function expressAuthentication(
    request: express.Request,
    securityName: string,
    scopes?: string[]
): Promise<any> {
    if (securityName === "jwt") {
        const token =
            request.body.token ||
            request.query.token ||
            request.headers["authorization"];

        return new Promise((resolve, reject) => {
            if (!token) {
                reject(new Error("No token provided"));
            }
            jwt.verify(token, config.JWT_SIGNING_SECRET, function (err: any, decoded: any) {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        });
    }
}

