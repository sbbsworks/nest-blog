FROM debian:latest

RUN rm /bin/sh && ln -s /bin/bash /bin/sh
RUN apt-get update && apt-get upgrade -y
RUN apt-get install curl

RUN mkdir -p /tmp && cd tmp

ENV NVM_DIR /tmp
ENV NODE_VERSION v21.6.1
RUN curl --silent -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash \
  && . $NVM_DIR/nvm.sh \
  && nvm install $NODE_VERSION \
  && nvm use $NODE_VERSION
RUN ln -sf $NVM_DIR/versions/node/$NODE_VERSION/bin/node /usr/bin/node
RUN curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=8.14.3 sh -

COPY ./apps/blog/package.json /apps/blog/package.json
COPY ./apps/gateway/package.json /apps/gateway/package.json
COPY ./apps/notifier/package.json /apps/notifier/package.json
COPY ./apps/users/package.json /apps/users/package.json

RUN ~/.local/share/pnpm/pnpm install --prefix /apps/blog/
RUN ~/.local/share/pnpm/pnpm install --prefix /apps/gateway/
RUN ~/.local/share/pnpm/pnpm install --prefix /apps/notifier/
RUN ~/.local/share/pnpm/pnpm install --prefix /apps/users/

RUN rm -r /apps/blog/node_modules/@prisma
RUN rm -r /apps/gateway/node_modules/@prisma
RUN rm -r /apps/notifier/node_modules/@prisma
RUN rm -r /apps/users/node_modules/@prisma

COPY ./apps/@prisma-blog /apps/blog/node_modules/@prisma
COPY ./apps/@prisma-blog /apps/gateway/node_modules/@prisma
COPY ./apps/@prisma-blog /apps/notifier/node_modules/@prisma
COPY ./apps/@prisma-blog /apps/users/node_modules/@prisma

COPY ./apps/@prisma-blog /apps/blog/node_modules/@prisma-blog
COPY ./apps/@prisma-blog /apps/gateway/node_modules/@prisma-blog
COPY ./apps/@prisma-blog /apps/notifier/node_modules/@prisma-blog
COPY ./apps/@prisma-blog /apps/users/node_modules/@prisma-blog

COPY ./apps/blog/* /apps/blog
COPY ./apps/gateway/* /apps/gateway
COPY ./apps/notifier/* /apps/notifier
COPY ./apps/users/* /apps/users

COPY ./apps/.env.production /apps/.env.production
COPY ./apps/entrypoint.sh /apps/entrypoint.sh

WORKDIR /apps

ENTRYPOINT ["sh", "entrypoint.sh"]
