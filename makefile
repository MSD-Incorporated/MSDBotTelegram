docker_build_bot:
	docker build -t mased/msdbot_telegram .

docker_bot_api:
	docker run \
	--name telegram-bot-api \
	--network msdbot_telegram_default_network \
	--network msdbot_telegram_internal_network \
	--net bridge \
	-p 8081:8081 \
	--env-file .env \
	-v /etc/timezone:/etc/timezone \
	-v telegram_api_data:/var/lib/telegram-bot-api \
	-d aiogram/telegram-bot-api:latest

docker_bot:
	docker run \
	--name msdbot_telegram \
	--network msdbot_telegram_internal_network \
	--net bridge \
	--env-file .env \
	-e NODE_ENV=production \
	-d mased/msdbot_telegram

docker_database:
	docker run \
	--name database \
	-itd \
	-p 5432:5432 \
	--network msdbot_telegram_internal_network \
	--net bridge \
	--env-file .env \
	-v database:/var/lib/postgresql/data \
	postgres:16-alpine