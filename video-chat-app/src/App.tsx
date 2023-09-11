import VideoChat from './components/VideoChat';
import FirebaseChat from './components/FirebaseChat';
import './modules/firebase';

function App() {
	return (
		<div className="App">
			{/* <VideoChat /> */}
			<FirebaseChat />
		</div>
	);
}

export default App;
