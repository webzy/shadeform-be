const randomIP = () => {
	let ip = '';

	for (let i = 0; i <= 3; i++) {
		const randomNum = Math.floor(Math.random() * 255) + 1;
		ip += i < 3 ? `${randomNum}.` : `${randomNum}`;
	}

	return ip;
};

module.exports = { randomIP };
