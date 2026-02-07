GIT_SHA_FETCH := $(shell git rev-parse HEAD | cut -c 1-8)
export GIT_COMMIT=$(GIT_SHA_FETCH)

docker_build_bot:
	docker build --build-arg GIT_COMMIT=$(GIT_COMMIT) -t mased/msdbot_telegram .

docker_database:
	docker run \
	--name database \
	--network msdbot_internal_network \
	-itd \
	-p 5432:5432 \
	--env-file .env \
	-v database:/var/lib/postgresql/data \
	postgres:16-alpine

docker_bot_api:
	docker run \
	--name telegram-bot-api \
	--network msdbot_internal_network \
	-p 8081:8081 \
	--env-file .env \
	-v /etc/timezone:/etc/timezone \
	-v telegram_api_data:/var/lib/telegram-bot-api \
	-e TELEGRAM_LOCAL=true \
	-d aiogram/telegram-bot-api:latest

docker_bot:
	docker run \
	--name msdbot_telegram \
	--network msdbot_internal_network \
	--env-file .env \
	-v telegram_api_data:/var/lib/telegram-bot-api \
	-m 200m --cpus="2.5" \
	-e NODE_ENV=prod \
	-d mased/msdbot_telegram