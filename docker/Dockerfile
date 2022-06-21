# build stage
FROM node:lts as build-stage

// @if playwright || karma
ENV DEBIAN_FRONTEND=noninteractive

#update apt-get
#update apt-get
RUN apt-get update && apt-get install -y \
    apt-utils \
    fonts-liberation \
    libappindicator3-1 \
    libatk-bridge2.0-0 \
    libatspi2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxtst6 \
    lsb-release \
    xdg-utils \
    libgtk2.0-0 \
    libnotify-dev \
    libgconf-2-4 \
    libxss1 \
    libgbm1 \
    libasound2 \
    xvfb \
  && rm -rf /var/lib/apt/lists/*

# install chrome
RUN curl --silent --show-error --location --fail --retry 3 --output /tmp/google-chrome-stable_current_amd64.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
  && ( dpkg -i /tmp/google-chrome-stable_current_amd64.deb ||  apt-get -fy install)  \
  && rm -rf /tmp/google-chrome-stable_current_amd64.deb \
  &&  sed -i 's|HERE/chrome"|HERE/chrome" --disable-setuid-sandbox --no-sandbox|g' \
          "/opt/google/chrome/google-chrome" \
  && google-chrome --version

// @endif

RUN npm install -g aurelia-cli@^1.2.0


WORKDIR /app

# install dependencies
COPY ./*.json  ./
RUN npm install

// @if webpack
COPY config ./config
// @endif
COPY aurelia_project  ./aurelia_project

// @if webpack
COPY static ./static
// @endif

# Copy files in the root folder
COPY *.* ./

# Copy source files
COPY src ./src


// @if jest || karma
COPY test ./test
// @endif

// @if playwright
COPY e2e ./e2e
// @endif

// @if cli-bundler && dotnet-core
COPY wwwroot ./wwwroot
// @endif

// @if jest || karma
# RUN UNIT TESTS
RUN au test
// @endif

// @if e2e
# RUN E2E TESTS
RUN npm run e2e
// @endif

# build
FROM build-stage as publish-stage
RUN npm run build

# production stage
FROM nginx:alpine as production-stage
COPY nginx.conf /etc/nginx/nginx.conf
WORKDIR /usr/share/nginx/html

// @if webpack && !dotnet-core
COPY --from=publish-stage /app/dist/ .
// @endif

// @if webpack && dotnet-core
COPY --from=publish-stage /app/wwwroot/dist/ .
// @endif

// @if cli-bundler && dotnet-core
COPY --from=publish-stage /app/wwwroot/ .
// @endif

// @if cli-bundler && !dotnet-core
COPY --from=publish-stage /app/scripts/ ./scripts/
COPY --from=publish-stage /app/index.html/ .
// @endif
// @if scaffold-navigation && cli-bundler && !dotnet-core
COPY --from=publish-stage /app/@fortawesome/ ./@fortawesome/
// @endif

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
