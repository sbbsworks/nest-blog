#!/bin/sh
PATH=/usr/sbin:/sbin:/usr/bin:/bin
export PATH="$PATH:"/usr/local/bin/

git status
read -p "y/" CONDITION;
if [ ! -z "$CONDITION" ];
then
    git add .
    git commit --amend --no-edit
    git push origin master -f
fi

##pnpm nx serve users
##nx g library libraries/shared --dry-run
##nx generate @nx/node:library shared

##pnpm nx g @nx/nest:module apps/users/src/app/users-mongo
##nx g @nx/nest:service auth

#nx run-many --target=serve --all --maxParallel=10
#nx run-many --target=serve --all --maxParallel=10 --configuration=production

#pnpm nx reset
#nx run-many --target=build --prod --all

##grep -slR "PRIVATE" ~/.ssh/ | xargs ssh-add


##add to dev env
##GATEWAY_PUBLIC_DOMAIN=https://sbbsworks.online
##GATEWAY_PUBLIC_PORT=46300

##add to prod env
##GATEWAY_PUBLIC_DOMAIN=https://sbbsworks.online
##GATEWAY_PUBLIC_PORT=46433