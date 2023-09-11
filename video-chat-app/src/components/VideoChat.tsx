import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { Socket } from 'socket.io-client';
import LocalVideo from './LocalVideo';
import RemoteVideo from './RemoteVideo';
import { initializeLocalStream, newPeerConnection } from '../modules/RtcPeerConnection.module';

const VideoChat: React.FC = () => {
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
	const socketRef = useRef<Socket | null>(null);
	const [roomId, setRoomId] = useState<string>('');
	const [hasJoinedRoom, setHasJoinedRoom] = useState<boolean>(false);

	async function setup() {
		const socket = io('http://localhost:3000');
		socketRef.current = socket;
		socket.emit('join-room', roomId);

		setLocalStream(await initializeLocalStream());

		newPeerConnection.onicecandidate = event => {
			if (event.candidate) {
				socket.emit('ice-candidate', event.candidate, roomId);
			}
		};

		newPeerConnection.ontrack = event => {
			setRemoteStream(event.streams[0]);
		};

		socket.on('ice-candidate', (candidate: RTCIceCandidateInit) => {
			const iceCandidate = new RTCIceCandidate(candidate);
			newPeerConnection.addIceCandidate(iceCandidate);
		});

		socket.on('offer', (offer: RTCSessionDescriptionInit) => {
			newPeerConnection.setRemoteDescription(new RTCSessionDescription(offer));
			newPeerConnection
				.createAnswer()
				.then(answer => newPeerConnection.setLocalDescription(answer))
				.then(() => {
					socket.emit('answer', newPeerConnection.localDescription, roomId);
				});
		});

		socket.on('answer', (answer: RTCSessionDescriptionInit) => {
			newPeerConnection.setRemoteDescription(new RTCSessionDescription(answer));
		});
	}

	useEffect(() => {
		if (!hasJoinedRoom) {
			return;
		}

		setup();
	}, [hasJoinedRoom]);

	const startCall = () => {
		if (newPeerConnection && localStream && socketRef.current) {
			localStream.getTracks().forEach(track => {
				newPeerConnection.addTrack(track, localStream);
			});

			newPeerConnection
				.createOffer()
				.then(offer => newPeerConnection.setLocalDescription(offer))
				.then(() => {
					socketRef.current?.emit('offer', newPeerConnection.localDescription, roomId);
				});
		}
	};

	const joinRoom = () => {
		if (roomId) {
			setHasJoinedRoom(true);
		}
	};

	return (
		<div>
			{!hasJoinedRoom ? (
				<div>
					<input
						type="text"
						placeholder="Enter room ID"
						value={roomId}
						onChange={e => setRoomId(e.target.value)}
					/>
					<button onClick={joinRoom}>Join Room</button>
				</div>
			) : (
				<>
					<LocalVideo stream={localStream} />
					<RemoteVideo stream={remoteStream} />
					<button onClick={startCall}>Start Call</button>
				</>
			)}
		</div>
	);
};

export default VideoChat;
