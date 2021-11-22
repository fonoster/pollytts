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
import PollyTTS from "../src/tts";
import chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import chaiAsPromised from "chai-as-promised";
import * as AWS from "@aws-sdk/client-polly";
import fs from "fs";
import path from "path";

const expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();
const sandbox = sinon.createSandbox();

describe("@fonoster/googletts", () => {
  afterEach(() => sandbox.restore());

  /*it("rejects if the TTS because could not find any credentials", async () => {
    const client = new textToSpeech.TextToSpeechClient();
    const join = sandbox.spy(path, "join");
    const synthesizeSpeech = sandbox.spy(client, "synthesizeSpeech");
    const writeFile = sandbox.spy(fs, "writeFile");
    const tts = new PollyTTS({
      keyFilename: ""
    });

    await expect(tts.synthetize("hello world")).to.be.eventually.rejectedWith(
      "Could not load the default credentials."
    );
    expect(join).to.have.been.called;
    expect(writeFile).to.not.have.been.called;
    expect(synthesizeSpeech).to.not.have.been.called;
  });*/

  it("synthesizes text and returns path to file", async () => {
    const synthesizeSpeechStub = sandbox
      .stub(AWS.Polly.prototype, "synthesizeSpeech")
      .resolves([{audioContent: "some-audio"}]);
    const writeFile = sandbox.spy(fs, "writeFile");
    const join = sandbox.spy(path, "join");
    const config = {
      keyFilename: "path-to-file"
    };

    const tts = new PollyTTS(config);
    const result = await tts.synthetize(
      "Hello Kayla, how are you doing today?",
      {
        ssmlGender: "FEMALE"
      }
    );

    expect(join).to.have.been.calledOnce;
    expect(writeFile).to.have.been.calledOnce;
    expect(synthesizeSpeechStub).to.have.been.calledOnce;
    expect(result).to.have.property("filename").to.not.be.null;
    expect(result).to.have.property("pathToFile").to.not.be.null;
  });
});