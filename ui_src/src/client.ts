import { config } from "./config";
import jwt_decode from "jwt-decode";

const BASE_PATH = "https://api.extraordinal.net";
const resolveURL = (resource: string) => `${BASE_PATH}/${resource}`;
class WebClient {
  async queue(file: File, fee_option: string, destination_address: string) {
    const resourceUrl = resolveURL("inscriptions/queue")
    var data = new FormData()
    data.append('file', file, file.name)
    data.append('fee_option', fee_option)
    data.append('destination_address', destination_address)

    const response = await fetch(resourceUrl, {
      method: 'POST',
      body: data
    }).then(r => r.json());

    return response;
  }
  async estimate(bytes_size: number, fee_option: string) {
    const resourceUrl = resolveURL("inscriptions/estimate")

    const response = await fetch(resourceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bytes_size, fee_option })
    }).then(r => r.json());

    return response;
  }
  async status(depositAddress: string) {
    const resourceUrl = resolveURL(`inscriptions/status?depositAddress=${depositAddress}`)
    const response = await fetch(resourceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (response.status === 200)
      return await response.json();
    return response.status

  }
  imageAddress(deposit_address: string) {
    return resolveURL(`inscriptions/file?depositAddress=${deposit_address}`)
  }
}
export default new WebClient();
