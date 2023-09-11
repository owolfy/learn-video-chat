import React, { useEffect, useRef } from 'react';

interface RemoteVideoProps {
	stream: MediaStream | null;
}

const RemoteVideo: React.FC<RemoteVideoProps> = ({ stream }) => {
	const remoteVideoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		if (remoteVideoRef.current && stream) {
			remoteVideoRef.current.srcObject = stream;
		}
	}, [stream]);

	return (
		<div>
			<h3>Remote</h3>
			<video ref={remoteVideoRef} autoPlay />
		</div>
	);
};

export default RemoteVideo;
