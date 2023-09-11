import React, { useEffect, useRef } from 'react';

interface LocalVideoProps {
	stream: MediaStream | null;
}

const LocalVideo: React.FC<LocalVideoProps> = ({ stream }) => {
	const localVideoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		if (localVideoRef.current && stream && !localVideoRef.current.srcObject) {
			localVideoRef.current.srcObject = stream;
		}
	}, [stream]);

	return (
		<div>
			<h3>Local</h3>
			<video ref={localVideoRef} autoPlay />
		</div>
	);
};

export default LocalVideo;
