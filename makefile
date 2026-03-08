GIT_SHA_FETCH := $(shell git rev-parse --short=8 HEAD)
GIT_COMMIT = $(GIT_SHA_FETCH)

NETWORK = msdbot_network
DATABASE_VOLUME = database
TELEGRAM_API_VOLUME = telegram_api_data
NAME = msdbot_telegram

docker_network:
	-docker network create $(NETWORK)

docker_build_bot:
	docker build --build-arg GIT_COMMIT=$(GIT_COMMIT) -t mased/$(NAME) .

docker_restart:
	-docker stop $(NAME)
	-docker rm $(NAME)
	make docker_bot

watchtower:
	docker run -d \
	--name watchtower \
	-v $(USERPROFILE)/.docker/config.json:/config.json \
	-v /var/run/docker.sock:/var/run/docker.sock \
	containrrr/watchtower \
	$(NAME) \
	--cleanup --interval 60 --api-version 1.44

docker_database:
	docker run \
	--name database \
	--network $(NETWORK) \
	--health-cmd="pg_isready -U root -d postgres" \
	--health-interval=30s \
	--health-timeout=10s \
	--health-retries=5 \
	--health-start-period=10s \
	-itd \
	--env-file .env \
	-v database:/var/lib/postgresql/data \
	postgres:16-alpine

docker_bot_api:
	docker run \
	--name telegram-bot-api \
	--network $(NETWORK) \
	--health-cmd="wget -S -O /dev/null http://127.0.0.1:8081/ 2>&1 | grep -q '404' || exit 1" \
	--health-interval=60s \
	--health-timeout=10s \
	--health-retries=3 \
	--health-start-period=10s \
	--env-file .env \
	-v /etc/timezone:/etc/timezone \
	-v telegram_api_data:/var/lib/telegram-bot-api \
	-e TELEGRAM_LOCAL=true \
	-d aiogram/telegram-bot-api:latest

docker_bot:
	docker run \
	--name $(NAME) \
	--network $(NETWORK) \
	--env-file .env \
	--volume $(TELEGRAM_API_VOLUME):/var/lib/telegram-bot-api \
	--memory="256m" \
	--memory-swap="256m" \
	--cpus="2.5" \
	-e NODE_ENV=prod \
	--restart=always \
	-d mased/$(NAME)

docker_slim:
	docker run \
	--name $(NAME) \
	--network $(NETWORK) \
	--env-file .env \
	--volume $(TELEGRAM_API_VOLUME):/var/lib/telegram-bot-api \
	--memory="256m" \
	--memory-swap="256m" \
	--cpus="2.5" \
	-e NODE_ENV=prod \
	--restart=always \
	-d mased/$(NAME).slim