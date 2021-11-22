import PollyTTS from "../src/tts";
import chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import chaiAsPromised from "chai-as-promised";
import {join} from "path";
//import http from 'http'
//import fs from 'fs'
//import path from 'path'
//import textToSpeech from '@google-cloud/text-to-speech'
const {transcode} = require("@fonoster/tts");

const expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);
const sandbox = sinon.createSandbox();

describe("@fonoster/googletts", () => {
  afterEach(() => sandbox.restore());

  /*it('rejects if the TTS because could not find default credentials', () => {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = void(0)
    const client = new textToSpeech.TextToSpeechClient()
    const join = sandbox.spy(path, 'join')
    const synthesizeSpeech = sandbox.spy(client, 'synthesizeSpeech')
    const writeFile = sandbox.spy(fs, 'writeFile')    
    const tts = new GoogleTTS()

    expect(tts.synthesize('hello world')).to.eventually.rejectedWith(
      'Could not load the default credentials.'
    )
    expect(join).to.have.been.calledTwice
    expect(writeFile).to.not.have.been.called
    expect(synthesizeSpeech).to.not.have.been.called
  })*/

  it("synthesizes text and returns path to file", async () => {
    const config = {
      region: "us-east-1",
      keyFilename: "/Users/pedrosanders/Projects/fonoster/credentials.json"
    };

    const tts = new PollyTTS(config);
    await tts.synthetize("Hello Kayla, how are you doing today?", {
      voiceId: "Nicole"
    });
    transcode(
      "/tmp/793891cb5510c196c4f487ad00c430fd.mp3",
      "/tmp/t_793891cb5510c196c4f487ad00c430fd.wav"
    );
  });
});