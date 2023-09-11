export const newPeerConnection = new RTCPeerConnection({
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302',
        },
    ],
});

export function initializeLocalStream() {
    return navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => stream);
}