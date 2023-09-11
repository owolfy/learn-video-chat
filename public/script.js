const roomId = prompt('Enter room ID:');
const socket = io('/');

socket.emit('join-room', roomId);

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let localStream;

navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
	localStream = stream;
	localVideo.srcObject = stream;
});

const peerConnection = new RTCPeerConnection({
	iceServers: [
		{
			urls: 'stun:stun.l.google.com:19302',
		},
	],
});

peerConnection.onicecandidate = event => {
	if (event.candidate) {
		socket.emit('ice-candidate', event.candidate, roomId);
	}
};

peerConnection.ontrack = event => {
	remoteVideo.srcObject = event.streams[0];
};

socket.on('ice-candidate', candidate => {
	const iceCandidate = new RTCIceCandidate(candidate);
	peerConnection.addIceCandidate(iceCandidate);
});

socket.on('offer', offer => {
	peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
	peerConnection
		.createAnswer()
		.then(answer => peerConnection.setLocalDescription(answer))
		.then(() => {
			socket.emit('answer', peerConnection.localDescription, roomId);
		});
});

socket.on('answer', answer => {
	peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

function startCall() {
	localStream.getTracks().forEach(track => {
		peerConnection.addTrack(track, localStream);
	});

	peerConnection
		.createOffer()
		.then(offer => peerConnection.setLocalDescription(offer))
		.then(() => {
			socket.emit('offer', peerConnection.localDescription, roomId);
		});
}
