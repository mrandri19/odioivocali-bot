// Imports the Google Cloud client library
const speech = require("@google-cloud/speech")
const fs = require("fs")

import request from "request-promise-native"
import { createReadStream, PathLike, ReadStream } from "fs"
import { Readable } from "stream"
import { ApiResult } from "./types"

async function stream_to_base64_string(rs: Readable) {
  return new Promise((resolve, reject) => {
    let buffer: Buffer[] = []
    let buf: Buffer
    rs.on("data", function(d: Buffer) {
      buffer.push(d)
    })
    rs.on("end", function() {
      buf = Buffer.concat(buffer)
      const audioBytes = Buffer.from(buf).toString("base64")
      resolve(audioBytes)
    })
  })
}

async function text_from_wav_file_stream(rs: Readable): Promise<ApiResult> {
  const client = new speech.SpeechClient()

  const audio = {
    content: await stream_to_base64_string(rs)
  }

  const config = {
    encoding: "LINEAR16",
    sampleRateHertz: 16000,
    languageCode: "it-IT"
  }
  const speech_api_request = {
    audio: audio,
    config: config
  }

  const data: { results: { alternatives: { transcript: string }[] }[] }[] = await client.recognize(speech_api_request)
  const response = data[0]
  const transcription = response.results.map(result => result.alternatives[0].transcript).join("\n")

  return { DisplayText: transcription }
}

export default text_from_wav_file_stream
