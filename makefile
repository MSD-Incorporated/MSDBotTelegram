GIT_SHA_FETCH := $(shell git rev-parse HEAD | cut -c 1-8)
export GIT_COMMIT=$(GIT_SHA_FETCH)

docker_build_bot:
	docker build --build-arg GIT_COMMIT=$(GIT_COMMIT) -t mased/msdbot_telegram .

docker_restart:
	docker stop msdbot_telegram && docker rm msdbot_telegram && make docker_bot

watchtower:
	docker run -d \
	--name watchtower \
	-v ~/.docker/config.json:/config.json \
	-v /var/run/docker.sock:/var/run/docker.sock \
	containrrr/watchtower \
	msdbot_telegram \
	--cleanup --interval 60 --api-version 1.44

docker_database:
	docker run \
	--name database \
	--network network \
	--health-cmd="pg_isready -U postgres" \
	--health-interval=30s \
	--health-timeout=10s \
	--health-retries=5 \
	--health-start-period=10s \
	-itd \
	-p 5432:5432 \
	--env-file .env \
	-v database:/var/lib/postgresql/data \
	postgres:16-alpine

docker_bot_api:
	docker run \
	--name telegram-bot-api \
	--network network \
	--health-cmd="wget -S -O /dev/null http://127.0.0.1:8081/ 2>&1 | grep -q '404' || exit 1" \
	--health-interval=60s \
	--health-timeout=10s \
	--health-retries=3 \
	--health-start-period=10s \
	-p 8081:8081 \
	--env-file .env \
	-v /etc/timezone:/etc/timezone \
	-v telegram_api_data:/var/lib/telegram-bot-api \
	-e TELEGRAM_LOCAL=true \
	-d aiogram/telegram-bot-api:latest

docker_bot:
	docker run \
	--name msdbot_telegram \
	--network network \
	--env-file .env \
	-v telegram_api_data:/var/lib/telegram-bot-api \
	-m 200m --cpus="2.5" \
	-e NODE_ENV=prod \
	--restart=always \
	-d mased/msdbot_telegram