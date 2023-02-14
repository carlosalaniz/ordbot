import { config } from "./config";
import jwt_decode from "jwt-decode";
import { v4 as uuidv4 } from 'uuid';

const BASE_PATH = "https://api.extraordinal.net";
const resolveURL = (resource: string) => `${BASE_PATH}/${resource}`;
const client_id_header = "x-client-id";
class WebClient {
  private client_id?: string | null;
  constructor() {
    this.client_id = localStorage.getItem(client_id_header);
    if (!this.client_id) {
      this.client_id = uuidv4();
      localStorage.setItem(client_id_header, this.client_id!);
    }
  }
  async getOrders() {
    return await fetch(
      resolveURL(`inscriptions/status/all`), {
      headers: [
        [client_id_header, this.client_id!]
      ]
    }).then(r => r.json());
  }
  async queue(file: File, fee_option: string, destination_address: string) {
    const resourceUrl = resolveURL("inscriptions/queue")
    var data = new FormData()
    data.append('file', file, file.name)
    data.append('fee_option', fee_option)
    data.append('destination_address', destination_address)

    const response = await fetch(resourceUrl, {
      method: 'POST',
      headers: [
        [client_id_header, this.client_id!]
      ],
      body: data
    }).then(r => r.json());

    return response;
  }
  async estimate(bytes_size: number, fee_option: string) {
    const resourceUrl = resolveURL("inscriptions/estimate")

    const response = await fetch(resourceUrl, {
      method: "POST",
      headers: [
        [client_id_header, this.client_id!],
        ["Content-Type", "application/json"]
      ],
      body: JSON.stringify({ bytes_size, fee_option })
    }).then(r => r.json());

    return response;
  }
  async status(depositAddress: string) {
    const resourceUrl = resolveURL(`inscriptions/status?depositAddress=${depositAddress}`)
    const response = await fetch(resourceUrl, {
      method: "POST",
      headers: [
        [client_id_header, this.client_id!],
        ["Content-Type", "application/json"]
      ],
    })
    if (response.status === 200)
      return await response.json();
    return response.status

  }
  imageAddress(deposit_address: string) {
    return resolveURL(`inscriptions/file?depositAddress=${deposit_address}`)
  }
  async service_status() {
    return await fetch(resolveURL(`inscriptions/status`)).then(r => r.json());
  }
  async getServerMessages(){
    return await fetch(resolveURL(`server/messages`)).then(r => r.json());
  }
}
export default new WebClient();
