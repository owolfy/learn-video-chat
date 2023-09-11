import { useState, useEffect } from 'react';
import { initializeLocalStream, newPeerConnection } from '../modules/RtcPeerConnection.module';
import LocalVideo from './LocalVideo';
import RemoteVideo from './RemoteVideo';
import { db } from '../modules/firebase';
import {
	DocumentData,
	DocumentReference,
	doc,
	getDoc,
	onSnapshot,
	setDoc,
} from 'firebase/firestore';

const FirebaseChat: React.FC = () => {
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
	const [roomId, setRoomId] = useState<string>('');
	const [hasJoinedRoom, setHasJoinedRoom] = useState<boolean>(false);
	let roomDoc: DocumentReference<DocumentData, DocumentData>;
	let roomData;

	async function setup() {
		roomDoc = doc(db, 'pocVideo', roomId);
		roomData = (await getDoc(roomDoc)).data();
		setLocalStream(await initializeLocalStream());

		const newPeerConnection = new RTCPeerConnection();
		newPeerConnection.onicecandidate = async event => {
			if (event.candidate) {
				await setDoc(roomDoc, { 'ice-candidate': event.candidate }, { merge: true });
			}
		};

		newPeerConnection.ontrack = event => {
			setRemoteStream(event.streams[0]);
		};

		onSnapshot(roomDoc, snapshot => {
			const data = snapshot.data();
			if (data) {
				if (data['ice-candidate']) {
					const candidate = new RTCIceCandidate(data['ice-candidate']);
					newPeerConnection.addIceCandidate(candidate);
				}

				if (data['offer']) {
					const offer = new RTCSessionDescription(data['offer']);
					newPeerConnection.setRemoteDescription(offer);
					newPeerConnection
						.createAnswer()
						.then(answer => newPeerConnection.setLocalDescription(answer))
						.then(async () => {
							await setDoc(
								roomDoc,
								{ answer: newPeerConnection.localDescription },
								{ merge: true },
							);
						});
				}

				if (data['answer']) {
					const answer = new RTCSessionDescription(data['answer']);
					newPeerConnection.setRemoteDescription(answer);
				}
			}
		});
	}

	useEffect(() => {
		console.log('000 hasJoinedRoom');
		if (!hasJoinedRoom) {
			return;
		}
		setup();
	}, [hasJoinedRoom]);

	const startCall = () => {
		if (newPeerConnection && localStream) {
			localStream.getTracks().forEach(track => {
				newPeerConnection.addTrack(track, localStream);
			});

			newPeerConnection
				.createOffer()
				.then(offer => newPeerConnection.setLocalDescription(offer))
				.then(async () => {
					await setDoc(roomDoc, { offer: newPeerConnection.localDescription }, { merge: true });
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

export default FirebaseChat;
