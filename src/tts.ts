/*
 * Copyright (C) 2021 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster/fonoster
 *
 * This file is part of Fonoster
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *    https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import fs from "fs";
import path from "path";
import * as AWS from "@aws-sdk/client-polly";
import {Plugin} from "@fonoster/common";
import {TTSPlugin, computeFilename, SynthResult} from "@fonoster/tts";
import logger from "@fonoster/logger";
import {PollyTTSConfig, SynthOptions} from "./types";

const defaultVoice = {voiceId: "Nicole"};

/**
 * @classdesc Optional TTS engine for Fonoster.
 *
 * @extends AbstractTTS
 * @example
 * const PollyTTS = require("@fonoster/pollytts");
 *
 * new PollyTTS().synthetize("Hello world")
 *  .then((result) => console.log("path: " + result.pathToFile))
 *  .catch(console.error);
 */
class PollyTTS extends Plugin implements TTSPlugin {
  config: PollyTTSConfig;
  /**
   * Constructs a new GoogleTTS object.
   *
   * @see module:tts:AbstractTTS
   */
  constructor(config: PollyTTSConfig) {
    super("tts", "pollytts");
    this.config = config;
    this.config.path = config.path ? config.path : "/tmp";
  }

  /**
   * @inherit
   */
  async synthetize(
    text: string,
    options: SynthOptions = {}
  ): Promise<SynthResult> {
    const client = new AWS.Polly(this.config as any);
    // TODO: The file extension should be set based on the sample rate
    // For example, if we set the sample rate to 16K, then the extension needs to be
    // snl16, for 8K => sln, etc...
    const filename = computeFilename(text, options, "sln16");
    const pathToFile = path.join(this.config.path, filename);

    logger.verbose(
      `@fonoster/tts.PollyTTS.synthesize [text: ${text}, options: ${JSON.stringify(
        options
      )}]`
    );

    const merge = require("deepmerge");
    const voice = merge(defaultVoice, options || {});

    const request = {
      VoiceId: voice.voiceId,
      Text: text,
      OutputFormat: "pcm",
      SampleRate: "16000"
    };
    // Performs the text-to-speech request
    const response = await client.synthesizeSpeech(request);
    response.AudioStream.pipe(fs.createWriteStream(pathToFile))
    return {filename, pathToFile};
  }
}

export default PollyTTS;

// WARNING: Workaround to support commonjs clients
module.exports = PollyTTS;