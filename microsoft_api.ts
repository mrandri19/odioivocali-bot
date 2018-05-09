const result = require("dotenv").config()
if (result.error) {
  throw result.error
}

const apikey = process.env.MICROSOFT_SPEECH_APIKEY
if (apikey === undefined) {
  throw "MICROSOFT_SPEECH_APIKEY is undefined"
}

import request from "request-promise-native"
import { createReadStream, PathLike, ReadStream } from "fs"
import { Readable } from "stream"
import { ApiResult } from "./types"

async function text_from_wav_file_stream(rs: Readable): Promise<ApiResult> {
  const options: request.Options = {
    url: "https://speech.platform.bing.com/speech/recognition/interactive/cognitiveservices/v1",
    qs: { language: "it-IT" },
    headers: {
      "content-type": "audio/wav; codec=audio/pcm; samplerate=16000",
      "ocp-apim-subscription-key": apikey
    },
    body: rs
  }

  const res = await request.post(options)
  const json = JSON.parse(res)
  return json
}

export default text_from_wav_file_stream
