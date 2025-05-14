docker_build_bot:
	docker build -t mased/msdbot_telegram .

docker_bot_api:
	docker run \
	--name telegram-bot-api \
	--network msdbot_internal_network \
	-p 8081:8081 \
	--env-file .env \
	-e TELEGRAM_LOCAL=1 \
	-v /etc/timezone:/etc/timezone \
	-v /etc/localtime:/etc/localtime \
	-v telegram-bot-api:/var/lib/telegram-bot-api \
	-d aiogram/telegram-bot-api:latest

docker_bot:
	docker run \
	--name msdbot_telegram \
	--network msdbot_internal_network \
	--env-file .env \
	--volumes-from telegram-bot-api \
	--restart always \
	-e NODE_ENV=production \
	-d mased/msdbot_telegram

docker_database:
	docker run \
	--name database \
	-itd \
	-p 5432:5432 \
	--network msdbot_internal_network \
	--env-file .env \
	-v database:/var/lib/postgresql/data \
	postgres:16-alpine