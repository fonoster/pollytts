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
import os from "os";
import path from "path";
import * as AWS from "@aws-sdk/client-polly";
import {Plugin} from "@fonoster/common";
import {TTSPlugin, computeFilename, SynthResult} from "@fonoster/tts";
import logger from "@fonoster/logger";
import {PollyTTSConfig, SynthOptions} from "./types";
import {LanguageCode, TextType, Voice, Engine, Region} from "./enums";
import { assertFileExist, assertFileIsWellForm } from "./assertions";

const defaultVoice = {
  voice: Voice.Vitoria,
  textType: TextType.Text,
  engine: Engine.Standard,
  languageCode: LanguageCode.en_US 
};

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
   * Constructs a new PollyTTS object.
   *
   * @see module:tts:AbstractTTS
   */
  constructor(config: PollyTTSConfig) {
    super("tts", "pollytts");
    this.config = config;
    this.config.path = config.path ? config.path : os.tmpdir();
    this.config.region = config.region ? config.region : Region.us_east_1;
    if (config.keyFilename) {
      assertFileExist(config.keyFilename);
      assertFileIsWellForm(config.keyFilename);
      const credentials = require(config.keyFilename)
      this.config.accessKeyId = credentials.accessKeyId;
      this.config.secretAccessKey = credentials.secretAccessKey;
    } else {
      this.config.accessKeyId = config.accessKeyId;
      this.config.secretAccessKey = config.secretAccessKey;
    }
  }

  /**
   * @inherit
   */
  async synthetize(
    text: string,
    options: SynthOptions = {}
  ): Promise<SynthResult> {
    const client = new AWS.Polly(this.config as any);
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
      VoiceId: voice.voice,
      Engine: voice.engine,
      TextType: voice.textType,
      LanguageCode: voice.languageCode,
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
export { Voice, LanguageCode, TextType, Engine}

// WARNING: Workaround to support commonjs clients
module.exports = PollyTTS;
module.exports.Voice = Voice;
module.exports.LanguageCode = LanguageCode;
module.exports.TextType = TextType;
module.exports.Engine = Engine;
