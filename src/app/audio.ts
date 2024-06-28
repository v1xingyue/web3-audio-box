"use client";

// convert webm audio to wav audio and return Blob
export const WebmAudioToWav = async (blob:Blob) =>{
    // 创建一个AudioContext实例
    const audioContext = new (window.AudioContext)();
    // 读取blob数据并解码为AudioBuffer
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // 将AudioBuffer转换为WAV格式
    const wavBuffer = audioBufferToWav(audioBuffer);
    const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });

    return wavBlob;
    
}

// 将AudioBuffer转换为WAV格式
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    const channels: Float32Array[] = [];
    let i: number;
    let sample: number;
    let offset = 0;
    let pos = 0;

    // 写入WAVE头
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // 文件长度 - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // 长度 = 16
    setUint16(1); // PCM（未压缩）
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit（此示例中硬编码）

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk长度

    // 写入交错数据
    for (i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
        for (i = 0; i < numOfChan; i++) { // 交错通道
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
            view.setInt16(pos, sample, true); // 写入16-bit样本
            pos += 2;
        }
        offset++; // 下一个源样本
    }

    function setUint16(data: number) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data: number) {
        view.setUint32(pos, data, true);
        pos += 4;
    }

    return bufferArray;
}