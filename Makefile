docker-build:
	docker build \
	--platform=linux/amd64 \
	-t msdbot_telegram \
	--progress=plain \
	.

docker-run:
	docker run \
	-itd \
	--env-file=./.env \
	msdbot_telegram