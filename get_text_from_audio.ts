import request from "request"
import stream from "stream"

import ffmpeg from "fluent-ffmpeg"

import text_from_wav_file_stream from "./google_api"
import { ApiResult } from "./types"

/**
 * Uses Google Cloud Speech Speech-To-Text API or Microsoft Azure Speech API
 * to get the text from an audio file downloaded from the `url`.
 * @param url the URL where to download the audio file from.
 */
export default function get_text_from_audio(url: string): Promise<ApiResult> {
  return new Promise((resolve, reject) => {
    const response_stream = request(url)

    response_stream.on("error", err => reject(err))
    response_stream.on("response", res => {
      const wav_file_stream = ffmpeg()
        .addInput(res)
        .format("wav")
        .outputOption("-ar 16000")
        .pipe()

      text_from_wav_file_stream(wav_file_stream).then(json => resolve(json))
    })
  })
}
