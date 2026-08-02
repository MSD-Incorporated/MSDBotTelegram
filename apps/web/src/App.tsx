import "./index.css";

export function App() {
	window.Telegram?.WebApp?.ready();

	const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
	const theme = window.Telegram?.WebApp?.themeParams;

	return (
		<>
			<div className="text-large border p-10">Hello, {user?.first_name ?? "Unknown"}</div>
		</>
	);
}

export default App;
